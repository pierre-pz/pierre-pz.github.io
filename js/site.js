// Homepage enhancements: navigation, section state, progress, and one-time reveals.
(function () {
  'use strict';

  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const year = select('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = select('#site-header');
  const progress = select('#progress');
  const navToggle = select('#nav-toggle');
  const navMenu = select('#nav-menu');
  const navIcon = navToggle ? select('i', navToggle) : null;
  const mobileBreakpoint = window.matchMedia('(max-width: 800px)');

  const setMenuState = (open) => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (navIcon) {
      navIcon.classList.toggle('fa-bars', !open);
      navIcon.classList.toggle('fa-xmark', open);
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      setMenuState(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    selectAll('.nav-link', navMenu).forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenuState(false);
        navToggle.focus();
      }
    });

    mobileBreakpoint.addEventListener('change', (event) => {
      if (!event.matches) setMenuState(false);
    });
  }

  let scrollFrame = 0;
  const updateScrollUI = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (header) header.classList.toggle('is-scrolled', top > 12);
    if (progress) {
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, top / scrollable)) : 0;
      progress.style.width = `${(ratio * 100).toFixed(2)}%`;
    }
    scrollFrame = 0;
  };

  const requestScrollUpdate = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
  };

  updateScrollUI();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);

  const navLinks = selectAll('.nav-link[data-section]');
  const sections = selectAll('main section[id]').filter((section) =>
    navLinks.some((link) => link.dataset.section === section.id)
  );

  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      if (link.dataset.section === id) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  setActiveSection('home');

  const updateActiveSection = () => {
    const activationLine = (header ? header.offsetHeight : 0) + window.innerHeight * 0.28;
    let activeId = sections[0] ? sections[0].id : 'home';
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) activeId = section.id;
    });
    setActiveSection(activeId);
  };

  updateActiveSection();
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection);

  const revealItems = selectAll('.metric-item, .timeline-item, .project-card, .skill-group');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.05
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  }
})();
