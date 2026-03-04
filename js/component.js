// =============================================================================
//  components.js — Modular Component Loader + Navigation Logic
//  Juno Atelier · Vanilla JS · No dependencies
//  Version: 3.0
// =============================================================================
//
//  HOW IT WORKS:
//  ─────────────────────────────────────────────────────────────────────────
//  Uses fetch() to load components/navbar.html and components/footer.html
//  and injects them into #navbar-placeholder and #footer-placeholder divs.
//  After injection it runs all interactive JS (active link, mobile drawer,
//  sticky header, copyright year).
//
//  REPLACES: navbar.js — all hamburger, drawer, and active-link logic from
//  that file has been merged here. You can safely delete navbar.js.
//
//  CHANGE LOG v3.0 — Sticky Navbar Unification
//  ─────────────────────────────────────────────────────────────────────────
//  · initStickyHeader() has been REWRITTEN as the single scroll handler for
//    the header. It replaces both the old initStickyHeader() (v2) in this
//    file AND initStickyNavbar() in main.js.
//
//  · The old version attached a raw scroll listener that wrote to the DOM
//    on every scroll event — up to 60–120 writes per second on fast devices.
//    The new version gates all DOM writes behind requestAnimationFrame,
//    coalescing rapid scroll events into one write per paint frame.
//
//  · A lastScrolled guard prevents no-op classList.toggle() calls when
//    the scroll state hasn't changed, further reducing layout thrashing.
//
//  · The single .is-scrolled class on .site-header now drives BOTH the
//    visual shadow/border enhancement AND the compact height collapse
//    (via .site-header.is-scrolled .nav-inner in navbar.css). The old
//    .site-header--compact class from styles.css §11 is no longer used
//    and should be deleted from styles.css.
//
//  ACTION REQUIRED IN main.js:
//    Delete initStickyNavbar() and remove its safeInit() call from initApp().
//    Leaving both handlers active will re-introduce the duplicate listener.
//
//  LOCAL DEVELOPMENT NOTE:
//  ─────────────────────────────────────────────────────────────────────────
//  fetch() requires a server — opening HTML files directly as file://
//  will block the request. Use one of:
//
//    VS Code:  Install "Live Server" → right-click HTML → Open with Live Server
//    Terminal: npx serve .
//              OR: python3 -m http.server 8080
// =============================================================================


// =============================================================================
//  SECTION 1 — UTILITIES
// =============================================================================

/**
 * Shorthand querySelector helpers (mirrors utils.js qs/qsa pattern).
 */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/**
 * Resolves the correct path prefix so the script works from any folder depth.
 * Root pages  (index.html)          → prefix = ""
 * Nested pages (blog/article.html)  → prefix = "../"
 */
function getPathPrefix() {
    const path        = window.location.pathname;
    const NESTED_DIRS = ['blog', 'case-studies', 'articles'];
    const isNested    = NESTED_DIRS.some(dir => path.includes(`/${dir}/`));
    return isNested ? '../' : '';
}


/**
 * Fetches an HTML partial and injects it into a target element.
 *
 * @param {string} url      — Path to the HTML partial
 * @param {string} selector — CSS selector of the placeholder element
 * @returns {Promise<boolean>} — true on success, false on failure
 */
async function loadComponent(url, selector) {
    const target = qs(selector);
    if (!target) {
        console.warn(`[Juno] Placeholder "${selector}" not found on this page.`);
        return false;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status} — ${url}`);
        target.innerHTML = await response.text();
        return true;
    } catch (err) {
        console.error(`[Juno] Failed to load "${url}":`, err);
        return false;
    }
}


// =============================================================================
//  SECTION 2 — MOBILE DRAWER STATE
//  Ported from navbar.js — full cleanup pattern preserved.
// =============================================================================

/** Module-level references, set once the navbar is in the DOM */
let _header       = null;
let _hamburgerBtn = null;
let _mobileDrawer = null;
let _isMenuOpen   = false;

/** Stores cleanup functions so every listener can be removed cleanly */
const _cleanups = [];


/**
 * Syncs all DOM state to match _isMenuOpen.
 * Updates ARIA attributes, classes, and button label.
 */
function syncMenuState() {
    if (!_hamburgerBtn || !_mobileDrawer) return;

    _hamburgerBtn.setAttribute('aria-expanded', String(_isMenuOpen));
    _hamburgerBtn.setAttribute('aria-label', _isMenuOpen ? 'Close menu' : 'Open menu');
    _hamburgerBtn.classList.toggle('is-open', _isMenuOpen);

    _mobileDrawer.setAttribute('aria-hidden', String(!_isMenuOpen));
    _mobileDrawer.classList.toggle('is-open', _isMenuOpen);
}

function openMenu() {
    _isMenuOpen = true;
    document.body.style.overflow = 'hidden';
    syncMenuState();
}

function closeMenu() {
    _isMenuOpen = false;
    document.body.style.overflow = '';
    syncMenuState();
}

function toggleMenu() {
    _isMenuOpen ? closeMenu() : openMenu();
}


// =============================================================================
//  SECTION 3 — NAVBAR INITIALISERS
// =============================================================================

/**
 * Marks the correct nav link as active based on the current filename.
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    qsa('.nav-link[data-page], .mobile-nav-link[data-page]').forEach(link => {
        const isActive = link.getAttribute('data-page') === currentPage;
        link.classList.toggle('is-active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
}


/**
 * findHeader()
 * Queries the header by CLASS (.site-header) with an ID fallback.
 * The navbar.html component uses class="site-header" — querying by ID
 * alone returned null and silently prevented scroll handlers from attaching.
 */
function findHeader() {
    return qs('#site-header') || qs('.site-header');
}


// =============================================================================
//  SECTION 3-B — UNIFIED STICKY HEADER
//  v3.0 rewrite — replaces both the old initStickyHeader() (components.js v2)
//  AND initStickyNavbar() (main.js) to eliminate duplicate scroll listeners.
//
//  KEY IMPROVEMENTS OVER v2:
//  ─────────────────────────────────────────────────────────────────────────
//  1. requestAnimationFrame gate — all DOM writes are deferred to the next
//     paint frame. Rapid scroll events are coalesced into a single write,
//     preventing forced synchronous reflows at 60–120 events/sec.
//
//  2. lastScrolled guard — classList.toggle() is only called when the boolean
//     state has genuinely changed (scroll crossed the threshold in either
//     direction). No-op writes that trigger style recalculation are eliminated.
//
//  3. One class, two effects — .is-scrolled on .site-header drives both the
//     shadow/border enhancement (navbar.css .site-header.is-scrolled) AND
//     the compact height collapse (navbar.css .site-header.is-scrolled .nav-inner).
//     The old .site-header--compact class is retired.
//
//  4. Clean teardown — the handler reference is stored on
//     window._junoStickyHandler so any re-initialisation (e.g. SPA navigation)
//     removes the stale listener before attaching a fresh one.
// =============================================================================

/**
 * SCROLL_THRESHOLD — distance in px from the top of the page before the
 * header enters its "scrolled" state. 10px feels immediate without being
 * triggered by accidental micro-scrolls on touch devices.
 */
const SCROLL_THRESHOLD = 10;

/**
 * initStickyHeader()
 *
 * Attaches a single passive scroll listener that:
 *  • adds/removes .is-scrolled on .site-header
 *  • gates all DOM writes behind requestAnimationFrame
 *  • skips no-op writes via a lastScrolled boolean guard
 *  • stores the handler for clean teardown on re-init
 *  • runs immediately on page load so state is correct before any scroll
 */
function initStickyHeader() {
    _header = findHeader();

    if (!_header) {
        console.warn('[Juno] initStickyHeader: .site-header not found in DOM.');
        return;
    }

    let rafId        = null;   // pending rAF handle — used to coalesce events
    let lastScrolled = null;   // last known boolean state — prevents no-op writes

    /**
     * applyScrollState()
     * Called by rAF — runs in the next paint frame.
     * Reads scroll position and writes to the DOM exactly once per frame.
     */
    function applyScrollState() {
        rafId = null; // rAF has fired; clear the handle so next event can queue

        const scrolled = window.scrollY > SCROLL_THRESHOLD;

        // Guard: only touch the DOM when state has actually changed
        if (scrolled === lastScrolled) return;
        lastScrolled = scrolled;

        _header.classList.toggle('is-scrolled', scrolled);
    }

    /**
     * onScroll()
     * Passive scroll handler — schedules a single rAF write per animation frame.
     * Coalesces all scroll events that fire before the next paint into one call.
     */
    function onScroll() {
        if (rafId) return;                              // already queued — skip
        rafId = requestAnimationFrame(applyScrollState);
    }

    // ── Teardown: remove any stale listener from a previous initialization ──
    if (window._junoStickyHandler) {
        window.removeEventListener('scroll', window._junoStickyHandler, { passive: true });
    }

    // ── Store and attach the new handler ────────────────────────────────────
    window._junoStickyHandler = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Run immediately to reflect correct state on first paint (no flash) ──
    applyScrollState();
}


/**
 * Initialises all mobile drawer interactivity after navbar.html is in the DOM.
 *
 * @returns {function} destroyNavbar — call to remove all listeners on teardown
 */
function initMobileMenu() {
    _header       = findHeader();
    _hamburgerBtn = qs('#hamburger-btn');
    _mobileDrawer = qs('#mobile-drawer');

    if (!_hamburgerBtn || !_mobileDrawer) {
        console.warn('[Juno] initMobileMenu: hamburger or drawer element not found.');
        return () => {};
    }

    // ── 1. Hamburger button click ───────────────────────────────────────────
    function onHamburgerClick() {
        toggleMenu();
    }
    _hamburgerBtn.addEventListener('click', onHamburgerClick);
    _cleanups.push(() => _hamburgerBtn.removeEventListener('click', onHamburgerClick));

    // ── 2. Mobile nav / CTA links — close drawer on navigation ─────────────
    function onMobileNavClick(e) {
        const link = e.target.closest('.mobile-nav-link, .mobile-cta-wrap .cta-btn');
        if (link && _isMenuOpen) closeMenu();
    }
    _mobileDrawer.addEventListener('click', onMobileNavClick);
    _cleanups.push(() => _mobileDrawer.removeEventListener('click', onMobileNavClick));

    // ── 3. Outside click — click anywhere outside the header closes drawer ──
    function onDocumentClick(e) {
        if (!_isMenuOpen) return;
        if (_header && _header.contains(e.target)) return;
        closeMenu();
    }
    document.addEventListener('click', onDocumentClick, { capture: true });
    _cleanups.push(() => document.removeEventListener('click', onDocumentClick, { capture: true }));

    // ── 4. Escape key — close and return focus to hamburger (WCAG 2.1) ──────
    function onKeydown(e) {
        if (e.key === 'Escape' && _isMenuOpen) {
            closeMenu();
            _hamburgerBtn.focus();
        }
    }
    document.addEventListener('keydown', onKeydown);
    _cleanups.push(() => document.removeEventListener('keydown', onKeydown));

    // ── 5. Responsive — close drawer when resizing to desktop width ─────────
    const mq = window.matchMedia('(max-width: 767px)');
    function onMqChange(e) {
        if (!e.matches && _isMenuOpen) closeMenu();
    }
    mq.addEventListener('change', onMqChange);
    _cleanups.push(() => mq.removeEventListener('change', onMqChange));

    // Sync initial DOM state
    syncMenuState();

    return function destroyNavbar() {
        _cleanups.forEach(fn => fn());
        _cleanups.length = 0;
        _isMenuOpen = false;
    };
}


// =============================================================================
//  SECTION 4 — FOOTER INITIALISERS
// =============================================================================

/**
 * Writes the current year into #footer-year after footer.html is injected.
 */
function initFooterYear() {
    const el = qs('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
}


// =============================================================================
//  SECTION 5 — MAIN INITIALISATION
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {

    const prefix = getPathPrefix();

    // Load navbar and footer in parallel for performance
    const [navLoaded, footerLoaded] = await Promise.all([
        loadComponent(`${prefix}components/navbar.html`, '#navbar-placeholder'),
        loadComponent(`${prefix}components/footer.html`, '#footer-placeholder'),
    ]);

    // ── Post-injection: navbar behaviours ────────────────────────────────────
    if (navLoaded) {
        setActiveNavLink();   // highlight current page link
        initMobileMenu();     // hamburger, drawer, outside-click, Escape, resize
        initStickyHeader();   // unified rAF-gated scroll handler (v3.0)
    }

    // ── Post-injection: footer behaviours ────────────────────────────────────
    if (footerLoaded) {
        initFooterYear();     // auto copyright year
    }

    console.log('[Juno] Components loaded and initialised (v3.0).');
});