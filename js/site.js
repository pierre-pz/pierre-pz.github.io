// Small enhancements: mobile nav, active link highlight, progress bar, utilities
(function () {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const btn = $('#nav-toggle');
  const drawer = $('#nav-drawer');
  const menu = $('#nav-menu');
  const toggleNav = () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    drawer.classList.toggle('hidden');
  };
  if (btn && drawer) {
    btn.addEventListener('click', toggleNav);
    // Close when clicking a link
    $$('#nav-drawer .nav-link').forEach(a => a.addEventListener('click', () => {
      if (btn.getAttribute('aria-expanded') === 'true') toggleNav();
    }));
  }

  // Progress bar
  const progress = $('#progress');
  const setProgress = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.max(0, Math.min(1, height ? top / height : 0));
    if (progress) progress.style.width = (pct * 100).toFixed(2) + '%';
  };
  setProgress();
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', setProgress);

  // Active link highlight using IntersectionObserver
  const links = $$('.nav-link');
  const map = new Map(links.map(a => [a.dataset.section, a]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        map.forEach(a => a.removeAttribute('aria-current'));
        const active = map.get(id);
        if (active) active.setAttribute('aria-current', 'page');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
  ['home', 'projects'].forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // Back to top
  const toTop = $('#to-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();