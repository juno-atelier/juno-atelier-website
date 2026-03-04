/**
 * utils.js — Helper functions and accessibility utilities
 * Juno Atelier · Vanilla HTML/CSS/JS Conversion
 *
 * @module utils
 */

/**
 * Smoothly scrolls to a section by ID, respecting prefers-reduced-motion.
 *
 * @param {string} targetId - The element ID to scroll to (without '#').
 * @returns {void}
 */
export function smoothScrollTo(targetId) {
  const el = document.getElementById(targetId);
  if (!el) {
    console.warn(`smoothScrollTo: element #${targetId} not found`);
    return;
  }
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'start',
  });
}

/**
 * Returns a debounced version of the provided function.
 *
 * @param {Function} fn - Function to debounce.
 * @param {number}   delay - Debounce delay in milliseconds.
 * @returns {Function} Debounced function with a .cancel() method.
 */
export function debounce(fn, delay = 150) {
  let timer = null;

  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }

  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Traps keyboard focus within a given container element.
 * Returns a cleanup function that removes the event listener.
 *
 * @param {HTMLElement} container - Element to trap focus within.
 * @returns {Function} Cleanup function.
 */
export function trapFocus(container) {
  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    const focusable = Array.from(container.querySelectorAll(FOCUSABLE));
    if (!focusable.length) { e.preventDefault(); return; }

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeydown);
  return () => container.removeEventListener('keydown', handleKeydown);
}

/**
 * Safely queries a DOM element and warns if not found.
 *
 * @param {string}       selector - CSS selector.
 * @param {ParentNode}  [parent=document] - Root to query within.
 * @returns {Element|null}
 */
export function qs(selector, parent = document) {
  const el = parent.querySelector(selector);
  if (!el) console.warn(`qs: no element matching "${selector}"`);
  return el;
}

/**
 * Safely queries all matching DOM elements.
 *
 * @param {string}       selector - CSS selector.
 * @param {ParentNode}  [parent=document] - Root to query within.
 * @returns {Element[]}
 */
export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}
