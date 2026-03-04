/**
 * contact.js — Contact page form validation and interactivity
 * Juno Atelier · Vanilla HTML/CSS/JS Conversion
 *
 * Handles form validation, error messages, and success notifications
 * based on Company Profile data.
 */

'use strict';

/**
 * Initialize all contact page functionality
 * Exported so main.js can call it via safeInit()
 */
export function initContact() {
  // Only run on pages that have the contact form
  if (!document.getElementById('contactForm') && 
      !document.querySelector('.contact-method-card')) return;

  initContactForm();
  initAuditButtons();
  initPhoneTracking();
  initScrollAnimations();
  initSocialTracking();
  initResponseNote();
  initPaymentTooltips();
}


/* ──────────────────────────────────────────────────────────────
   Internal Helpers (private to this module)
────────────────────────────────────────────────────────────── */

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const nameInput          = document.getElementById('name');
  const emailInput         = document.getElementById('email');
  const messageInput       = document.getElementById('message');
  const companyInput       = document.getElementById('company');
  const budgetSelect       = document.getElementById('budget');
  const projectTypeSelect  = document.getElementById('project-type');
  const newsletterCheckbox = document.getElementById('newsletter');

  const nameError    = document.getElementById('name-error');
  const emailError   = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const formNotice   = document.getElementById('form-notice');

  const validateEmail    = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateRequired = (value) => value && value.trim() !== '';

  const clearErrors = () => {
    [nameInput, emailInput, messageInput].forEach(input => {
      if (input) input.classList.remove('error');
    });
    [nameError, emailError, messageError].forEach(error => {
      if (error) error.textContent = '';
    });
    if (formNotice) {
      formNotice.classList.remove('success', 'error');
      formNotice.style.display = 'none';
      formNotice.textContent = '';
    }
  };

  const setFieldError = (field, errorElement, message) => {
    if (field)        field.classList.add('error');
    if (errorElement) errorElement.textContent = message;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;

    if (!validateRequired(nameInput?.value)) {
      setFieldError(nameInput, nameError, 'Please enter your full name');
      isValid = false;
    }

    if (!validateRequired(emailInput?.value)) {
      setFieldError(emailInput, emailError, 'Please enter your email address');
      isValid = false;
    } else if (!validateEmail(emailInput.value)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address');
      isValid = false;
    }

    if (!validateRequired(messageInput?.value)) {
      setFieldError(messageInput, messageError, 'Please enter your message');
      isValid = false;
    }

    if (isValid) {
      const formData = {
        name:        nameInput?.value         || '',
        email:       emailInput?.value        || '',
        company:     companyInput?.value      || '',
        budget:      budgetSelect?.value      || '',
        projectType: projectTypeSelect?.value || '',
        message:     messageInput?.value      || '',
        newsletter:  newsletterCheckbox?.checked || false,
      };

      console.log('Form submitted:', formData);

      if (formNotice) {
        formNotice.textContent = '✓ Message sent successfully! We will respond within 24-48 hours.';
        formNotice.classList.add('success');
        formNotice.style.display = 'block';
      }

      setTimeout(() => {
        contactForm.reset();
        setTimeout(() => {
          if (formNotice) {
            formNotice.style.display = 'none';
            formNotice.classList.remove('success');
          }
        }, 5000);
      }, 500);

      formNotice?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } else {
      const firstError = document.querySelector('.form-input.error, .form-textarea.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus({ preventScroll: true });
      }
    }
  };

  contactForm.addEventListener('submit', handleFormSubmit);

  // Real-time blur validation
  nameInput?.addEventListener('blur', () => {
    if (validateRequired(nameInput.value)) {
      nameInput.classList.remove('error');
      if (nameError) nameError.textContent = '';
    }
  });

  emailInput?.addEventListener('blur', () => {
    if (validateRequired(emailInput.value) && validateEmail(emailInput.value)) {
      emailInput.classList.remove('error');
      if (emailError) emailError.textContent = '';
    }
  });

  messageInput?.addEventListener('blur', () => {
    if (validateRequired(messageInput.value)) {
      messageInput.classList.remove('error');
      if (messageError) messageError.textContent = '';
    }
  });
}

function initAuditButtons() {
  const auditButtons = document.querySelectorAll(
    '.contact-cta-btn, [aria-label="Book a brand audit"]'
  );
  auditButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.getAttribute('href') === '#') {
        e.preventDefault();
        alert('Thank you for your interest! Our Calendly booking link will be available soon. For now, please use the contact form to reach us.');
      }
    });
  });
}

function initPhoneTracking() {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      console.log('Phone number clicked:', link.getAttribute('href'));
    });
  });
}

function initScrollAnimations() {
  const contactCards = document.querySelectorAll(
    '.contact-method-card, .contact-info-card, .contact-cta-card'
  );
  if (!contactCards.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  contactCards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

function initSocialTracking() {
  document.querySelectorAll('.contact-social-item, .social-link').forEach(link => {
    link.addEventListener('click', () => {
      const platform = link.textContent.trim().toLowerCase();
      console.log(`Social link clicked: ${platform}`);
    });
  });
}

function initResponseNote() {
  const contactFormContainer = document.querySelector('.contact-form-container');
  if (!contactFormContainer || document.querySelector('.form-response-note')) return;

  const responseTimeNote = document.createElement('div');
  responseTimeNote.className = 'form-response-note';
  responseTimeNote.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="display:inline; margin-right:4px; vertical-align:middle;">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 4v4l2 2" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span>We respond within 24-48 hours</span>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .form-response-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      margin-top: 1rem;
      padding: 0.5rem;
      background: rgba(30, 61, 66, 0.05);
      border-radius: var(--radius-pill);
      color: var(--color-teal);
      font-size: 0.85rem;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
  contactFormContainer.appendChild(responseTimeNote);
}

function initPaymentTooltips() {
  document.querySelectorAll('.payment-tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform  = 'scale(1.05)';
      tag.style.transition = 'transform 0.2s ease';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = 'scale(1)';
    });
  });
}