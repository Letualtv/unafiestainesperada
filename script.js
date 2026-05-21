/* ============================================================
   HOBBITON PARTY — JS
   ============================================================ */

// ===== CANVAS DE ESTRELLAS =====
(function initStars() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');
  let stars    = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(n) {
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H * 0.72,
        r:     Math.random() * 1.5 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase + t * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,230,200,${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createStars(200);
  requestAnimationFrame(draw);
  window.addEventListener('resize', () => { resize(); createStars(200); });
})();

// ===== CUENTA ATRÁS =====
(function initCountdown() {
  const target = new Date('2026-06-27T19:00:00');

  function update() {
    const diff = target - new Date();

    if (diff <= 0) {
      ['cd-days','cd-hours','cd-minutes','cd-seconds'].forEach(id => {
        document.getElementById(id).textContent = '00';
      });
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    document.getElementById('cd-days').textContent    = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent   = String(h).padStart(2,'0');
    document.getElementById('cd-minutes').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-seconds').textContent = String(s).padStart(2,'0');
  }

  update();
  setInterval(update, 1000);
})();

// ===== SCROLL REVEAL =====
(function initScrollReveal() {
  const items = document.querySelectorAll('.scroll-reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    io.observe(el);
  });
})();

// ===== PARALLAX ANILLO =====
// Solo traslación vertical en el wrapper; la rotación va en el container hijo por CSS.
(function initParallax() {
  const wrapper = document.querySelector('.ring-parallax');
  if (!wrapper) return;

  window.addEventListener('scroll', () => {
    wrapper.style.transform = `translateY(${window.scrollY * 0.07}px)`;
  }, { passive: true });
})();

// ===== REPRODUCTOR FLOTANTE (autoplay + fallback primera interacción) =====
(function initMusic() {
  const btn   = document.getElementById('music-btn');
  const audio = document.getElementById('bgmusic');
  if (!btn || !audio) return;

  const icon = btn.querySelector('i');

  function setPlaying(playing) {
    if (playing) {
      btn.classList.add('playing');
      icon.className = 'fa-solid fa-pause';
      btn.title = 'Pausar música';
    } else {
      btn.classList.remove('playing');
      icon.className = 'fa-solid fa-music';
      btn.title = 'Música de la Comarca';
    }
  }

  // Intento de autoplay al cargar
  function tryAutoplay() {
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Bloqueado por el navegador — esperamos primera interacción del usuario
        const unlock = () => {
          audio.play()
            .then(() => { setPlaying(true); cleanup(); })
            .catch(() => {});
        };
        const cleanup = () => {
          document.removeEventListener('click',      unlock);
          document.removeEventListener('touchstart', unlock);
          document.removeEventListener('keydown',    unlock);
        };
        document.addEventListener('click',      unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('keydown',    unlock, { once: true });
      });
  }

  // Lanzar cuando el audio esté listo
  if (audio.readyState >= 2) {
    tryAutoplay();
  } else {
    audio.addEventListener('canplay', tryAutoplay, { once: true });
  }

  // Botón manual: alternar pausa / reproducción
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  });
})();

// ===== LIGHTBOX para la galería de disfraces =====
(function initLightbox() {
  // Crear el lightbox dinámicamente
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="lightbox-close" aria-label="Cerrar">✕</button><img src="" alt="">';
  document.body.appendChild(lb);

  const lbImg   = lb.querySelector('img');
  const lbClose = lb.querySelector('.lightbox-close');

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  // Abrir al pulsar cualquier imagen de la galería
  document.querySelectorAll('.gallery-item img, .guia-looks img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(img.src, img.alt));
  });

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();
