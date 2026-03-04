/**
 * brand-audit.js — Brand Audit page specific interactions
 * Juno Atelier · Vanilla HTML/CSS/JS Conversion
 *
 * Handles:
 * 1. Sticky CTA on scroll
 * 2. Smooth scroll to contact section
 * 3. Animation triggers for cards
 * 4. Form validation helper (if needed)
 *
 * @module brand-audit
 */

'use strict';

/**
 * Initialize all brand audit page functionality
 * Exported so main.js can call it via safeInit()
 */
export function initBrandAudit() {
  // Only run on pages that have the audit hero section
  if (!document.querySelector('.audit-hero-section')) return;

  setupStickyCTA();
  setupCardHoverEffects();
  setupAuditCTATracking();
  setupIntersectionAnimations();
}


/* ──────────────────────────────────────────────────────────────
   Internal Helpers (not exported — private to this module)
────────────────────────────────────────────────────────────── */

/**
 * Creates a sticky CTA that appears when scrolling past hero
 */
function setupStickyCTA() {
  const heroSection = document.querySelector('.audit-hero-section');

  if (!heroSection) return;

  // Create sticky CTA element
  const stickyCTA = document.createElement('div');
  stickyCTA.className = 'sticky-audit-cta';
  stickyCTA.innerHTML = `
    <div class="sticky-cta-container">
      <span class="sticky-cta-text">Free 30-min brand audit</span>
      <a href="contact.html" class="cta-btn">Book Now</a>
    </div>
  `;

  document.body.appendChild(stickyCTA);

  // Add styles for sticky CTA dynamically
  const style = document.createElement('style');
  style.textContent = `
    .sticky-audit-cta {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--color-teal);
      color: var(--color-cream);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-pill);
      box-shadow: 0 10px 30px rgba(30, 61, 66, 0.3);
      z-index: 99;
      transform: translateY(200%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid var(--color-mustard);
    }

    .sticky-audit-cta.is-visible {
      transform: translateY(0);
    }

    .sticky-cta-container {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .sticky-cta-text {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .sticky-audit-cta .cta-btn {
      background: var(--color-mustard);
      color: var(--color-teal);
      font-size: 0.85rem;
      padding: 0.5rem 1.2rem;
      white-space: nowrap;
    }

    .sticky-audit-cta .cta-btn:hover {
      background: #f0b800;
    }

    @media (max-width: 767px) {
      .sticky-audit-cta {
        bottom: 1rem;
        right: 1rem;
        padding: 0.75rem 1rem;
      }

      .sticky-cta-container {
        gap: 1rem;
      }

      .sticky-cta-text {
        font-size: 0.8rem;
      }
    }

    @media (max-width: 480px) {
      .sticky-cta-text {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);

  // Intersection Observer to show/hide sticky CTA
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          stickyCTA.classList.add('is-visible');
        } else {
          stickyCTA.classList.remove('is-visible');
        }
      });
    },
    { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
  );

  observer.observe(heroSection);
}


/**
 * Adds subtle hover animations to audit cards
 */
function setupCardHoverEffects() {
  // Placeholder — CSS handles most hover states.
  // Extend here if JS-driven interactions are needed later.
  const cards = document.querySelectorAll(
    '.audit-card, .client-profile, .testimonial-card, .audit-step'
  );

  cards.forEach((card) => {
    card.addEventListener('mouseenter', function () {
      // Future JS hover logic goes here
    });
  });
}


/**
 * Tracks CTA clicks for analytics (console log for demo)
 */
function setupAuditCTATracking() {
  const ctas = document.querySelectorAll(
    '.primary-cta-buttons .cta-btn, .sticky-audit-cta .cta-btn'
  );

  ctas.forEach((cta) => {
    cta.addEventListener('click', function () {
      console.log(
        'CTA Clicked:',
        this.href,
        'from:',
        this.classList.contains('sticky-cta') ? 'sticky' : 'main'
      );
    });
  });
}


/**
 * Fades in elements as they scroll into view
 */
function setupIntersectionAnimations() {
  const animatedElements = document.querySelectorAll(
    '.definition-grid, .audit-card, .client-profile, .testimonial-card, .audit-step'
  );

  if (animatedElements.length === 0) return;

  const animStyle = document.createElement('style');
  animStyle.textContent = `
    .fade-in-on-scroll {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .fade-in-on-scroll.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(animStyle);

  animatedElements.forEach((el) => el.classList.add('fade-in-on-scroll'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  animatedElements.forEach((el) => observer.observe(el));
}


/**
 * Optional: Form validation helper if form is added later
 */
export function setupFormValidation(formElement) {
  if (!formElement) return;

  formElement.addEventListener('submit', function (e) {
    e.preventDefault();

    const name  = formElement.querySelector('#name');
    const email = formElement.querySelector('#email');

    if (name && !name.value.trim()) {
      alert('Please enter your name');
      name.focus();
      return false;
    }

    if (email && !email.value.trim()) {
      alert('Please enter your email');
      email.focus();
      return false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      alert('Please enter a valid email address');
      email.focus();
      return false;
    }

    alert("Thank you! We'll be in touch within 24-48 hours.");
    formElement.reset();
    return true;
  });
}