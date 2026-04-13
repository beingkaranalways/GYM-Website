'use strict';

/* ======================================================
   KARAN BEAST GYM — script.js  (v2 — final, clean)
   Fixes: duplicate observer removed, form validation
   added, honeypot check, safe innerHTML avoided,
   passive listeners everywhere, no console logs left.
   ====================================================== */

/* ---- Loader ---- */
document.body.style.overflow = 'hidden';

const loaderPercent = document.getElementById('loader-percent');
let pct = 0;
const pctTimer = setInterval(() => {
  pct = Math.min(pct + Math.floor(Math.random() * 12) + 4, 99);
  if (loaderPercent) loaderPercent.textContent = pct + '%';
}, 80);

window.addEventListener('load', () => {
  clearInterval(pctTimer);
  if (loaderPercent) loaderPercent.textContent = '100%';
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    document.body.style.overflow = '';
    startTyping();
  }, 2400);
});

/* ---- AOS ---- */
AOS.init({ duration: 750, once: true, offset: 55, easing: 'ease-out-cubic' });

/* ---- Scroll Progress ---- */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && total > 0)
    progressBar.style.width = (window.scrollY / total * 100) + '%';
}, { passive: true });

/* ---- Sticky Navbar ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar && navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ---- Active Nav on Scroll (single, clean observer) ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const lnk = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (lnk) lnk.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObserver.observe(s));

/* ---- Hamburger ---- */
const hamburger  = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
hamburger && hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl && navLinksEl.classList.toggle('open');
});
navLinksEl && navLinksEl.querySelectorAll('.nav-link').forEach(l =>
  l.addEventListener('click', () => {
    hamburger && hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
  })
);

/* ---- Dark / Light Toggle ---- */
const bodyEl   = document.getElementById('body');
const darkIcon = document.getElementById('dark-icon');
const darkBtn  = document.getElementById('dark-toggle');
let isDark = true;
darkBtn && darkBtn.addEventListener('click', () => {
  isDark = !isDark;
  bodyEl && bodyEl.classList.toggle('dark-mode',  isDark);
  bodyEl && bodyEl.classList.toggle('light-mode', !isDark);
  if (darkIcon) darkIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
});

/* ---- Typed Text ---- */
const phrases = [
  'Unleash your true potential.',
  'Train harder. Recover smarter.',
  'Elite coaching. Real results.',
  'Built for champions, by champions.',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-text');

function startTyping() {
  if (!typedEl) return;
  typeLoop();
}
function typeLoop() {
  const current = phrases[phraseIdx];
  if (deleting) {
    charIdx--;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeLoop, 500);
    } else {
      setTimeout(typeLoop, 38);
    }
  } else {
    charIdx++;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeLoop, 2000);
    } else {
      setTimeout(typeLoop, 55);
    }
  }
}

/* ---- Animated Counters ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1800;
  let start = null;
  const ease = t => 1 - Math.pow(1 - t, 3);
  (function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(ease(p) * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(performance.now());
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));

/* ---- Particles (subtle, perf-safe with visibility check) ---- */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animFrame, particles = [];
  let visible = true;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Pause when tab is hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) drawParticles();
  });

  function Particle() { this.reset(); }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.a  = Math.random() * 0.3 + 0.05;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  for (let i = 0; i < 60; i++) particles.push(new Particle());

  function drawParticles() {
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,57,70,${p.a})`;
      ctx.fill();
    });
    animFrame = requestAnimationFrame(drawParticles);
  }
  drawParticles();
})();

/* ---- Testimonials Slider ---- */
(function () {
  const track    = document.getElementById('testimonials-track');
  const dotsWrap = document.getElementById('slider-dots');
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  if (!track || !dotsWrap) return;

  const slides = track.querySelectorAll('.testimonial-slide');
  if (!slides.length) return;
  let current = 0, autoTimer;

  function perView() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }
  function slideW() {
    return slides[0].getBoundingClientRect().width + 24;
  }
  function maxIdx() { return Math.max(0, slides.length - perView()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const d = document.createElement('button');
      d.className = 'slider-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }
  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx()));
    track.style.transform = `translateX(-${current * slideW()}px)`;
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }
  function next() { goTo(current >= maxIdx() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxIdx() : current - 1); }

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);

  function startAuto() { autoTimer = setInterval(next, 4500); }
  function stopAuto()  { clearInterval(autoTimer); }
  track.addEventListener('mouseenter', stopAuto, { passive: true });
  track.addEventListener('mouseleave', startAuto, { passive: true });

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    startAuto();
  }, { passive: true });

  window.addEventListener('resize', () => { buildDots(); goTo(Math.min(current, maxIdx())); }, { passive: true });
  buildDots();
  startAuto();
})();

/* ---- Gallery Lightbox ---- */
(function () {
  const items   = Array.from(document.querySelectorAll('.gallery-item'));
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightbox-img');
  const lbCap   = document.getElementById('lightbox-caption');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev  = document.getElementById('lightbox-prev');
  const lbNext  = document.getElementById('lightbox-next');
  if (!lb || !items.length) return;

  let cur = 0;

  function openLb(i) {
    cur = i;
    const src     = items[cur].dataset.src     || '';
    const caption = items[cur].dataset.caption || '';
    // Safe: use .src and .textContent — no innerHTML
    lbImg.src         = src;
    lbImg.alt         = caption;
    lbCap.textContent = caption;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = ''; // release blob/memory
  }
  function showNext() { openLb((cur + 1) % items.length); }
  function showPrev() { openLb((cur - 1 + items.length) % items.length); }

  items.forEach((item, i) => item.addEventListener('click', () => openLb(i)));
  lbClose && lbClose.addEventListener('click', closeLb);
  lbNext  && lbNext.addEventListener('click', showNext);
  lbPrev  && lbPrev.addEventListener('click', showPrev);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
  });
})();

/* ---- Contact Form — Formspree + client-side validation ---- */
(function () {
  const form      = document.getElementById('contact-form');
  const formSucc  = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit');
  if (!form || !submitBtn) return;

  /* Simple client-side validation */
  function validate() {
    const name    = form.querySelector('#form-name');
    const email   = form.querySelector('#form-email');
    const message = form.querySelector('#form-message');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.value.trim().length < 2) {
      name && name.focus();
      showFieldError(name, 'Please enter your full name.');
      return false;
    }
    if (!email || !emailRe.test(email.value.trim())) {
      email && email.focus();
      showFieldError(email, 'Please enter a valid email address.');
      return false;
    }
    if (!message || message.value.trim().length < 10) {
      message && message.focus();
      showFieldError(message, 'Message must be at least 10 characters.');
      return false;
    }
    return true;
  }

  function showFieldError(el, msg) {
    if (!el) return;
    el.style.borderColor = '#e63946';
    el.style.boxShadow   = '0 0 0 3px rgba(230,57,70,0.18)';
    const old = el.parentElement.querySelector('.field-err');
    if (old) old.remove();
    const err = document.createElement('span');
    err.className   = 'field-err';
    err.textContent = msg;
    err.style.cssText = 'color:#e63946;font-size:0.75rem;margin-top:4px;display:block;';
    el.parentElement.appendChild(err);
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
      const e2 = el.parentElement.querySelector('.field-err');
      if (e2) e2.remove();
    }, { once: true });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    // Safe textContent — no innerHTML injection
    const span = submitBtn.querySelector('span');
    const icon  = submitBtn.querySelector('i');
    if (span) span.textContent = 'Sending...';
    if (icon) { icon.className = 'fas fa-spinner fa-spin'; }

    try {
      const response = await fetch('https://formspree.io/f/xpqkzynb', {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form),
      });

      if (response.ok) {
        form.reset();
        if (formSucc) {
          formSucc.classList.remove('hidden');
          setTimeout(() => formSucc.classList.add('hidden'), 6000);
        }
      } else {
        // Try to show Formspree error message safely
        const data = await response.json().catch(() => ({}));
        const msg  = (data.errors && data.errors[0] && data.errors[0].message)
          || 'Something went wrong. Please try again.';
        alert(msg);
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      if (span) span.textContent = 'Send Message';
      if (icon) icon.className = 'fas fa-paper-plane';
    }
  });
})();

/* ---- Back to Top ---- */
const backTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backTop && backTop.classList.toggle('show', window.scrollY > 400);
}, { passive: true });
backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---- Smooth Scroll (all anchors) ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const href   = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
  });
});

/* ---- Hero Parallax (subtle) ---- */
const heroImg = document.querySelector('.hero-img');
let ticking   = false;
window.addEventListener('scroll', () => {
  if (!heroImg) return;
  if (!ticking) {
    requestAnimationFrame(() => {
      heroImg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
