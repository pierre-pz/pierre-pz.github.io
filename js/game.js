const clickBtn      = document.getElementById('clickBtn');
const clickCountEl  = document.getElementById('clickCount');
const celebrationEl = document.getElementById('celebration');
let count = 0;

if (clickBtn) {
  clickBtn.addEventListener('click', () => {
    count += 1;
    clickCountEl.textContent = `Clicks: ${count}`;
    if (count === 10) {
      celebrationEl.classList.remove('hidden');
      gsap.fromTo(celebrationEl, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(1.7)' });
    }
  });
}