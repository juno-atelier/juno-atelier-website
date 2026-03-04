/**
 * main.js — Application Entry Point
 * Juno Atelier · Modular Vanilla JS Architecture
 *
 * Responsibilities:
 *  - Import all feature modules
 *  - Safely initialize them
 *  - Prevent one failure from breaking the entire app
 *  - Run after DOM is ready
 *
 * CHANGE LOG v3.0 — Sticky Navbar Unification
 * ─────────────────────────────────────────────────────────────────────────
 * REMOVED: initStickyNavbar()
 *
 * This function previously attached a second passive scroll listener to
 * .site-header, toggling .site-header--compact on scroll. It has been
 * removed because:
 *
 *  1. DUPLICATE HANDLER — components.js initStickyHeader() already attaches
 *     a scroll listener after navbar.html is injected into the DOM. Having
 *     two passive listeners firing on every scroll event for the same element
 *     caused redundant classList operations and unnecessary style recalculation
 *     at up to 120 events/second on high-refresh-rate displays.
 *
 *  2. STALE CLASS — .site-header--compact (styles.css §11) conflicted with
 *     .is-scrolled (navbar.css). Both targeted the header height and shadow,
 *     but via different CSS rules. The result was unpredictable cascade
 *     depending on which handler fired last.
 *
 *  3. CONSOLIDATED IN components.js — initStickyHeader() (v3.0) now handles
 *     BOTH the shadow/border enhancement (.is-scrolled) AND the compact height
 *     collapse (.is-scrolled .nav-inner in navbar.css), gated behind
 *     requestAnimationFrame with a lastScrolled guard to prevent no-op writes.
 *
 * If you need to adjust the scroll threshold or compact behaviour, edit:
 *  → components.js  SCROLL_THRESHOLD constant
 *  → navbar.css     .site-header.is-scrolled and .site-header.is-scrolled .nav-inner
 */


/* ──────────────────────────────────────────────────────────────
   Imports
────────────────────────────────────────────────────────────── */

// Core UI
import {
  initSectionObserver,
  initSmoothScrollLinks,
  onActiveSectionChange,
  watchScrollY,
} from './scroll.js';

// Scroll FAB — floating scroll-to-top / scroll-to-bottom button
import { initScrollFab } from './fab.js';

// Feature Modules
import { initPortfolio }  from './portfolio.js';
import { initServices }   from './services.js';
import { initContact }    from './contact.js';
import { initBrandAudit } from './brand-audit.js';

// Utilities (no side effects expected)
import './utils.js';


/* ──────────────────────────────────────────────────────────────
   Safe Module Initializer
   Prevents one module from crashing the entire app
────────────────────────────────────────────────────────────── */

function safeInit(label, fn) {
  try {
    if (typeof fn === 'function') {
      fn();
    }
  } catch (error) {
    console.error(`❌ Module failed: ${label}`, error);
  }
}


/* ──────────────────────────────────────────────────────────────
   REMOVED: initStickyNavbar()
   ──────────────────────────────────────────────────────────────
   Previously toggled .site-header--compact on scroll.
   Now handled exclusively by initStickyHeader() in components.js
   via the unified .is-scrolled class approach.

   DO NOT re-add this function here. Doing so will reintroduce
   a duplicate passive scroll listener and the class conflict
   described in the change log above.
────────────────────────────────────────────────────────────── */


/* ──────────────────────────────────────────────────────────────
   Footer Year
────────────────────────────────────────────────────────────── */

function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}


/* ──────────────────────────────────────────────────────────────
   Logo Fallback Handling
────────────────────────────────────────────────────────────── */

function initLogoFallbacks() {
  document.querySelectorAll('[data-logo-error] img').forEach((img) => {
    img.addEventListener('error', () => {
      const container = img.closest('[data-logo-error]');
      if (container && container.dataset.logoError) {
        container.classList.add(container.dataset.logoError);
      }
    });
  });
}


/* ──────────────────────────────────────────────────────────────
   Application Bootstrap
────────────────────────────────────────────────────────────── */

function initApp() {
  console.info('🚀 Juno Atelier App Initializing...');

  // ── Global UI helpers ──────────────────────────────────────
  safeInit('Footer Year',    initFooterYear);
  safeInit('Logo Fallbacks', initLogoFallbacks);

  // ── Navigation ─────────────────────────────────────────────
  //
  //    NOTE: Sticky navbar is intentionally NOT initialized here.
  //    initStickyHeader() runs inside components.js after navbar.html
  //    is fetched and injected — it needs the header element to exist
  //    in the DOM first. Calling it here (before injection completes)
  //    would result in findHeader() returning null and the handler
  //    silently not attaching.
  //
  safeInit('Smooth Scroll',    initSmoothScrollLinks);
  safeInit('Section Observer', initSectionObserver);

  // ── Scroll FAB ─────────────────────────────────────────────
  safeInit('Scroll FAB', initScrollFab);

  // ── Feature Modules (each guards internally) ───────────────
  safeInit('Portfolio',   initPortfolio);
  safeInit('Services',    initServices);
  safeInit('Contact',     initContact);
  safeInit('Brand Audit', initBrandAudit);

  console.info('✅ Juno Atelier App Loaded Successfully');
}


/* ──────────────────────────────────────────────────────────────
   DOM Ready Entry Point
   Handles both deferred and already-parsed DOM states
────────────────────────────────────────────────────────────── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM already parsed (e.g. script loaded with defer)
  initApp();
}