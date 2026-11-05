'use strict';

/* =========================
   THÈME CLAIR / SOMBRE
   ========================= */
(function () {
  const root = document.documentElement;
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn || !icon) return;

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    const isLight = theme === 'light';
    icon.className = isLight ? 'bx bx-moon' : 'bx bx-sun';
    btn.setAttribute('aria-label', isLight ? 'Passer en thème sombre' : 'Passer en thème clair');
  }

  apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', next); } catch (e) {}
    apply(next);
  });

  // Suit le thème du système tant qu'aucun choix manuel n'est mémorisé
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) apply(e.matches ? 'light' : 'dark');
  });
})();

/* =========================
   NAVBAR
   ========================= */
(function () {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const icon     = document.getElementById('navIcon');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  });

  toggle && toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    icon.className = isOpen ? 'bx bx-x' : 'bx bx-menu';
  });

  navLinks && navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      icon.className = 'bx bx-menu';
    });
  });

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 120;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (!link) return;
      const active = sec.offsetTop <= scrollY && sec.offsetTop + sec.offsetHeight > scrollY;
      link.classList.toggle('active', active);
    });
  }
})();

/* =========================
   RADAR CANVAS
   ========================= */
(function () {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let angle = 0;
  let dots  = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    generateDots(45);
  }

  function generateDots(n) {
    dots = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.min(cx, cy) * 0.9;
    for (let i = 0; i < n; i++) {
      const r = Math.random() * maxR;
      const a = Math.random() * Math.PI * 2;
      dots.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), a, r, alpha: 0.5 + Math.random() * 0.5, size: Math.random() * 2 + 1 });
    }
  }

  function draw() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.min(cx, cy) * 0.9;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cercles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (maxR / 5) * i, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(74,222,128,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Lignes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a));
      ctx.strokeStyle = 'rgba(74,222,128,0.06)';
      ctx.stroke();
    }

    // Sweep
    const sweepAngle = Math.PI / 2.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const sweep = ctx.createLinearGradient(0, 0, maxR, 0);
    sweep.addColorStop(0, 'rgba(74,222,128,0.35)');
    sweep.addColorStop(1, 'rgba(74,222,128,0)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxR, -sweepAngle / 2, sweepAngle / 2);
    ctx.closePath();
    ctx.fillStyle = sweep;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxR, 0);
    ctx.strokeStyle = 'rgba(74,222,128,0.65)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Points
    dots.forEach(dot => {
      let diff = (dot.a - angle + Math.PI * 4) % (Math.PI * 2);
      const fade = diff < 0.3 ? 1 : Math.max(0, 1 - diff / (Math.PI * 1.2));
      const a = fade * dot.alpha;
      if (a < 0.01) return;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,222,128,${a})`;
      ctx.fill();
      if (a > 0.5) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,222,128,${a * 0.2})`;
        ctx.fill();
      }
    });

    angle = (angle + 0.008) % (Math.PI * 2);
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

/* =========================
   SKILL LEVEL BARS (scroll reveal)
   ========================= */
const lvlObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.lvl-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      lvlObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll('.skill-card-v2').forEach(card => lvlObserver.observe(card));

/* =========================
   SKILL CARD TOGGLE
   ========================= */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.skill-toggle');
  if (!btn) return;
  const card = btn.closest('.skill-card-v2');
  if (!card) return;

  // Fermer les autres
  document.querySelectorAll('.skill-card-v2.open').forEach(el => {
    if (el !== card) {
      el.classList.remove('open');
      const b = el.querySelector('.skill-toggle');
      if (b) b.textContent = 'En savoir plus…';
    }
  });

  card.classList.toggle('open');
  btn.textContent = card.classList.contains('open') ? 'Voir moins' : 'En savoir plus…';
});

/* =========================
   DOCUMENTS FILTER
   ========================= */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const docCards   = document.querySelectorAll('.doc-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Mettre à jour les boutons actifs
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filtrer les cartes
      docCards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden', !match);
        // Ré-animer à l'apparition
        if (match) {
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        }
      });
    });
  });
})();

/* =========================
   TIMELINE REVEAL
   ========================= */
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.timeline-item').forEach(item => timelineObserver.observe(item));

/* =========================
   SCROLL REVEAL (cartes)
   ========================= */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.kstat, .context-card, .gallery-item, .edu-card, .astat, .doc-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});

/* =========================
   LIGHTBOX
   ========================= */
(function () {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  const lbCounter = document.getElementById('lbCounter');
  const items     = Array.from(document.querySelectorAll('.gallery-item'));
  let current     = 0;

  if (!lightbox || !items.length) return;

  function show() {
    const item = items[current];
    lbImg.src = item.dataset.src;
    lbImg.alt = item.querySelector('img').alt;
    lbCaption.textContent = item.dataset.caption || '';
    lbCounter.textContent = `${current + 1} / ${items.length}`;
  }
  function open(idx) {
    current = idx; show();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', () => open(idx));
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => { if (e.key === 'Enter') open(idx); });
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  lbPrev.addEventListener('click', e => { e.stopPropagation(); current = (current - 1 + items.length) % items.length; show(); });
  lbNext.addEventListener('click', e => { e.stopPropagation(); current = (current + 1) % items.length; show(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  { current = (current - 1 + items.length) % items.length; show(); }
    if (e.key === 'ArrowRight') { current = (current + 1) % items.length; show(); }
  });
})();
