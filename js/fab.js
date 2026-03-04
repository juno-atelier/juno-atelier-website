/**
 * fab.js — Floating Action Button: scroll-to-top + scroll-to-bottom
 * Juno Atelier · Vanilla HTML/CSS/JS
 *
 * Integration:
 *   1. Import in main.js:  import { initScrollFab } from './fab.js';
 *   2. Call after DOM is ready: initScrollFab();
 *   3. The FAB HTML is injected by this module — no HTML edits needed.
 *
 * Dependencies:
 *   - utils.js  →  smoothScrollTo(id)   (already in your project)
 *   - fab.css   →  must be linked in <head> of each page
 *
 * @module fab
 */

import { smoothScrollTo } from './utils.js';

/* ── Constants ──────────────────────────────────────────────────────────── */

/** Scroll depth (px) before FAB appears */
const SHOW_THRESHOLD = 120;

/** How close to the bottom (px) before marking "at bottom" state */
const BOTTOM_THRESHOLD = 60;

/** Passive scroll listener option — improves mobile performance */
const PASSIVE = { passive: true };


/* ── State ──────────────────────────────────────────────────────────────── */
let fab       = null;
let btnUp     = null;
let btnDown   = null;
let cleanupFn = null;


/* ── DOM Builder ─────────────────────────────────────────────────────────── */

/**
 * Creates and injects the FAB HTML into <body>.
 * Returns the container element.
 *
 * @returns {HTMLElement}
 */
function buildFab() {
  const container = document.createElement('div');
  container.className  = 'scroll-fab';
  container.setAttribute('role',       'group');
  container.setAttribute('aria-label', 'Page scroll controls');

  container.innerHTML = `
    <!-- Scroll to Top -->
    <button
      class="scroll-fab__btn scroll-fab__btn--up"
      aria-label="Scroll to top of page"
      data-tooltip="Top"
      type="button"
    >
      <!-- Up chevron -->
      <svg xmlns="http://www.w3.org/2000/svg"
           width="18" height="18"
           fill="none" viewBox="0 0 24 24"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" focusable="false">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>

    <!-- Visual divider pip -->
    <span class="scroll-fab__pip" aria-hidden="true"></span>

    <!-- Scroll to Bottom -->
    <button
      class="scroll-fab__btn scroll-fab__btn--down"
      aria-label="Scroll to bottom of page"
      data-tooltip="Bottom"
      type="button"
    >
      <!-- Down chevron -->
      <svg xmlns="http://www.w3.org/2000/svg"
           width="18" height="18"
           fill="none" viewBox="0 0 24 24"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" focusable="false">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  `;

  document.body.appendChild(container);
  return container;
}


/* ── Scroll Helpers ─────────────────────────────────────────────────────── */

/**
 * Smoothly scrolls to the very top of the page.
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Smoothly scrolls to the very bottom of the page.
 * Uses the document height so it works on all page lengths.
 */
function scrollToBottom() {
  window.scrollTo({
    top:      document.documentElement.scrollHeight,
    behavior: 'smooth',
  });
}

/**
 * Returns true if the user is near the bottom of the page.
 *
 * @returns {boolean}
 */
function isNearBottom() {
  const scrolled   = window.scrollY + window.innerHeight;
  const total      = document.documentElement.scrollHeight;
  return total - scrolled < BOTTOM_THRESHOLD;
}


/* ── Scroll Handler ─────────────────────────────────────────────────────── */

/**
 * Updates FAB visibility and at-bottom state on every scroll event.
 */
function onScroll() {
  const scrolled = window.scrollY;

  /* Show / hide the FAB */
  if (scrolled > SHOW_THRESHOLD) {
    fab.classList.add('scroll-fab--visible');
  } else {
    fab.classList.remove('scroll-fab--visible');
  }

  /* Dim the down-arrow when already at the bottom */
  if (isNearBottom()) {
    fab.classList.add('scroll-fab--at-bottom');
  } else {
    fab.classList.remove('scroll-fab--at-bottom');
  }
}


/* ── Public API ─────────────────────────────────────────────────────────── */

/**
 * Initialises the scroll FAB.
 * Safe to call multiple times — destroys any previous instance first.
 *
 * @returns {void}
 */
export function initScrollFab() {
  // Tear down any previous instance cleanly
  destroyScrollFab();

  // Build and inject the FAB
  fab     = buildFab();
  btnUp   = fab.querySelector('.scroll-fab__btn--up');
  btnDown = fab.querySelector('.scroll-fab__btn--down');

  // Wire up click handlers
  btnUp.addEventListener('click',   scrollToTop);
  btnDown.addEventListener('click', scrollToBottom);

  // Wire up scroll watcher
  window.addEventListener('scroll', onScroll, PASSIVE);

  // Run once immediately to set initial state
  onScroll();

  // Store cleanup reference
  cleanupFn = () => {
    btnUp.removeEventListener('click',   scrollToTop);
    btnDown.removeEventListener('click', scrollToBottom);
    window.removeEventListener('scroll', onScroll);
  };
}

/**
 * Removes the FAB from the DOM and clears all event listeners.
 * Call this if you need to tear down the component (e.g. SPA navigation).
 *
 * @returns {void}
 */
export function destroyScrollFab() {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }
  if (fab && fab.parentNode) {
    fab.parentNode.removeChild(fab);
  }
  fab = btnUp = btnDown = null;
}