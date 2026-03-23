/**
 * hero-letter-glow.js — Sequential Letter Illumination
 * Juno Atelier · Vanilla ES Module
 *
 * WHAT IT DOES:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Reads the hero <h1> and splits every character (including those inside
 *    the <em> accent element) into individual <span> elements.
 * 2. Sets aria-label on the <h1> so screen readers get the full string —
 *    the character spans are all aria-hidden="true".
 * 3. Runs a staggered three-stage glow sequence:
 *      a. Add .hero-char--lit       → peak brightness burst
 *      b. (after glowDuration ms)  → add .hero-char--settled (CSS transition
 *         smoothly interpolates from burst → soft residual glow)
 * 4. Fires on page load by default; switch CONFIG.triggerOnScroll to true
 *    to use an IntersectionObserver instead.
 * 5. Immediately illuminates all chars (no glow) when prefers-reduced-motion
 *    is set, matching hero-letter-glow.css §4.
 *
 * INTEGRATION:
 * ─────────────────────────────────────────────────────────────────────────
 * In main.js, add:
 *   import { initHeroLetterGlow } from './hero-letter-glow.js';
 *   // inside initApp():
 *   safeInit('Hero Letter Glow', initHeroLetterGlow);
 *
 * CHANGE LOG:
 * v1 — Initial implementation
 */


/* ─────────────────────────────────────────────────────────────────────────
   CONFIG  ·  Tune these without touching the rest of the file
───────────────────────────────────────────────────────────────────────── */
const CONFIG = Object.freeze({
  delayPerChar:  100,  // was 65  — slower wave across letters
  glowDuration:  480,  // was 320 — longer peak burn per letter
  initialDelay:  500,  // was 380 — slight extra pause before it begins
  triggerOnScroll: false,
  scrollThreshold: 0.30,
});


/* ─────────────────────────────────────────────────────────────────────────
   INTERNAL HELPERS
───────────────────────────────────────────────────────────────────────── */

/**
 * Converts a Text node into a DocumentFragment of per-character <span>
 * elements, returning the fragment and a flat array of the spans produced.
 *
 * @param {Text}   textNode   — the DOM Text node to split
 * @param {string} colorClass — 'hero-char--white' | 'hero-char--accent'
 * @returns {{ fragment: DocumentFragment, spans: HTMLSpanElement[] }}
 */
function splitTextNode(textNode, colorClass) {
  const fragment = document.createDocumentFragment();
  const spans    = [];

  // Spread into an array so surrogate pairs / emoji stay intact as units
  ;[...textNode.textContent].forEach((char) => {
    const span       = document.createElement('span');
    span.className   = `hero-char ${colorClass}`;
    span.setAttribute('aria-hidden', 'true');
    span.textContent = char;

    // Whitespace spans hold layout but are excluded from the glow sequence
    if (char.trim() === '') {
      span.classList.add('hero-char--space');
    }

    fragment.appendChild(span);
    spans.push(span);
  });

  return { fragment, spans };
}

/**
 * Walks the <h1> DOM tree, replacing text nodes with per-character spans.
 * Preserves <em>, <br>, and any other child elements in place.
 *
 * @param {HTMLHeadingElement} heading
 * @returns {HTMLSpanElement[]} — ordered flat list of every character span
 */
function splitHeading(heading) {
  // Capture full text BEFORE we mutate the DOM — used as aria-label
  const fullText = heading.textContent.trim().replace(/\s+/g, ' ');
  heading.setAttribute('aria-label', fullText);

  const allSpans = [];

  /**
   * Recursive walker so we correctly handle arbitrarily nested markup
   * (even if future HTML adds a <strong> inside the <em>, etc.).
   *
   * @param {Node}   node       — current DOM node
   * @param {string} colorClass — inherited colour variant
   */
  function walk(node, colorClass) {
    if (node.nodeType === Node.TEXT_NODE) {
      const { fragment, spans } = splitTextNode(node, colorClass);
      allSpans.push(...spans);
      node.replaceWith(fragment);

    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // <em class="hero-heading__accent"> → switch to accent colour
      const isAccent = node.classList.contains('hero-heading__accent');
      const childColor = isAccent ? 'hero-char--accent' : colorClass;

      // Clone child list — live NodeList mutates as we replaceWith()
      ;[...node.childNodes].forEach((child) => walk(child, childColor));
    }
    // <br> and other non-text non-element nodes are left untouched
  }

  ;[...heading.childNodes].forEach((child) => walk(child, 'hero-char--white'));

  return allSpans;
}


/* ─────────────────────────────────────────────────────────────────────────
   ANIMATION ENGINE
───────────────────────────────────────────────────────────────────────── */

/**
 * Fires the three-stage glow sequence for every non-space character span.
 *
 * Stage 1 (t = initialDelay + i × delayPerChar):
 *   Add .hero-char--lit   → CSS immediately snaps/transitions to peak burst
 *
 * Stage 2 (t + glowDuration):
 *   Add .hero-char--settled → CSS transitions from peak burst to soft glow
 *
 * @param {HTMLSpanElement[]} spans
 */
function runGlowSequence(spans) {
  // Filter to only the animatable (non-space) spans, preserving order
  const animatable = spans.filter(
    (s) => !s.classList.contains('hero-char--space')
  );

  animatable.forEach((span, i) => {
    const litDelay     = CONFIG.initialDelay + i * CONFIG.delayPerChar;
    const settledDelay = litDelay + CONFIG.glowDuration;

    // Stage 1 — peak burst
    setTimeout(() => {
      span.classList.add('hero-char--lit');
    }, litDelay);

    // Stage 2 — settle to soft glow
    setTimeout(() => {
      span.classList.add('hero-char--settled');
    }, settledDelay);
  });
}

/**
 * Instant reveal used when prefers-reduced-motion is set.
 * Skips all timeouts; CSS §4 ensures no glow is rendered.
 *
 * @param {HTMLSpanElement[]} spans
 */
function revealInstant(spans) {
  spans.forEach((span) => {
    if (!span.classList.contains('hero-char--space')) {
      span.classList.add('hero-char--lit', 'hero-char--settled');
    }
  });
}


/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC INIT
───────────────────────────────────────────────────────────────────────── */

/**
 * Entry point — called from main.js via safeInit().
 *
 * @returns {void}
 */
export function initHeroLetterGlow() {
  const heading = document.getElementById('hero-heading');
  if (!heading) return;

  // Split heading into per-character spans
  const spans = splitHeading(heading);

  // Reduced-motion: skip animation entirely
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    revealInstant(spans);
    return;
  }

  if (CONFIG.triggerOnScroll) {
    // ── Scroll-triggered mode ──────────────────────────────────────────────
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runGlowSequence(spans);
            obs.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold: CONFIG.scrollThreshold }
    );
    observer.observe(heading);

  } else {
    // ── Auto-start on page load (default) ─────────────────────────────────
    runGlowSequence(spans);
  }
}