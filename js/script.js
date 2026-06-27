// =========================================================
// Footer year
// =========================================================
document.getElementById('year').textContent = new Date().getFullYear();

// =========================================================
// Scroll reveal (IntersectionObserver)
// =========================================================
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach((el) => revealObserver.observe(el));

// =========================================================
// Dock: morphing active pill + scroll-spy
// =========================================================
const dock = document.getElementById('dock');
const dockLinks = Array.from(document.querySelectorAll('.dock__link'));
const dockPill = document.querySelector('.dock__pill');
const sections = dockLinks
  .map((link) => document.getElementById(link.dataset.section))
  .filter(Boolean);

function movePillTo(link) {
  if (!link || !dockPill) return;
  const dockRect = dock.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  dockPill.style.width = linkRect.width + 'px';
  dockPill.style.left = (linkRect.left - dockRect.left) + 'px';
  dockPill.style.height = isMobile ? '40px' : '36px';
}

function setActive(id) {
  dockLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.section === id));
  const activeLink = dockLinks.find((l) => l.dataset.section === id);
  movePillTo(activeLink);
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) setActive(entry.target.id);
  });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
sections.forEach((s) => sectionObserver.observe(s));

window.addEventListener('load', () => setActive('top'));
window.addEventListener('resize', () => {
  const current = dockLinks.find((l) => l.classList.contains('is-active'));
  movePillTo(current);
});

dockLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.section);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// =========================================================
// Hero terminal typewriter
// =========================================================
const phrases = [
  'shipping a PWA for TALSUUDUS chapter…',
  'tuning service-worker cache versions…',
  'open to new front-end collaborations.',
];
const typeEl = document.getElementById('typewriter');
let pIndex = 0, cIndex = 0, deleting = false;

function tick() {
  if (!typeEl) return;
  const current = phrases[pIndex];
  if (!deleting) {
    cIndex++;
    typeEl.textContent = current.slice(0, cIndex);
    if (cIndex === current.length) {
      deleting = true;
      setTimeout(tick, 1800);
      return;
    }
    setTimeout(tick, 38);
  } else {
    cIndex--;
    typeEl.textContent = current.slice(0, cIndex);
    if (cIndex === 0) {
      deleting = false;
      pIndex = (pIndex + 1) % phrases.length;
      setTimeout(tick, 400);
      return;
    }
    setTimeout(tick, 18);
  }
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (typeEl) {
  if (reduceMotion) {
    typeEl.textContent = phrases[0];
  } else {
    tick();
  }
}

// =========================================================
// Contact form (front-end only demo handling)
// =========================================================
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = "Thanks — that's saved locally. Wire this form up to your own backend or form service to actually send it.";
    form.reset();
  });
}

// =========================================================
// PWA: service worker registration
// =========================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// =========================================================
// PWA: install prompt
// =========================================================
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.hidden = true;
});

