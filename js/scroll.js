/**
 * scroll.js — Smooth scrolling and active section detection
 * Juno Atelier · Vanilla HTML/CSS/JS Conversion
 *
 * @module scroll
 */

import { smoothScrollTo, qsa } from './utils.js';

/** Sections to observe (IDs, no '#') */
const SECTION_IDS = ['work', 'services', 'process', 'about', 'contact'];

/** IntersectionObserver instance — kept for cleanup */
let sectionObserver = null;

/** Currently active section callbacks */
const activeSectionCallbacks = new Set();

/**
 * Registers a callback that fires whenever the active section changes.
 *
 * @param {function(string): void} callback - Receives the active section ID.
 * @returns {function(): void} Unregister function.
 */
export function onActiveSectionChange(callback) {
  activeSectionCallbacks.add(callback);
  return () => activeSectionCallbacks.delete(callback);
}

/**
 * Notify all registered callbacks with the new active section ID.
 *
 * @param {string} id - Section ID.
 */
function notifyActive(id) {
  activeSectionCallbacks.forEach((cb) => cb(id));
}

/**
 * Initialises the IntersectionObserver that detects which section is in view.
 * Call once on DOMContentLoaded.
 *
 * @returns {void}
 */
export function initSectionObserver() {
  if (sectionObserver) {
    sectionObserver.disconnect();
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          notifyActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    }
  );

  // Silently skip sections that don't exist on this page — expected on inner pages
  SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });
}

/**
 * Tears down the IntersectionObserver and clears callbacks.
 *
 * @returns {void}
 */
export function destroySectionObserver() {
  if (sectionObserver) {
    sectionObserver.disconnect();
    sectionObserver = null;
  }
  activeSectionCallbacks.clear();
}

/**
 * Attaches click listeners to all elements with [data-scroll-to].
 * Uses event delegation on document for efficiency.
 *
 * @returns {function(): void} Cleanup function.
 */
export function initSmoothScrollLinks() {
  /**
   * @param {MouseEvent} e
   */
  function handleClick(e) {
    const link = e.target.closest('[data-scroll-to]');
    if (!link) return;

    const targetId = link.dataset.scrollTo;
    if (!targetId) return;

    e.preventDefault();
    smoothScrollTo(targetId);
  }

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}

/**
 * Watches window scroll and fires a callback with the scrolled state (boolean).
 *
 * @param {function(boolean): void} callback
 * @param {number} [threshold=10] - Pixel threshold before marking as scrolled.
 * @returns {function(): void} Cleanup function.
 */
export function watchScrollY(callback, threshold = 10) {
  function onScroll() {
    callback(window.scrollY > threshold);
  }

  onScroll(); // fire immediately with current state
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}