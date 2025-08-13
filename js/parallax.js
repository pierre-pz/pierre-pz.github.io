// Register ScrollTrigger after GSAP is loaded (global var)
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// Simple parallax for every element with data-speed
export function initParallax() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  // Respect accessibility & avoid heavy effects on mobile
  if (reduceMotion || isMobile || !window.gsap || !window.ScrollTrigger) return;

  gsap.utils.toArray('[data-speed]').forEach(el => {
    const speed = Math.max(-1, Math.min(1, parseFloat(el.dataset.speed || '0')));
    gsap.to(el, {
      y: () => innerHeight * speed,
      ease: 'none',
      overwrite: 'auto',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', initParallax);
