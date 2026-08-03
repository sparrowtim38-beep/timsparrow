const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress span');
const toTop = document.querySelector('.to-top');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');

function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-label', dark ? '切换为浅色模式' : '切换为深色模式');
  themeToggle.setAttribute('title', dark ? '切换浅色模式' : '切换深色模式');
  themeToggle.setAttribute('aria-pressed', String(dark));
}

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('timsparrow-theme', next); } catch (_) {}
  syncThemeButton();
});
syncThemeButton();

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

const protectedPhone = document.querySelector('.protected-phone');
protectedPhone?.addEventListener('click', () => {
  const phone = ['+86', '137', '2555', '1112'].join('');
  const display = ['+86', '137', '2555', '1112'].join(' ');
  const number = protectedPhone.querySelector('strong');
  const action = protectedPhone.querySelector('.contact-action');
  if (protectedPhone.dataset.revealed === 'true') {
    location.href = `tel:${phone}`;
    return;
  }
  protectedPhone.dataset.revealed = 'true';
  number.textContent = display;
  action.innerHTML = '再次点击即可拨打 <b>↗</b>';
  protectedPhone.setAttribute('aria-label', `拨打 ${display}`);
});

document.querySelectorAll('.faq details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq details[open]').forEach(other => {
      if (other !== item) other.removeAttribute('open');
    });
  });
});

const radarDialog = document.querySelector('#radar-dialog');
const radarDialogContent = document.querySelector('#radar-dialog-content');
const radarArchives = {
  physics: {
    label: 'SCIENCE NOTE / 物理笔记', title: '圆周运动：方向改变，也是一种加速', index: '01',
    body: `<div class="archive-visual formula-visual"><span>v</span><b>→</b><span>a</span><small>a = v²/r = ω²r</small></div><p class="archive-lead">物体做匀速圆周运动时，速度的大小没有变化，但方向一直在改变。只要速度发生变化，就存在加速度。</p><p>这个加速度永远指向圆心，因此叫向心加速度。已知线速度时使用 <strong>a = v²/r</strong>；已知角速度时使用 <strong>a = ω²r</strong>。两个公式描述的是同一件事，只是从不同已知量出发。</p><p class="archive-note">我喜欢物理的原因：一个简短公式，可以把看似复杂的运动变成能够想象的关系。</p>`
  },
  travel: {
    label: 'TRAVEL FILE / 旅行档案', title: '先在地图上出发', index: '02',
    body: `<p class="archive-lead">以下不是“已经去过”的游记，而是我的目的地研究和旅行愿望清单。</p><div class="postcard-grid"><div class="postcard dakar"><span>DAKAR</span><small>大西洋沿岸 · 城市节奏</small></div><div class="postcard senegal"><span>SENEGAL</span><small>音乐 · 足球 · 西非文化</small></div><div class="postcard montevideo"><span>MONTEVIDEO</span><small>河岸城市 · 乌拉圭</small></div></div><p>我想去塞内加尔理解达喀尔的生活节奏，也想去乌拉圭看看一个人口不多的国家，如何形成如此深厚的足球传统。旅行之前先做功课，是我认识世界的第一步。</p>`
  },
  basketball: {
    label: 'BASKETBALL LOG / 篮球观察', title: '为什么是圣安东尼奥马刺', index: '03',
    body: `<div class="archive-visual court-visual"><span>TEAM</span><span>SPACE</span><span>GROWTH</span></div><p class="archive-lead">马刺吸引我的，不只是冠军历史，而是一套关于团队、耐心和长期建设的篮球哲学。</p><p>我喜欢观察无球跑动、空间和传导，也关注年轻球员如何在清晰的体系里成长。比分决定一晚的结果，体系与文化决定一支球队能走多远。</p><p class="archive-note">GO SPURS GO · 相信传球，也相信成长需要时间。</p>`
  },
  stories: {
    label: 'SCREEN NOTES / 观影视角', title: '我如何看一部电影', index: '04',
    body: `<div class="archive-visual screen-visual"><span>STORY</span><b>×</b><span>REALITY</span></div><p class="archive-lead">看完情节只是第一层。我更感兴趣的是：故事为什么在此刻被讲述，它触碰了哪一种真实情绪？</p><p>职场喜剧可能在讲权力结构，体育电影也可能在讲数据与旧经验的冲突。一部电影结束后，我喜欢把角色选择、时代背景和自己的感受重新连接起来。</p><p class="archive-note">好的故事不会替人给出答案，它让问题在散场后继续存在。</p>`
  }
};

function openRadarArchive(key) {
  const archive = radarArchives[key];
  if (!archive) return;
  radarDialogContent.innerHTML = `<header><span>${archive.label}</span><b>${archive.index}</b></header><h2 id="radar-dialog-title">${archive.title}</h2>${archive.body}`;
  radarDialog.showModal();
  document.body.classList.add('dialog-open');
}

document.querySelectorAll('[data-radar]').forEach(card => {
  card.addEventListener('click', () => openRadarArchive(card.dataset.radar));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openRadarArchive(card.dataset.radar); }
  });
});
document.querySelectorAll('.radar-open').forEach(link => link.addEventListener('click', event => event.stopPropagation()));
document.querySelector('.dialog-close').addEventListener('click', () => radarDialog.close());
radarDialog.addEventListener('click', event => { if (event.target === radarDialog) radarDialog.close(); });
radarDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

const easterTrigger = document.querySelector('.easter-trigger');
const easterToast = document.querySelector('.easter-toast');
const easterPalettes = [['#b8f36b','#ff714b'],['#7ee8fa','#eec0c6'],['#ffd166','#9b5de5'],['#84ffc9','#ff8c8c']];
let easterTimer;
easterTrigger.addEventListener('click', () => {
  const palette = easterPalettes[Math.floor(Math.random() * easterPalettes.length)];
  document.documentElement.style.setProperty('--easter-a', palette[0]);
  document.documentElement.style.setProperty('--easter-b', palette[1]);
  document.body.classList.remove('easter-active');
  void document.body.offsetWidth;
  document.body.classList.add('easter-active');
  easterToast.classList.add('show');
  clearTimeout(easterTimer);
  easterTimer = setTimeout(() => { easterToast.classList.remove('show'); document.body.classList.remove('easter-active'); }, 5000);
});

fetch('status.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Status unavailable');
  return response.json();
}).then(data => {
  Object.entries(data.items || {}).forEach(([key, value]) => {
    const target = document.querySelector(`[data-live-status="${key}"]`);
    if (target) target.textContent = value;
  });
  if (data.updated) document.querySelector('#status-updated').textContent = `更新于 ${data.updated}`;
}).catch(() => {});
