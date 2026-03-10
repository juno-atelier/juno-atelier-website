/**
 * services.js — Services page interactivity
 * Juno Atelier · Vanilla HTML/CSS/JS Conversion
 *
 * Handles category filtering, animations, and interactive elements
 *
 * @module services
 */

import { qs, qsa, debounce } from './utils.js';

/**
 * Initialize services page functionality
 * Named 'initServices' to match the import in main.js
 */
export function initServices() {
  // Only run on pages that have service cards
  if (!document.querySelector('.service-detailed-card, .package-card')) return;

  initCategoryFilter();
  initScrollAnimations();
  initPackageHoverEffects();
  updateCardMetaLayout();

  window.addEventListener('resize', debounce(updateCardMetaLayout, 150));
}


/* ──────────────────────────────────────────────────────────────
   Internal Helpers (private to this module)
────────────────────────────────────────────────────────────── */

/**
 * Category filtering for service cards
 * Updated to handle the new 'business-development' category
 */
function initCategoryFilter() {
  const filterButtons = qsa('.category-filter-btn');
  const serviceCards  = qsa('.service-detailed-card');

  if (!filterButtons.length || !serviceCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });

      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');

      const category = this.dataset.category;

      serviceCards.forEach(card => {
        // Show cards matching the category or all cards if 'all' is selected
        card.style.display =
          category === 'all' || card.dataset.category === category ? 'flex' : 'none';
      });

      // Also handle any category-specific notes or special elements
      const categoryNotes = qsa('.service-category-note');
      categoryNotes.forEach(note => {
        if (note.dataset.category) {
          note.style.display = 
            category === 'all' || note.dataset.category === category ? 'block' : 'none';
        }
      });

      animateGridUpdate();
    });
  });
}

/**
 * Smooth animation when filtering
 */
function animateGridUpdate() {
  const grid = qs('.services-complete-grid');
  if (!grid) return;

  grid.style.opacity    = '0.5';
  grid.style.transform  = 'scale(0.98)';
  grid.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

  setTimeout(() => {
    grid.style.opacity   = '1';
    grid.style.transform = 'scale(1)';
  }, 150);
}

/**
 * Scroll-based animations for service cards
 */
function initScrollAnimations() {
  const animatedElements = qsa(
    '.service-detailed-card, .package-card, .process-step, .industry-item, .retainer-tier-card'
  );
  if (!animatedElements.length) return;

  animatedElements.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animatedElements.forEach(el => observer.observe(el));
}

/**
 * Package card hover effects
 */
function initPackageHoverEffects() {
  qsa('.package-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      if (this.classList.contains('package-card--featured')) {
        this.style.transform = 'scale(1.02) translateY(-6px)';
      }
    });
    card.addEventListener('mouseleave', function () {
      if (this.classList.contains('package-card--featured')) {
        this.style.transform = 'scale(1.02) translateY(0)';
      }
    });
  });

  // Add hover effects for retainer cards
  qsa('.retainer-tier-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      if (this.classList.contains('retainer-tier-card--featured')) {
        this.style.transform = 'scale(1.02) translateY(-4px)';
      }
    });
    card.addEventListener('mouseleave', function () {
      if (this.classList.contains('retainer-tier-card--featured')) {
        this.style.transform = 'scale(1.02) translateY(0)';
      }
    });
  });
}

/**
 * Update service card meta layout based on viewport
 */
function updateCardMetaLayout() {
  const isMobile    = window.innerWidth <= 480;
  const serviceMeta = qsa('.service-detailed-meta');

  serviceMeta.forEach(meta => {
    meta.style.flexDirection = isMobile ? 'column' : 'row';
    meta.style.alignItems    = isMobile ? 'flex-start' : 'center';
  });
}