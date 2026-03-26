/* ============================================================
   app.js — Semua logika interaktif website "Untuk Kamu 💖"
   ============================================================ */

'use strict';

/* ── State ── */
let musicPlaying  = false;
let galleryIndex  = 0;
let quoteIndex    = 0;
let quoteTimer    = null;

/* ── DOM References ── */
const bgm         = document.getElementById('bgm');
const musicBtn    = document.getElementById('music-btn');
const mainContent = document.getElementById('main-content');
const btnOpen     = document.getElementById('btn-open');
const scrollHint  = document.getElementById('scroll-hint');

/* ============================================================
   1. OPEN BUTTON
   ============================================================ */
btnOpen.addEventListener('click', () => {
  // Tampilkan konten utama
  mainContent.classList.remove('hidden');

  // Tampilkan scroll hint
  scrollHint.classList.add('show');

  // Scroll ke section intro
  setTimeout(() => {
    document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
  }, 100);

  // Aktifkan musik & tombol musik
  setTimeout(() => {
    musicBtn.classList.add('show');
    tryAutoPlay();
  }, 600);

  // Efek visual sekali jalan
  spawnPetals();
  initFloatingHearts();
  initMsgHearts();
});

/* ============================================================
   2. MUSIC PLAYER
   ============================================================ */

/**
 * Set status tombol musik
 */
function setMusicUI(playing) {
  musicPlaying         = playing;
  musicBtn.textContent = playing ? '🎵' : '🔇';
}

/**
 * Coba play musik, update UI sesuai hasil
 */
function tryAutoPlay() {
  bgm.volume   = 0.5;
  bgm.currentTime = 0;

  // Pastikan file sudah siap dimuat
  const doPlay = () => {
    bgm.play()
      .then(() => setMusicUI(true))
      .catch((err) => {
        console.warn('Autoplay diblokir browser:', err.message);
        setMusicUI(false);
      });
  };

  // Kalau metadata belum siap, tunggu dulu
  if (bgm.readyState >= 2) {
    doPlay();
  } else {
    bgm.addEventListener('canplay', doPlay, { once: true });
    bgm.load(); // paksa reload jika perlu
  }
}

/**
 * Toggle play/pause via tombol musik
 */
musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgm.pause();
    setMusicUI(false);
  } else {
    bgm.play()
      .then(() => setMusicUI(true))
      .catch(() => setMusicUI(false));
  }
});

/**
 * Handle jika musik berhenti tiba-tiba (misal: error loading)
 */
bgm.addEventListener('error', () => {
  console.error('Audio error — cek nama file & format MP3.');
  setMusicUI(false);
  musicBtn.title = 'File audio tidak ditemukan';
});

bgm.addEventListener('pause', () => {
  // Hanya update UI jika bukan karena kita yang pause
  if (!bgm.ended) return;
  setMusicUI(false);
});

/* ============================================================
   3. TYPING EFFECT (Intro section)
   ============================================================ */
const typingEl = document.getElementById('typing-text');

const phrases = [
  'Selamat ulang tahun sayangkuh',
  'Semoga di tahun ini kamu dikasih rezeki yang melimmpah.',
  'Selalu bersyukur buat kehadiran kamu di hidup aku  <3',
];

let phraseIndex = 0;
let charIndex   = 0;
let isDeleting  = false;

/**
 * Efek ketik + hapus yang berjalan berulang
 */
function typeEffect() {
  if (!typingEl) return;

  const current   = phrases[phraseIndex];
  const displayed = isDeleting
    ? current.substring(0, charIndex - 1)
    : current.substring(0, charIndex + 1);

  typingEl.innerHTML = displayed + '<span class="typing-cursor"></span>';

  isDeleting ? charIndex-- : charIndex++;

  let delay = isDeleting ? 50 : 80;

  // Selesai mengetik → tunggu lalu hapus
  if (!isDeleting && charIndex === current.length + 1) {
    delay = 2400;
    isDeleting = true;
  }

  // Selesai menghapus → pindah ke frasa berikutnya
  if (isDeleting && charIndex === 0) {
    isDeleting   = false;
    phraseIndex  = (phraseIndex + 1) % phrases.length;
    delay        = 400;
  }

  setTimeout(typeEffect, delay);
}

/* ============================================================
   4. GALLERY SLIDER
   ============================================================ */

/**
 * Inisialisasi galeri swipeable dengan dot indicator
 */
function initGallery() {
  const track  = document.getElementById('gallery-track');
  const slides = track.querySelectorAll('.gallery-slide');
  const dotsEl = document.getElementById('gallery-dots');

  if (!slides.length) return;

  /* Buat dot indicator */
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goSlide(i));
    dotsEl.appendChild(dot);
  });

  /**
   * Pindah ke slide tertentu
   * @param {number} n - index target
   */
  function goSlide(n) {
    galleryIndex = Math.max(0, Math.min(n, slides.length - 1));
    const slideWidth = slides[0].offsetWidth + 16; // 16 = gap (gap-4)
    track.style.transform = `translateX(-${galleryIndex * slideWidth}px)`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === galleryIndex)
    );
  }

  /* ── Touch Swipe ── */
  let touchStartX = 0;
  let touchStartY = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Hanya geser horizontal jika lebih dominan dari vertikal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? goSlide(galleryIndex + 1) : goSlide(galleryIndex - 1);
    }
  }, { passive: true });

  /* ── Mouse Drag (desktop) ── */
  let mouseDown   = false;
  let mouseStartX = 0;

  track.addEventListener('mousedown', (e) => {
    mouseDown   = true;
    mouseStartX = e.clientX;
  });

  track.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goSlide(galleryIndex + 1) : goSlide(galleryIndex - 1);
    }
  });

  /* Recalculate on resize */
  window.addEventListener('resize', () => goSlide(galleryIndex));
}

/* ============================================================
   5. QUOTES SLIDER
   ============================================================ */

/**
 * Inisialisasi slider quotes dengan auto-advance & swipe
 */
function initQuotes() {
  const track = document.getElementById('quote-track');
  const items = track.querySelectorAll('.quote-item');
  const nav   = document.getElementById('quote-nav');

  if (!items.length) return;

  /* Buat dot indicator */
  items.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goQuote(i));
    nav.appendChild(dot);
  });

  /**
   * Pindah ke quote tertentu (circular)
   * @param {number} n - index target
   */
  function goQuote(n) {
    quoteIndex = (n + items.length) % items.length;
    track.style.transform = `translateX(-${quoteIndex * 100}%)`;
    nav.querySelectorAll('.quote-dot').forEach((d, i) =>
      d.classList.toggle('active', i === quoteIndex)
    );
  }

  /* Auto-advance setiap 4 detik */
  quoteTimer = setInterval(() => goQuote(quoteIndex + 1), 4000);

  /* ── Touch Swipe ── */
  let touchStartX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    clearInterval(quoteTimer);
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goQuote(quoteIndex + 1) : goQuote(quoteIndex - 1);
    }
    quoteTimer = setInterval(() => goQuote(quoteIndex + 1), 4000);
  }, { passive: true });
}

/* ============================================================
   6. FLOATING HEARTS (Intro section)
   ============================================================ */

/**
 * Menghasilkan hati melayang yang terus muncul di section intro
 */
function initFloatingHearts() {
  const container = document.getElementById('fh-container');
  if (!container) return;

  const emojis = ['💕', '💗', '🌸', '✨', '💖', '🌷'];

  setInterval(() => {
    const el          = document.createElement('div');
    el.className      = 'fh';
    el.textContent    = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left     = `${Math.random() * 100}%`;
    el.style.bottom   = '10px';
    el.style.fontSize = `${14 + Math.random() * 14}px`;
    el.style.animationDuration = `${4 + Math.random() * 4}s`;
    el.style.animationDelay   = '0s';
    container.appendChild(el);
    setTimeout(() => el.remove(), 8000);
  }, 900);
}

/* ============================================================
   7. MESSAGE HEARTS (Special Message section)
   ============================================================ */

/**
 * Menempatkan hati dekoratif di background section pesan
 */
function initMsgHearts() {
  const container = document.getElementById('msg-hearts');
  if (!container) return;

  const positions = [
    { left: '8%',  top: '15%', delay: '0s'   },
    { left: '82%', top: '10%', delay: '1.5s' },
    { left: '15%', top: '75%', delay: '2s'   },
    { left: '75%', top: '70%', delay: '0.8s' },
    { left: '50%', top: '5%',  delay: '3s'   },
  ];

  const heartEmojis = ['💖', '💗', '💝', '❤️', '💓'];

  positions.forEach((pos) => {
    const el = document.createElement('div');
    el.className           = 'msg-heart';
    el.textContent         = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    el.style.left          = pos.left;
    el.style.top           = pos.top;
    el.style.animationDelay    = pos.delay;
    el.style.animationDuration = `${5 + Math.random() * 4}s`;
    container.appendChild(el);
  });
}

/* ============================================================
   8. PETALS (efek jatuh saat tombol buka diklik)
   ============================================================ */

/**
 * Menghasilkan kelopak bunga yang berjatuhan dari atas layar
 */
function spawnPetals() {
  const container = document.getElementById('petals-container');
  const petalEmojis = ['🌸', '🌷', '🌺', '🌹'];

  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const petal = document.createElement('div');
      petal.className        = 'petal';
      petal.textContent      = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
      petal.style.left       = `${Math.random() * 100}vw`;
      petal.style.top        = '-30px';
      petal.style.animationDuration = `${3 + Math.random() * 4}s`;
      petal.style.animationDelay   = '0s';
      container.appendChild(petal);
      setTimeout(() => petal.remove(), 8000);
    }, i * 300);
  }
}

/* ============================================================
   9. INTERSECTION OBSERVER
   Memicu animasi fade-in dan inisialisasi section saat terlihat
   ============================================================ */
function initObserver() {
  const sections = document.querySelectorAll('.section-fade');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Fade in
      entry.target.classList.add('visible');

      // Lazy-init per section
      const id = entry.target.id;

      if (id === 'intro' && !window._typingStarted) {
        window._typingStarted = true;
        setTimeout(typeEffect, 400);
      }

      if (id === 'gallery' && !window._galleryInit) {
        window._galleryInit = true;
        initGallery();
      }

      if (id === 'quotes' && !window._quotesInit) {
        window._quotesInit = true;
        initQuotes();
      }
    });
  }, { threshold: 0.2 });

  sections.forEach((s) => observer.observe(s));
}

/* ============================================================
   10. SET TANGGAL (Message section)
   ============================================================ */
function setDate() {
  const el = document.getElementById('msg-date');
  if (!el) return;
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  el.textContent = new Date().toLocaleDateString('id-ID', opts);
}

/* ============================================================
   11. REPLAY BUTTON (Closing section)
   ============================================================ */
document.getElementById('btn-replay')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!musicPlaying) {
    bgm.currentTime = 0;
    bgm.play().then(() => {
      musicPlaying          = true;
      musicBtn.textContent  = '🎵';
    });
  }
  spawnPetals();
});

/* ============================================================
   INIT — Jalankan saat halaman siap
   ============================================================ */
setDate();
initObserver();
