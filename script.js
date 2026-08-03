const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress span');
const toTop = document.querySelector('.to-top');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  toTop.classList.toggle('is-visible', scrollY > innerHeight * .7);
  let current = 'top';
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - innerHeight * .38) current = section.id;
  });
  navLinks.forEach(link => link.classList.toggle('is-active', link.hash === `#${current}`));
}

addEventListener('scroll', updateScrollUI, { passive: true });
addEventListener('resize', updateScrollUI);
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
updateScrollUI();

const revealItems = document.querySelectorAll('.section-label, .section h2, .about-copy > *, .radar-card, .team-card, .interest-card, .principles-list article, .quote-section p, .contact-card');
if (reducedMotion) {
  revealItems.forEach(item => item.classList.add('is-revealed'));
} else {
  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--delay', `${(index % 4) * 65}ms`);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach(item => observer.observe(item));
}

if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.portrait-card, .radar-card, .contact-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      card.style.setProperty('--rx', `${-y * 5}deg`);
      card.style.setProperty('--ry', `${x * 6}deg`);
      card.style.setProperty('--mx', `${(x + .5) * 100}%`);
      card.style.setProperty('--my', `${(y + .5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}
