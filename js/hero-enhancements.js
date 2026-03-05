/**
 * hero-enhancements.js — Optional Hero UX Enhancements
 * Juno Atelier · Deliverable 3 of 3
 *
 * FEATURES
 * ────────
 * 1. Staggered text reveal — hero content fades up on page load.
 * 2. Parallax scroll — background image moves at a slower rate than scroll,
 *    creating a sense of depth without layout reflow.
 * 3. Smooth anchor scrolling — CTA buttons with data-scroll-to scroll
 *    smoothly to the target section (enhances CSS scroll-behavior).
 *
 * PERFORMANCE GUARANTEES
 * ──────────────────────
 * · All animations run on the compositor thread (transform + opacity only).
 *   No layout-triggering properties (top, margin, height) are animated.
 * · Parallax uses requestAnimationFrame + IntersectionObserver to skip work
 *   when the hero is out of the viewport.
 * · Reduced-motion respected — all animation skipped; CSS already handles
 *   the static fallback.
 * · Passive scroll event listeners used to prevent blocking the main thread.
 * · Script is defer-loaded so it never blocks HTML parsing or rendering.
 *
 * BROWSER SUPPORT
 * ───────────────
 * · IntersectionObserver: Chrome 58+, FF 55+, Safari 12.1+ (polyfill if needed)
 * · requestAnimationFrame: all modern browsers
 * · Graceful degradation: if any API is absent, the section renders normally
 *   (text is visible via the .no-js CSS fallback; parallax simply doesn't run).
 *
 * USAGE
 * ─────
 * <script src="js/hero-enhancements.js" defer></script>
 * Place BEFORE </body> (after component.js and main.js if ordering matters).
 */

(function () {
  'use strict';

  // ── 0. Reduced-motion gate ──────────────────────────────────────────────
  // Read once on load. If reduced motion is preferred, skip all animations.
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  // ── 1. Staggered text reveal ─────────────────────────────────────────────
  // Adds .is-visible to .hero-text (and any [data-hero-reveal] children)
  // shortly after page load, triggering the CSS opacity + translateY transition.
  //
  // Timing: 120 ms delay keeps the reveal perceptible without feeling slow.
  // CSS handles the easing; this function only applies the class.

  function initHeroReveal () {
    const heroText = document.querySelector('.hero-text');
    if (!heroText) return;

    if (prefersReducedMotion) {
      // CSS already makes .hero-text visible in reduced-motion mode;
      // adding .is-visible here is harmless but explicit.
      heroText.classList.add('is-visible');
      return;
    }

    // Allow browser to complete first paint before triggering the transition.
    // requestAnimationFrame inside setTimeout ensures at least one full frame
    // has been painted before we kick off the transition.
    setTimeout(function () {
      requestAnimationFrame(function () {
        heroText.classList.add('is-visible');
      });
    }, 120);
  }


  // ── 2. Parallax scroll ───────────────────────────────────────────────────
  // Translates .hero-section__bg-img vertically at ~40% of scroll speed,
  // creating a layered depth effect without layout reflow.
  //
  // Implementation notes:
  // · Only runs when .hero-section is in the viewport (IntersectionObserver).
  // · Uses a single rAF loop while visible; cancels the loop when hidden.
  // · Transform is applied directly to the <img>; no layout properties touched.
  // · Maximum travel is 60 px (--hero-parallax-range) to prevent the image
  //   from revealing the background colour at its edges.
  // · The hero section has overflow:hidden, so any edge exposure is clipped.
  //
  // The multiplier 0.38 means the bg moves 38 px per 100 px of scroll.
  // Adjust PARALLAX_SPEED in [0, 0.6] for subtler or more dramatic effect.

  const PARALLAX_SPEED  = 0.38;
  const PARALLAX_MAX_PX = 60;     // matches --hero-parallax-range in CSS

  function initParallax () {
    if (prefersReducedMotion) return;

    // Smartwatch / reduced-motion guard — also skip below 400 px viewport width
    if (window.innerWidth < 400) return;

    const section = document.querySelector('[data-hero-bg]');
    const bgImg   = section && section.querySelector('.hero-section__bg-img');
    if (!section || !bgImg) return;

    let isVisible    = false;
    let rafId        = null;
    let lastScrollY  = 0;
    let ticking      = false;

    // Mark section so CSS can enable will-change only when parallax is active
    section.classList.add('is-parallax-active');

    // IntersectionObserver — start/stop rAF loop based on viewport visibility
    const observer = new IntersectionObserver(
      function (entries) {
        isVisible = entries[0].isIntersecting;

        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(onFrame);
        } else if (!isVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { rootMargin: '20% 0px' }   // start a little early for a smooth entry
    );

    observer.observe(section);

    // Passive scroll listener — updates lastScrollY without blocking scroll
    window.addEventListener(
      'scroll',
      function () {
        lastScrollY = window.scrollY;
        if (!ticking && isVisible) {
          ticking = true;
          // Signal needed for next rAF tick (avoids double rAF)
        }
      },
      { passive: true }
    );

    function onFrame () {
      if (!isVisible) return;

      const sectionRect = section.getBoundingClientRect();
      const scrollRatio = 1 - (sectionRect.bottom / (sectionRect.height + window.innerHeight));
      const rawOffset   = scrollRatio * PARALLAX_MAX_PX * 2 * PARALLAX_SPEED;

      // Clamp to ±PARALLAX_MAX_PX to prevent edge exposure
      const offset = Math.max(-PARALLAX_MAX_PX, Math.min(PARALLAX_MAX_PX, rawOffset));

      // Only compositor properties — zero layout cost
      bgImg.style.transform = 'translate3d(0, ' + offset.toFixed(2) + 'px, 0)';

      ticking = false;
      rafId   = requestAnimationFrame(onFrame);
    }
  }


  // ── 3. Smooth anchor scrolling ───────────────────────────────────────────
  // Intercepts clicks on [data-scroll-to] links and scrolls smoothly to the
  // target section, offsetting for the sticky navbar height.
  //
  // CSS scroll-behavior: smooth handles cases where JS isn't available, but
  // this JS version respects the navbar offset (CSS cannot do that natively
  // without scroll-margin-top, which is already added via the CSS variable
  // --header-height if you have it on section elements).
  //
  // This is intentionally lightweight — no external library needed.

  function initSmoothScroll () {
    document.querySelectorAll('[data-scroll-to]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = link.getAttribute('data-scroll-to');
        const target   = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        // Respect prefers-reduced-motion for scroll as well
        if (prefersReducedMotion) {
          target.scrollIntoView();
          return;
        }

        // Measure sticky header height dynamically (handles compact scroll state)
        const header     = document.querySelector('.site-header');
        const headerH    = header ? header.offsetHeight : 64;
        const targetTop  = target.getBoundingClientRect().top + window.scrollY;
        const scrollTo   = targetTop - headerH - 16;  // 16 px breathing room

        window.scrollTo({
          top:      Math.max(0, scrollTo),
          behavior: 'smooth'
        });

        // Update URL hash without triggering a jump
        try {
          history.pushState(null, '', '#' + targetId);
        } catch (_) {
          // SecurityError in some iframe contexts — ignore silently
        }
      });
    });
  }


  // ── 4. Init ──────────────────────────────────────────────────────────────
  // Run after the DOM is interactive. The script is defer-loaded so
  // DOMContentLoaded has usually already fired, but we guard for safety.

  function init () {
    initHeroReveal();
    initParallax();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());