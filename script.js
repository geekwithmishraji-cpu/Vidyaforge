/* ================================================================
   VIDYAFORGE v3 — script.js
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   LOADER
---------------------------------------------------------------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('hidden');
  }, 1400);
});

/* ----------------------------------------------------------------
   THEME
---------------------------------------------------------------- */
const themeToggle = document.getElementById('themeToggle');
const htmlEl      = document.documentElement;

const savedTheme  = localStorage.getItem('vf-theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('vf-theme', next);
});

/* ----------------------------------------------------------------
   NAVBAR — scroll + active link
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 50);
  highlightNav();
}, { passive: true });

function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
}

/* ----------------------------------------------------------------
   HAMBURGER MENU
---------------------------------------------------------------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks?.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks?.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ----------------------------------------------------------------
   TYPING ANIMATION — hero roles
   UPDATE: edit the TYPING_WORDS array to change what cycles through
---------------------------------------------------------------- */
const typingTarget = document.getElementById('typingTarget');
const TYPING_WORDS = ['AI Builder', 'Product Architect', 'Systems Thinker', 'Digital Strategist'];
let si = 0, ci = 0, deleting = false;

function typeLoop() {
  if (!typingTarget) return;
  const word = TYPING_WORDS[si];
  typingTarget.textContent = deleting
    ? word.substring(0, ci - 1)
    : word.substring(0, ci + 1);

  if (!deleting) {
    ci++;
    if (ci === word.length) { deleting = true; return setTimeout(typeLoop, 1800); }
  } else {
    ci--;
    if (ci === 0) { deleting = false; si = (si + 1) % TYPING_WORDS.length; return setTimeout(typeLoop, 380); }
  }
  setTimeout(typeLoop, deleting ? 40 : 75);
}
typeLoop();

/* ----------------------------------------------------------------
   SCROLL REVEAL — lightweight IntersectionObserver
---------------------------------------------------------------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));

/* ----------------------------------------------------------------
   FORM UTILITY
---------------------------------------------------------------- */
function showStatus(el, type, msg) {
  if (!el) return;
  el.textContent = msg;
  el.className = el.id === 'qcStatus' ? `qc-status ${type}` : `form-status ${type}`;
  setTimeout(() => {
    el.className = el.id === 'qcStatus' ? 'qc-status' : 'form-status';
    el.textContent = '';
  }, 5000);
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function submitForm(form, statusEl, fields) {
  const { name, email, message } = fields;
  if (!name || !email || !message) {
    showStatus(statusEl, 'error', 'Please fill in all required fields.');
    return;
  }
  if (!isValidEmail(email)) {
    showStatus(statusEl, 'error', 'Please enter a valid email address.');
    return;
  }

  const btn     = form.querySelector('[type="submit"]');
  const btnText = btn?.querySelector('.btn-text');
  if (btnText) btnText.textContent = 'Sending…';
  if (btn) btn.disabled = true;

  // UPDATE: Replace with your Google Apps Script URL
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw-wFSCzme-XXP3FbzcsF4qatTa4cgGSpapypjbdiyJzznVvqXreTm5n-w8KvS8h5qpIQ/exec';

  fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify({
      name:    fields.name,
      email:   fields.email,
      service: fields.service || fields.type || '',
      message: fields.message
    })
  })
  .then(r => r.json())
  .then(d => d.result === 'success' ? onSuccess() : onError())
  .catch(onError);

  function onSuccess() {
    form.reset();
    showStatus(statusEl, 'success', '✓ Message received. I\'ll reply within 24 hours.');
    if (btnText) btnText.textContent = 'Send Message';
    if (btn) btn.disabled = false;
  }
  function onError() {
    showStatus(statusEl, 'error', 'Something went wrong. Email me directly at hello@vidyaforge.com');
    if (btnText) btnText.textContent = 'Send Message';
    if (btn) btn.disabled = false;
  }
}

/* ----------------------------------------------------------------
   QUICK CONTACT FORM (hero)
---------------------------------------------------------------- */
document.getElementById('quickForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  submitForm(form, document.getElementById('qcStatus'), {
    name:    form.querySelector('#qcName')?.value.trim(),
    email:   form.querySelector('#qcEmail')?.value.trim(),
    type:    form.querySelector('#qcType')?.value,
    message: form.querySelector('#qcMessage')?.value.trim(),
  });
});

/* ----------------------------------------------------------------
   CONTACT FORM (contact section)
---------------------------------------------------------------- */
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  submitForm(form, document.getElementById('formStatus'), {
    name:    form.querySelector('#cfName')?.value.trim(),
    email:   form.querySelector('#cfEmail')?.value.trim(),
    service: form.querySelector('#cfService')?.value,
    message: form.querySelector('#cfMessage')?.value.trim(),
  });
});

/* ----------------------------------------------------------------
   FOOTER YEAR
---------------------------------------------------------------- */
const fyEl = document.getElementById('footerYear');
if (fyEl) fyEl.textContent = new Date().getFullYear();

/* ----------------------------------------------------------------
   SMOOTH SCROLL — anchor links
---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
