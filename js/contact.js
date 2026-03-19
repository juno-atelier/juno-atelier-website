/**
 * contact.js — Contact page: EmailJS integration + form validation + FAQ
 * Juno Atelier · hello@jatelier.art
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  CREDENTIALS — ALL CONFIRMED ✅
 *  SERVICE_ID   service_eltzq6q     (Gmail relay — junoatelier36@gmail.com)
 *  TEMPLATE_ID  template_qg3yprn   (Contact Us template)
 *  PUBLIC_KEY   t8_SCVMkdjQm6KwLe  (EmailJS account public key)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════════════════
   1 · EmailJS Configuration
══════════════════════════════════════════════════════════════════════════════ */

const EMAILJS_CONFIG = {
  SERVICE_ID:  'service_eltzq6q',
  TEMPLATE_ID: 'template_qg3yprn',
  PUBLIC_KEY:  't8_SCVMkdjQm6KwLe',
};


/* ══════════════════════════════════════════════════════════════════════════════
   2 · Public entry-point
   Called by main.js via safeInit().
══════════════════════════════════════════════════════════════════════════════ */

export function initContact() {
  if (!document.getElementById('contact-form')) return;

  initEmailJS();
  initContactForm();
  initFAQ();              // ← NEW: accordion for the FAQ section
  initAuditButtons();
  initPhoneTracking();
  initScrollAnimations();
  initSocialTracking();
  initResponseNote();
  initPaymentTooltips();
  injectNotificationStyles();
}


/* ══════════════════════════════════════════════════════════════════════════════
   3 · EmailJS Initialisation
══════════════════════════════════════════════════════════════════════════════ */

function initEmailJS() {
  if (typeof window.emailjs === 'undefined') {
    console.error(
      '[Juno Atelier] EmailJS SDK not found. ' +
      'Check that the CDN <script> tag is present in contact.html.'
    );
    return;
  }
  window.emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
}


/* ══════════════════════════════════════════════════════════════════════════════
   4 · Contact Form — Validation + EmailJS Send
══════════════════════════════════════════════════════════════════════════════ */

function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('contact-submit');
  const formNotice = document.getElementById('form-notice');

  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const nameError    = document.getElementById('name-error');
  const emailError   = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  if (!form || !submitBtn) return;

  /* ── Validation helpers ── */

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isNotEmpty   = (v) => v && v.trim() !== '';

  function clearAllErrors() {
    [nameInput, emailInput, messageInput].forEach((el) => {
      el?.classList.remove('error');
    });
    [nameError, emailError, messageError].forEach((el) => {
      if (el) el.textContent = '';
    });
    hideNotice();
  }

  function setFieldError(fieldEl, errorEl, message) {
    fieldEl?.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function validateForm() {
    let valid = true;

    if (!isNotEmpty(nameInput?.value)) {
      setFieldError(nameInput, nameError, 'Please enter your full name.');
      valid = false;
    }

    if (!isNotEmpty(emailInput?.value)) {
      setFieldError(emailInput, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(emailInput.value)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    }

    if (!isNotEmpty(messageInput?.value)) {
      setFieldError(messageInput, messageError, 'Please tell us about your project.');
      valid = false;
    }

    return valid;
  }

  /* ── UI state helpers ── */

  function setLoadingState(isLoading) {
    submitBtn.disabled    = isLoading;
    submitBtn.ariaBusy    = String(isLoading);
    submitBtn.textContent = isLoading
      ? (submitBtn.dataset.loadingText || '⏳ Sending…')
      : (submitBtn.dataset.defaultText || 'Send Message');
  }

  /* ── Toast notification (floating top-right) ── */

  function showToast(message, type /* 'success' | 'error' */) {
    const existing = document.getElementById('ja-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id        = 'ja-toast';
    toast.className = `ja-toast ja-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const icon    = type === 'success' ? '✓' : '✕';
    const heading = type === 'success' ? 'Message Sent!' : 'Send Failed';

    toast.innerHTML = `
      <div class="ja-toast__icon">${icon}</div>
      <div class="ja-toast__body">
        <p class="ja-toast__heading">${heading}</p>
        <p class="ja-toast__message">${message}</p>
      </div>
      <button class="ja-toast__close" aria-label="Dismiss notification">✕</button>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('ja-toast--visible'));

    toast.querySelector('.ja-toast__close').addEventListener('click', () => {
      dismissToast(toast);
    });

    const autoDismiss = setTimeout(() => dismissToast(toast), type === 'success' ? 6000 : 10000);
    toast._autoDismiss = autoDismiss;
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    clearTimeout(toast._autoDismiss);
    toast.classList.remove('ja-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  /* ── Inline form notice ── */

  function showNotice(message, type) {
    if (!formNotice) return;
    formNotice.textContent = message;
    formNotice.className   = `form-notice form-notice--${type}`;
    formNotice.removeAttribute('hidden');
    formNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideNotice() {
    if (!formNotice) return;
    formNotice.setAttribute('hidden', '');
    formNotice.textContent = '';
    formNotice.className   = 'form-notice';
  }

  /* ── Submit handler ── */

  async function handleSubmit(e) {
    e.preventDefault();
    clearAllErrors();

    if (!validateForm()) {
      const firstError = form.querySelector('.form-input.error, .form-textarea.error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError?.focus({ preventScroll: true });
      return;
    }

    if (typeof window.emailjs === 'undefined') {
      const msg = 'Email service unavailable. Please reach us at hello@jatelier.art.';
      showNotice(`⚠ ${msg}`, 'error');
      showToast(msg, 'error');
      return;
    }

    setLoadingState(true);

    try {
      await window.emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        form,
        { publicKey: EMAILJS_CONFIG.PUBLIC_KEY }
      );

      const successMsg = "We'll be in touch within 24–48 hours.";
      showNotice(`✓ Message sent! ${successMsg}`, 'success');
      showToast(successMsg, 'success');
      form.reset();
      setTimeout(hideNotice, 8000);

    } catch (error) {
      console.error('[Juno Atelier] EmailJS error:', error);
      const errMsg = getErrorMessage(error);
      showNotice(errMsg, 'error');
      showToast(errMsg, 'error');

    } finally {
      setLoadingState(false);
    }
  }

  form.addEventListener('submit', handleSubmit);

  /* ── Real-time blur validation ── */

  nameInput?.addEventListener('blur', () => {
    if (isNotEmpty(nameInput.value)) {
      nameInput.classList.remove('error');
      if (nameError) nameError.textContent = '';
    }
  });

  emailInput?.addEventListener('blur', () => {
    if (isNotEmpty(emailInput.value) && isValidEmail(emailInput.value)) {
      emailInput.classList.remove('error');
      if (emailError) emailError.textContent = '';
    }
  });

  messageInput?.addEventListener('blur', () => {
    if (isNotEmpty(messageInput.value)) {
      messageInput.classList.remove('error');
      if (messageError) messageError.textContent = '';
    }
  });
}

/* ── Error code → human-readable message ── */

function getErrorMessage(error) {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }
  switch (error?.status) {
    case 400:
      return 'There was a problem with your submission. Please check your details and try again.';
    case 401:
    case 403:
      return 'Email service configuration error. Please contact us at hello@jatelier.art.';
    case 412:
      return 'Email service not yet active. Please reach us at hello@jatelier.art.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return 'Message could not be sent. Please try again or email hello@jatelier.art.';
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   5 · FAQ Accordion
   ──────────────────────────────────────────────────────────────────────────
   Accordion behaviour — one panel open at a time.
   Uses aria-expanded on the button and hidden on the answer panel so the
   interaction is fully accessible to screen readers and keyboard users.
   The CSS handles the +/× icon rotation via the aria-expanded attribute.
══════════════════════════════════════════════════════════════════════════════ */

function initFAQ() {
  const faqList = document.querySelector('.faq-list');
  if (!faqList) return;

  const items = Array.from(faqList.querySelectorAll('.faq-item'));

  items.forEach((item) => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    /* Keyboard support — Enter and Space already fire click on <button>,
       but we also handle arrow keys for convenience.                     */
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[items.indexOf(item) + 1];
        next?.querySelector('.faq-question')?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[items.indexOf(item) - 1];
        prev?.querySelector('.faq-question')?.focus();
      }
    });

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all other open panels first */
      items.forEach((otherItem) => {
        if (otherItem === item) return;
        const otherBtn    = otherItem.querySelector('.faq-question');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.hidden = true;
      });

      /* Toggle this panel */
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        /* Scroll answer into view on small screens */
        setTimeout(() => {
          answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  });
}


/* ══════════════════════════════════════════════════════════════════════════════
   6 · Notification Styles (injected once into <head>)
   These are kept here so the styles travel with the JS module.
   If you prefer, copy the CSS into contact.css and delete this function.
══════════════════════════════════════════════════════════════════════════════ */

function injectNotificationStyles() {
  if (document.getElementById('ja-notification-styles')) return;

  const style = document.createElement('style');
  style.id = 'ja-notification-styles';
  style.textContent = `

    /* ── Inline form notice ── */
    .form-notice {
      display: flex;
      align-items: flex-start;
      gap: .6rem;
      margin-top: 1rem;
      padding: .9rem 1.1rem;
      border-radius: 8px;
      font-size: .9rem;
      font-weight: 500;
      line-height: 1.5;
    }
    .form-notice--success {
      background: #f0faf4;
      color: #1E3D42;
      border: 1px solid #1E3D42;
    }
    .form-notice--error {
      background: #fdf2f0;
      color: #E2725B;
      border: 1px solid #E2725B;
    }

    /* ── Disabled submit button ── */
    .contact-submit-btn:disabled {
      opacity: .7;
      cursor: not-allowed;
    }

    /* ── Response note ── */
    .form-response-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .35rem;
      margin-top: 1rem;
      padding: .5rem 1rem;
      background: rgba(30, 61, 66, .05);
      border-radius: 999px;
      color: #1E3D42;
      font-size: .85rem;
      font-weight: 500;
    }

    /* ── Toast notification ── */
    .ja-toast {
      position: fixed; top: 1.25rem; right: 1.25rem; z-index: 9999;
      display: flex; align-items: flex-start; gap: .75rem;
      min-width: 280px; max-width: 380px;
      padding: 1rem 1.1rem; border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      opacity: 0; transform: translateX(110%);
      transition: opacity .35s ease, transform .35s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events: none;
    }
    .ja-toast--visible { opacity: 1; transform: translateX(0); pointer-events: auto; }
    .ja-toast--success { background: #1E3D42; border-left: 4px solid #E1AD01; color: #FDF6E9; }
    .ja-toast--error   { background: #fff2f0; border-left: 4px solid #E2725B; color: #2F2F2F; }

    .ja-toast__icon {
      flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .85rem; font-weight: 700;
    }
    .ja-toast--success .ja-toast__icon { background: #E1AD01; color: #1E3D42; }
    .ja-toast--error   .ja-toast__icon { background: #E2725B; color: #fff;    }

    .ja-toast__body { flex: 1; }
    .ja-toast__heading { font-size: .88rem; font-weight: 700; margin: 0 0 .2rem; line-height: 1.2; }
    .ja-toast--success .ja-toast__heading { color: #E1AD01; }
    .ja-toast--error   .ja-toast__heading { color: #E2725B; }
    .ja-toast__message { font-size: .82rem; margin: 0; line-height: 1.4; opacity: .85; }

    .ja-toast__close {
      flex-shrink: 0; background: none; border: none; cursor: pointer;
      font-size: .75rem; padding: 2px 4px; border-radius: 3px;
      opacity: .55; transition: opacity .2s ease;
    }
    .ja-toast--success .ja-toast__close { color: #FDF6E9; }
    .ja-toast--error   .ja-toast__close { color: #2F2F2F; }
    .ja-toast__close:hover { opacity: 1; }

    @media (max-width: 480px) {
      .ja-toast {
        top: auto; bottom: 1rem; right: 1rem; left: 1rem;
        max-width: 100%; transform: translateY(120%);
      }
      .ja-toast--visible { transform: translateY(0); }
    }
  `;

  document.head.appendChild(style);
}


/* ══════════════════════════════════════════════════════════════════════════════
   7 · Secondary Inits
══════════════════════════════════════════════════════════════════════════════ */

function initAuditButtons() {
  document.querySelectorAll(
    '.contact-cta-btn, [aria-label="Book a brand audit"]'
  ).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (btn.getAttribute('href') === '#') {
        e.preventDefault();
        alert(
          'Thank you for your interest! Our booking link will be available soon. ' +
          'For now, please use the contact form or email hello@jatelier.art.'
        );
      }
    });
  });
}

function initPhoneTracking() {
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener('click', () => {
      console.log('[Analytics] Phone tapped:', link.getAttribute('href'));
    });
  });
}

function initScrollAnimations() {
  const cards = document.querySelectorAll(
    '.contact-method-card, .contact-info-card, .contact-cta-card'
  );
  if (!cards.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  cards.forEach((card) => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

function initSocialTracking() {
  document.querySelectorAll('.contact-social-item, .social-link').forEach((link) => {
    link.addEventListener('click', () => {
      console.log('[Analytics] Social clicked:', link.textContent.trim().toLowerCase());
    });
  });
}

function initResponseNote() {
  const container = document.querySelector('.contact-form-container');
  if (!container || document.querySelector('.form-response-note')) return;

  const note = document.createElement('div');
  note.className = 'form-response-note';
  note.setAttribute('aria-hidden', 'true');
  note.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 4v4l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span>We respond within 24–48 hours</span>
  `;
  container.appendChild(note);
}

function initPaymentTooltips() {
  document.querySelectorAll('.payment-tag').forEach((tag) => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform  = 'scale(1.05)';
      tag.style.transition = 'transform .2s ease';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = 'scale(1)';
    });
  });
}