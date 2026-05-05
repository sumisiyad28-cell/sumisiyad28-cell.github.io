/* ==========================================================
   SCROLL PROGRESS + NAVBAR
   ========================================================== */
const scrollProgress = document.getElementById('scrollProgress');
const navbar         = document.getElementById('navbar');
const backToTop      = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;

  navbar.classList.toggle('scrolled', scrollTop > 50);
  backToTop.classList.toggle('visible', scrollTop > 400);
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ==========================================================
   HAMBURGER / MOBILE NAV
   ========================================================== */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function closeNav() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  navOverlay.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navOverlay.addEventListener('click', closeNav);
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeNav));

/* ==========================================================
   INTERSECTION OBSERVER — FADE-IN
   ========================================================== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || '0', 10);
    setTimeout(() => entry.target.classList.add('visible'), delay);
    fadeObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach((el, i) => {
  el.dataset.delay = (i % 5) * 80;
  fadeObserver.observe(el);
});

/* ==========================================================
   LANGUAGE BAR ANIMATION
   ========================================================== */
const langFills = document.querySelectorAll('.lang-fill');
langFills.forEach(fill => { fill.style.width = '0'; });

const langObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  langFills.forEach((fill, i) => {
    setTimeout(() => {
      fill.style.width = fill.dataset.width;
    }, 150 + i * 120);
  });
  langObserver.disconnect();
}, { threshold: 0.4 });

const langGrid = document.querySelector('.lang-grid');
if (langGrid) langObserver.observe(langGrid);

/* ==========================================================
   ACTIVE NAV LINK ON SCROLL
   ========================================================== */
const sections = document.querySelectorAll('section[id]');
const navItems  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.35 });

sections.forEach(section => sectionObserver.observe(section));

/* ==========================================================
   MOLECULAR CANVAS ANIMATION
   ========================================================== */
(function initCanvas() {
  const canvas = document.getElementById('molecularCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let rafId;

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    initParticles();
  }

  // Crimson palette variants for particles
  const COLORS = [
    [232, 25,  44],  // vivid crimson
    [255, 77, 109],  // light crimson
    [168,  0,  30],  // dark crimson
    [255,143,163],   // pale pink-red
  ];

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x    = Math.random() * canvas.width;
      this.y    = init ? Math.random() * canvas.height : (Math.random() < 0.5 ? -6 : canvas.height + 6);
      this.vx   = (Math.random() - 0.5) * 0.45;
      this.vy   = (Math.random() - 0.5) * 0.45;
      this.r    = Math.random() * 2.5 + 1.2;
      this.o    = Math.random() * 0.55 + 0.2;
      this.col  = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -8)                this.x = canvas.width  + 8;
      if (this.x > canvas.width  + 8) this.x = -8;
      if (this.y < -8)                this.y = canvas.height + 8;
      if (this.y > canvas.height + 8) this.y = -8;
    }

    draw() {
      const [r,g,b] = this.col;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.o})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const area  = canvas.width * canvas.height;
    const count = Math.min(90, Math.max(30, Math.floor(area / 11000)));
    particles   = Array.from({ length: count }, () => new Particle());
  }

  const MAX_DIST = 130;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(232,25,44,${alpha})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(rafId); resize(); draw(); });
  draw();
})();
