
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Cinematic energy-burst opening inspired by high-impact game ability animations.
// Lightweight canvas particles; the intro always has a skip and auto-exit fallback.
const introScreen = $('#introScreen');
const introLoaderBar = $('#introLoaderBar');
const introHint = $('#introHint');
const introSkip = $('#introSkip');
const introCanvas = $('#introParticles');
let introClosed = false;
let introAnimationFrame = 0;
let introParticles = [];
let introCanvasContext = null;
let introStartTime = 0;
let introBurstDone = false;
let introSecondBurstDone = false;

function resizeIntroCanvas() {
  if (!introCanvas || !introCanvasContext) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  introCanvas.width = Math.round(window.innerWidth * dpr);
  introCanvas.height = Math.round(window.innerHeight * dpr);
  introCanvas.style.width = `${window.innerWidth}px`;
  introCanvas.style.height = `${window.innerHeight}px`;
  introCanvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function burstIntroParticles(power = 1) {
  if (!introCanvas) return;
  const cx = window.innerWidth * .5;
  const cy = window.innerHeight * .47;
  const count = Math.min(150, Math.round((window.innerWidth < 600 ? 55 : 100) * power));
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 8) * power;
    introParticles.push({
      x: cx + (Math.random() - .5) * 24,
      y: cy + (Math.random() - .5) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 35 + Math.random() * 55,
      maxLife: 35 + Math.random() * 55,
      size: .7 + Math.random() * 2.7,
      color: ['#f8ead6', '#dfbd93', '#b88b61', '#fff9ee'][Math.floor(Math.random() * 4)]
    });
  }
}
function animateIntroParticles(now) {
  if (!introCanvasContext || introClosed) return;
  if (!introStartTime) introStartTime = now;
  const elapsed = now - introStartTime;
  const ctx = introCanvasContext;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (elapsed > 520 && !introBurstDone) {
    introBurstDone = true;
    burstIntroParticles(1.5);
    introScreen?.classList.add('is-charged');
  }
  if (elapsed > 1580 && !introSecondBurstDone) { introSecondBurstDone = true; burstIntroParticles(.6); }
  introParticles = introParticles.filter(p => p.life > 0);
  for (const p of introParticles) {
    p.x += p.vx; p.y += p.vy;
    p.vx *= .982; p.vy *= .982; p.vy += .012; p.life -= 1;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  introAnimationFrame = requestAnimationFrame(animateIntroParticles);
}
function closeIntro() {
  if (introClosed || !introScreen) return;
  introClosed = true;
  cancelAnimationFrame(introAnimationFrame);
  introScreen.classList.add('is-impact-exit', 'is-leaving');
  document.body.classList.remove('intro-active');
  window.setTimeout(() => introScreen.remove(), 1250);
}
if (introScreen) {
  document.body.classList.add('intro-active');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    closeIntro();
  } else {
    if (introCanvas && introCanvas.getContext) {
      introCanvasContext = introCanvas.getContext('2d');
      resizeIntroCanvas();
      window.addEventListener('resize', resizeIntroCanvas, { passive: true });
      introAnimationFrame = requestAnimationFrame(animateIntroParticles);
    }
    requestAnimationFrame(() => { if (introLoaderBar) introLoaderBar.style.width = '100%'; });
    window.setTimeout(() => { if (introHint && !introClosed) introHint.innerHTML = 'ENERGY RELEASED <span class="loading-dots">✳</span>'; }, 1250);
    window.setTimeout(() => introScreen.classList.add('is-final-flash'), 2050);
    window.setTimeout(closeIntro, 3550);
    introSkip?.addEventListener('click', closeIntro);
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeIntro();
    });
  }
}

$('#year').textContent = new Date().getFullYear();

// Scroll reveal: progressive enhancement with reduced-motion support.
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });
  revealItems.forEach((item, index) => {
    if (item.classList.contains('project-card')) item.style.setProperty('--delay', `${(index % 2) * 110}ms`);
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

// Progress indicator.
const progressBar = $('#progressBar');
let ticking = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateProgress);
    ticking = true;
  }
}, { passive: true });
updateProgress();

// Mobile navigation.
const menuToggle = $('#menuToggle');
const nav = $('#nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});
$$('#nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Project details use only facts listed in the supplied CV.
const projects = {
  caps: {
    type: 'TEAM PROJECT · SYSTEMS ANALYST',
    title: "Cap’s Style",
    description: 'A barbershop business process system designed to support ordering and management workflows.',
    contribution: 'Created the ERD, Class Diagram, DFD, Use Case Diagram, and Activity Diagrams as Systems Analyst.',
    tags: ['ERD', 'Class Diagram', 'DFD', 'Use Case', 'Activity Diagram']
  },
  stgulp: {
    type: 'TEAM PROJECT · UI/UX',
    title: 'STGulpTea',
    description: 'A mobile application concept for ordering tea and matcha online.',
    contribution: 'Designed the UI/UX in Figma and produced supporting Fishbone, DFD, Activity, and Class Diagrams.',
    tags: ['Figma', 'UI/UX', 'Fishbone', 'DFD', 'Activity Diagram', 'Class Diagram']
  },
  zerowaste: {
    type: 'TEAM PROJECT · DATABASE',
    title: 'ZeroWaste',
    description: 'A website concept for waste management and exchange, including a points dashboard.',
    contribution: 'Built the SQL database in phpMyAdmin.',
    tags: ['SQL', 'phpMyAdmin', 'Dashboard']
  },
  aqquas: {
    type: 'TEAM PROJECT · UI/UX DESIGNER',
    title: 'Aqquas',
    description: 'A mobile application concept for finding and ordering aquariums.',
    contribution: 'Created wireframes and UI designs in Figma as UI/UX Designer.',
    tags: ['Figma', 'Wireframes', 'UI Design']
  },
  macaroni: {
    type: 'INDIVIDUAL PROJECT · WEB DEVELOPMENT',
    title: 'Project Macaroni',
    description: 'A macaroni-selling website designed and built as an individual project.',
    contribution: 'Designed the UI in Figma and implemented the website using HTML and CSS.',
    tags: ['Figma', 'HTML', 'CSS', 'Individual Project']
  },
  furniland: {
    type: 'TEAM PROJECT · WEB & DATABASE',
    title: 'Furniland',
    description: 'A furniture-selling website with a product catalog.',
    contribution: 'Developed the HTML/CSS structure and built the SQL database in phpMyAdmin.',
    tags: ['HTML', 'CSS', 'SQL', 'phpMyAdmin']
  }
};
const modal = $('#projectModal');
function openProject(key) {
  const project = projects[key];
  if (!project) return;
  $('#modalType').textContent = project.type;
  $('#modalTitle').textContent = project.title;
  $('#modalDescription').textContent = project.description;
  $('#modalContribution').textContent = project.contribution;
  $('#modalTags').replaceChildren(...project.tags.map(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  $('.modal-close').focus();
}
function closeProject() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
$$('[data-open]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.open)));
$$('[data-close]').forEach(button => button.addEventListener('click', closeProject));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeProject();
});

// Gentle pointer-responsive art, disabled on touch devices and reduced-motion.
const art = $('.hero-art');
if (art && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  art.addEventListener('pointermove', event => {
    const rect = art.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    art.style.transform = `translate3d(${x * 5}px, ${y * 5}px, 0)`;
  });
  art.addEventListener('pointerleave', () => { art.style.transform = ''; });
}
