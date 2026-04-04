/* ================================================================
   VIDYAFORGE v2 — script.js
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   LOADER
---------------------------------------------------------------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('hidden');
  }, 1600);
});

/* ----------------------------------------------------------------
   THEME
---------------------------------------------------------------- */
const themeToggle = document.getElementById('themeToggle');
const htmlEl      = document.documentElement;

const savedTheme = localStorage.getItem('vf-theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('vf-theme', next);
});

/* ----------------------------------------------------------------
   CUSTOM CURSOR
---------------------------------------------------------------- */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  const followLoop = () => {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    cursorFollower.style.left = fx + 'px';
    cursorFollower.style.top  = fy + 'px';
    requestAnimationFrame(followLoop);
  };
  requestAnimationFrame(followLoop);

  document.querySelectorAll('a, button, .filter-btn, input, textarea, select, .project-card, .exp-card, .insight-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorFollower.style.width  = '52px';
      cursorFollower.style.height = '52px';
      cursorFollower.style.opacity = '0.25';
    });
    el.addEventListener('mouseleave', () => {
      cursorFollower.style.width  = '30px';
      cursorFollower.style.height = '30px';
      cursorFollower.style.opacity = '0.5';
    });
  });
}

/* ----------------------------------------------------------------
   NOISE CANVAS — subtle grain texture on hero
---------------------------------------------------------------- */
(function initNoise() {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function drawNoise() {
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 18; // very subtle alpha
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Redraw noise every 80ms for film-grain feel
  setInterval(drawNoise, 80);
  drawNoise();
})();

/* ----------------------------------------------------------------
   NAVBAR
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
  highlightNav();
}, { passive: true });

function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
}

/* ----------------------------------------------------------------
   HAMBURGER
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
   TYPING ANIMATION
   UPDATE: edit the array to change what cycles through
---------------------------------------------------------------- */
const typingTarget  = document.getElementById('typingTarget');
const TYPING_WORDS  = ['AI Builder', 'Product Architect', 'Systems Thinker', 'Execution Machine'];

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
    if (ci === 0) { deleting = false; si = (si + 1) % TYPING_WORDS.length; return setTimeout(typeLoop, 400); }
  }
  setTimeout(typeLoop, deleting ? 42 : 78);
}
typeLoop();

/* ----------------------------------------------------------------
   SCROLL REVEAL
---------------------------------------------------------------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));

/* ----------------------------------------------------------------
   STAT COUNTERS
---------------------------------------------------------------- */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const start  = performance.now();
  const dur    = 1200;
  const tick   = now => {
    const p    = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));

/* ----------------------------------------------------------------
   PROJECT FILTER
---------------------------------------------------------------- */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const cats = card.dataset.category || '';
      card.classList.toggle('hidden', filter !== 'all' && !cats.includes(filter));
    });
  });
});

/* ----------------------------------------------------------------
   FORM UTILITY
---------------------------------------------------------------- */
function showStatus(el, type, msg) {
  if (!el) return;
  el.textContent = msg;
  el.className   = `${el.className.replace(/\s?(success|error)/g, '')} ${type}`.trim();
  // Reset className base correctly
  el.className = el.id === 'qcStatus' ? `qc-status ${type}` : `form-status ${type}`;
  setTimeout(() => { el.className = el.id === 'qcStatus' ? 'qc-status' : 'form-status'; }, 5000);
}

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function submitForm(form, statusEl, fields) {
  const { name, email, message } = fields;
  if (!name || !email || !message) {
    showStatus(statusEl, 'error', 'Please fill in all required fields.');
    return;
  }
  if (!isEmail(email)) {
    showStatus(statusEl, 'error', 'Please enter a valid email address.');
    return;
  }

  const btn     = form.querySelector('[type="submit"]');
  const btnText = btn?.querySelector('.btn-text');
  if (btnText) btnText.textContent = 'Sending…';
  if (btn) btn.disabled = true;

  /*
   * ─────────────────────────────────────────────────────
   * CONNECT FORMSPREE (free, no backend):
   * 1. Sign up at formspree.io
   * 2. Get your form ID
   * 3. Replace the setTimeout below with:
   *
   * fetch('https://formspree.io/f/YOUR_ID', {
   *   method: 'POST',
   *   headers: { 'Accept': 'application/json' },
   *   body: new FormData(form)
   * })
   * .then(r => r.ok ? onSuccess() : onError())
   * .catch(onError);
   * ─────────────────────────────────────────────────────
   */
  setTimeout(() => { onSuccess(); }, 1000);

  function onSuccess() {
    form.reset();
    showStatus(statusEl, 'success', '✓  Message received. I\'ll respond within 24 hours.');
    if (btnText) btnText.textContent = 'Send Message';
    if (btn) btn.disabled = false;
  }
  function onError() {
    showStatus(statusEl, 'error', 'Something went wrong. Email me directly instead.');
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
    message: form.querySelector('#cfMessage')?.value.trim(),
  });
});

/* ----------------------------------------------------------------
   FOOTER YEAR
---------------------------------------------------------------- */
const fyEl = document.getElementById('footerYear');
if (fyEl) fyEl.textContent = new Date().getFullYear();

/* ----------------------------------------------------------------
   SMOOTH SCROLL (anchor fallback)
---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Disable right-click context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Disable common keyboard shortcuts (Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12)
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.key === 'u') ||
    (e.ctrlKey && e.key === 's') ||
    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
    (e.ctrlKey && e.shiftKey && e.key === 'J') ||
    (e.ctrlKey && e.shiftKey && e.key === 'C')
  ) {
    e.preventDefault();
  }
});

// Disable drag-select copying of text (optional — remove if you want text selectable)
document.addEventListener('selectstart', e => e.preventDefault());
