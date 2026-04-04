/* ================================================================
   VIDYAFORGE — script.js
   Handles: Loader, custom cursor, navbar, theme, typing animation,
   scroll reveals, stat counters, project filtering, contact form
================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. LOADER — fades out after fonts + assets ready
---------------------------------------------------------------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1500); // adjust timing if needed
});

/* ----------------------------------------------------------------
   2. THEME TOGGLE
   Persists choice in localStorage so it survives page refresh
---------------------------------------------------------------- */
const themeToggle  = document.getElementById('themeToggle');
const htmlEl       = document.documentElement;

// Apply saved theme on load
const savedTheme = localStorage.getItem('vf-theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('vf-theme', next);
});

/* ----------------------------------------------------------------
   3. CUSTOM CURSOR
   Disabled automatically on touch devices via CSS media query
---------------------------------------------------------------- */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower) {
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower with RAF
  const followCursor = () => {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(followCursor);
  };
  requestAnimationFrame(followCursor);

  // Scale cursor on interactive elements
  const interactiveEls = 'a, button, .filter-btn, input, textarea, .project-card, .exp-card';
  document.querySelectorAll(interactiveEls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorFollower.style.width  = '50px';
      cursorFollower.style.height = '50px';
      cursorFollower.style.opacity = '0.3';
    });
    el.addEventListener('mouseleave', () => {
      cursorFollower.style.width  = '32px';
      cursorFollower.style.height = '32px';
      cursorFollower.style.opacity = '0.6';
    });
  });
}

/* ----------------------------------------------------------------
   4. NAVBAR — scroll behavior + active link highlighting
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
  highlightActiveNav();
}, { passive: true });

function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ----------------------------------------------------------------
   5. HAMBURGER MENU (mobile)
---------------------------------------------------------------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks?.classList.toggle('open');
  document.body.style.overflow = navLinks?.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu when a link is clicked
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ----------------------------------------------------------------
   6. TYPING ANIMATION (hero roles)
   UPDATE: Add/remove strings from the array below
---------------------------------------------------------------- */
const typingTarget  = document.getElementById('typingTarget');
const typingStrings = [
  'AI Builder',
  'Product Architect',
  'Systems Thinker',
  'Execution Machine',
];

let   strIndex  = 0;
let   charIndex = 0;
let   isDeleting = false;
const typeSpeed  = 80;
const deleteSpeed = 45;
const pauseEnd   = 1800;
const pauseStart = 400;

function typeLoop() {
  if (!typingTarget) return;
  const current = typingStrings[strIndex];

  if (!isDeleting) {
    typingTarget.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, pauseEnd);
      return;
    }
  } else {
    typingTarget.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      strIndex = (strIndex + 1) % typingStrings.length;
      setTimeout(typeLoop, pauseStart);
      return;
    }
  }

  setTimeout(typeLoop, isDeleting ? deleteSpeed : typeSpeed);
}

typeLoop();

/* ----------------------------------------------------------------
   7. SCROLL REVEAL — IntersectionObserver
---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // animate once
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => {
  revealObserver.observe(el);
});

/* ----------------------------------------------------------------
   8. STAT COUNTERS — animate numbers when in viewport
---------------------------------------------------------------- */
const statNums = document.querySelectorAll('.stat-num');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1400;
  const start    = performance.now();

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };

  requestAnimationFrame(tick);
}

statNums.forEach(el => counterObserver.observe(el));

/* ----------------------------------------------------------------
   9. PROJECT FILTERING
   Data attribute: data-category="featured saas" etc.
---------------------------------------------------------------- */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCards.forEach(card => {
      const categories = card.getAttribute('data-category') || '';
      if (filter === 'all' || categories.includes(filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ----------------------------------------------------------------
   10. CONTACT FORM
   Currently shows a success message on submit.
   TO CONNECT TO A REAL BACKEND: replace the setTimeout block with
   a fetch() POST to your form endpoint (Formspree, EmailJS, etc.)
---------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name    = document.getElementById('name')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const message = document.getElementById('message')?.value.trim();

  // Basic validation
  if (!name || !email || !message) {
    showFormStatus('error', 'Please fill in your name, email, and message.');
    return;
  }

  if (!isValidEmail(email)) {
    showFormStatus('error', 'Please enter a valid email address.');
    return;
  }

  // Submit button loading state
  const submitBtn = contactForm.querySelector('[type="submit"]');
  const btnText   = submitBtn?.querySelector('.btn-text');
  if (btnText) btnText.textContent = 'Sending…';
  if (submitBtn) submitBtn.disabled = true;

  /*
   * -------------------------------------------------------
   * TO USE FORMSPREE (free tier, no backend needed):
   * 1. Create account at formspree.io
   * 2. Create a form, get your endpoint URL
   * 3. Replace the setTimeout block below with:
   *
   * fetch('https://formspree.io/f/YOUR_FORM_ID', {
   *   method: 'POST',
   *   headers: { 'Accept': 'application/json' },
   *   body: new FormData(contactForm)
   * })
   * .then(r => r.ok ? handleSuccess() : handleError())
   * .catch(handleError);
   * -------------------------------------------------------
   */

  // Placeholder success (replace with real fetch above)
  setTimeout(() => {
    handleSuccess();
    if (btnText) btnText.textContent = 'Send Message';
    if (submitBtn) submitBtn.disabled = false;
  }, 1000);

  function handleSuccess() {
    contactForm.reset();
    showFormStatus('success', '✓  Message received. I\'ll get back to you soon.');
  }

  function handleError() {
    showFormStatus('error', 'Something went wrong. Please email me directly.');
    if (btnText) btnText.textContent = 'Send Message';
    if (submitBtn) submitBtn.disabled = false;
  }
});

function showFormStatus(type, message) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className   = `form-status ${type}`;
  setTimeout(() => { formStatus.className = 'form-status'; }, 5000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ----------------------------------------------------------------
   11. FOOTER YEAR — auto-updates every year
---------------------------------------------------------------- */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ----------------------------------------------------------------
   12. SMOOTH SCROLL for anchor links (fallback for older browsers)
---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});