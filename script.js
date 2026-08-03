const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress span');
const toTop = document.querySelector('.to-top');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '打开导航菜单');
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? '关闭导航菜单' : '打开导航菜单');
  document.body.classList.toggle('menu-open', opening);
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
addEventListener('resize', () => { if (innerWidth > 820) closeMenu(); });

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

const guestForm = document.querySelector('#guestbook-form');
const guestName = document.querySelector('#guest-name');
const guestMessage = document.querySelector('#guest-message');
const messageCount = document.querySelector('#message-count');
const draftStatus = document.querySelector('#draft-status');
const draftKey = 'timsparrow-guestbook-draft';

try {
  const draft = JSON.parse(localStorage.getItem(draftKey) || '{}');
  guestName.value = draft.name || '';
  guestMessage.value = draft.message || '';
} catch (_) {}

function updateDraft() {
  messageCount.textContent = guestMessage.value.length;
  try {
    localStorage.setItem(draftKey, JSON.stringify({ name: guestName.value, message: guestMessage.value }));
    draftStatus.textContent = guestMessage.value ? '草稿已自动保存' : '草稿会保存在你的设备上';
  } catch (_) {
    draftStatus.textContent = '';
  }
}

guestName.addEventListener('input', updateDraft);
guestMessage.addEventListener('input', updateDraft);
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
  const prompt = button.dataset.prompt;
  guestMessage.value = guestMessage.value ? `${guestMessage.value}\n${prompt}` : prompt;
  guestMessage.focus();
  updateDraft();
}));

guestForm.addEventListener('submit', event => {
  event.preventDefault();
  const message = guestMessage.value.trim();
  if (!message) {
    guestMessage.focus();
    return;
  }
  const sender = guestName.value.trim() || '一位网站访客';
  const subject = encodeURIComponent(`来自个人网站的留言｜${sender}`);
  const body = encodeURIComponent(`${message}\n\n—— ${sender}\n来自 TimSparrow 个人网站`);
  try { localStorage.removeItem(draftKey); } catch (_) {}
  location.href = `mailto:sparrowtim38@gmail.com?subject=${subject}&body=${body}`;
});

updateDraft();

document.querySelectorAll('.faq details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq details[open]').forEach(other => {
      if (other !== item) other.removeAttribute('open');
    });
  });
});
