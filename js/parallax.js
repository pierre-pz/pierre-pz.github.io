// Register ScrollTrigger after GSAP is loaded (global var)
gsap.registerPlugin(ScrollTrigger);

// Simple parallax for every element with data-speed
export function initParallax() {
  gsap.utils.toArray('[data-speed]').forEach(el => {
    const speed = parseFloat(el.dataset.speed || '0');
    gsap.to(el, {
      y: () => innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        scrub: true,
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', initParallax);