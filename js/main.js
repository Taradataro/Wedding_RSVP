// ---------- Nav scroll effect ----------
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ---------- Mobile hamburger ----------
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ---------- Active nav link ----------
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ---------- Countdown Timer (June 17, 2028) ----------
function updateCountdown() {
  const wedding = new Date('2028-06-17T15:00:00');
  const now = new Date();
  const diff = wedding - now;

  if (diff <= 0) {
    document.querySelectorAll('.countdown-block').forEach(b => b.style.display = 'none');
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val).padStart(2, '0');
  };
  set('cd-days', days);
  set('cd-hours', hours);
  set('cd-mins', mins);
  set('cd-secs', secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

// ---------- FAQ Accordion ----------
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ---------- Things To Do Tabs ----------
document.querySelectorAll('.things-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.things-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.things-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.tab);
    if (target) target.classList.add('active');
  });
});

// ---------- Lightbox ----------
document.querySelectorAll('.photo-item[data-src]').forEach(item => {
  item.addEventListener('click', () => {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (lb && img) { img.src = item.dataset.src; lb.classList.add('open'); }
  });
});
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('open');
    }
  });
}

// =====================================================
//  SPARKLE ANIMATION
//  - Gentle ambient sparkles always floating
//  - Click anywhere on hero to burst sprinkle
//  Palette: champagne, pistachio, white, sage gold
// =====================================================
(function () {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const rand = (a, b) => a + Math.random() * (b - a);

  // Sparkle colors: champagne, white-gold, pistachio, sage
  const COLORS = [
    'rgba(255,248,220,0.95)',  // warm white
    'rgba(200,184,154,0.90)',  // champagne
    'rgba(184,201,163,0.85)',  // pistachio
    'rgba(214,218,204,0.90)',  // pale sage
    'rgba(255,255,240,1.0)',   // ivory white
  ];

  // ── Particle pool ──────────────────────────────
  const particles = [];

  // Draw a 4-point star sparkle
  function drawStar(x, y, r, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    // outer 4 points
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const radius = i % 2 === 0 ? r : r * 0.3;
      i === 0
        ? ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
        : ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    // tiny center dot
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
    ctx.restore();
  }

  // ── Ambient sparkles (always present, subtle) ──
  function makeAmbient() {
    return {
      type:   'ambient',
      x:      rand(0, canvas.width),
      y:      rand(0, canvas.height),
      r:      rand(1.5, 4.5),
      color:  COLORS[Math.floor(rand(0, COLORS.length))],
      alpha:  0,
      life:   0,
      maxLife: rand(90, 200),  // frames
      phase:  rand(0, Math.PI * 2),
    };
  }

  // Seed ambient pool
  const AMBIENT_COUNT = 28;
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const p = makeAmbient();
    p.life = rand(0, p.maxLife); // stagger starts
    particles.push(p);
  }

  // ── Burst sparkles (on click) ──────────────────
  function makeBurst(x, y) {
    const count = Math.floor(rand(18, 28));
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.8, 4.5);
      particles.push({
        type:   'burst',
        x, y,
        vx:     Math.cos(angle) * speed,
        vy:     Math.sin(angle) * speed - rand(0.5, 1.5), // slight upward bias
        r:      rand(1.5, 5),
        color:  COLORS[Math.floor(rand(0, COLORS.length))],
        alpha:  1,
        life:   0,
        maxLife: rand(45, 90),
        gravity: 0.06,
      });
    }
  }

  // Click / tap handler
  canvas.style.pointerEvents = 'auto';
  canvas.style.cursor = 'crosshair';
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    makeBurst(e.clientX - rect.left, e.clientY - rect.top);
  });
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    makeBurst(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: false });

  // ── Main loop ──────────────────────────────────
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      if (p.type === 'ambient') {
        // Breathe in/out with sine wave
        const progress = p.life / p.maxLife;
        p.alpha = Math.sin(progress * Math.PI) * 0.75;
        drawStar(p.x, p.y, p.r, p.alpha, p.color);
        // Slight slow drift upward
        p.y -= 0.15;
        if (p.life >= p.maxLife) {
          // Respawn in new random position
          Object.assign(p, makeAmbient());
          p.life = 0;
        }

      } else if (p.type === 'burst') {
        const progress = p.life / p.maxLife;
        p.alpha = 1 - progress;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97; // gentle air resistance
        drawStar(p.x, p.y, p.r * (1 - progress * 0.4), p.alpha, p.color);
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
})();