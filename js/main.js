// ===== NOVA Development =====

// --- Хедер при скролле ---
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// --- Мобильное меню ---
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('is-open');
  nav.classList.toggle('is-open');
});
nav.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav__link')) {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
  }
});

// --- Появление блоков при скролле ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');

    // счётчики
    entry.target.querySelectorAll('[data-count]').forEach(animateCount);
    if (entry.target.matches('[data-count]')) animateCount(entry.target);

    // прогресс-бары
    entry.target.querySelectorAll('.bar').forEach((b) => b.classList.add('is-done'));

    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

function animateCount(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1200;
  const start = performance.now();
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(target * eased)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// --- Фильтр планировок ---
const tabs = document.querySelectorAll('#flatTabs .tabs__btn');
const flats = document.querySelectorAll('#flatsGrid .flat');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    const rooms = tab.dataset.rooms;
    flats.forEach((flat) => {
      flat.classList.toggle('is-hidden', rooms !== 'all' && flat.dataset.rooms !== rooms);
    });
  });
});

// --- Кнопка «Подробнее» на планировке: скролл к форме + подстановка квартиры ---
const formFlat = document.getElementById('formFlat');
document.querySelectorAll('.js-open-form').forEach((btn) => {
  btn.addEventListener('click', () => {
    formFlat.value = btn.dataset.flat || '';
    document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
  });
});

// --- Ипотечный калькулятор ---
const RATE = 4.7;
const priceInput = document.getElementById('calcPrice');
const downInput = document.getElementById('calcDown');
const yearsInput = document.getElementById('calcYears');
const priceOut = document.getElementById('calcPriceOut');
const downOut = document.getElementById('calcDownOut');
const yearsOut = document.getElementById('calcYearsOut');
const monthlyOut = document.getElementById('calcMonthly');

const rub = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const yearsWord = (n) => {
  const t = n % 10, h = n % 100;
  if (t === 1 && h !== 11) return 'год';
  if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 'года';
  return 'лет';
};

function paintRange(input) {
  const min = +input.min, max = +input.max, val = +input.value;
  input.style.setProperty('--fill', ((val - min) / (max - min)) * 100 + '%');
}

function calc() {
  const price = +priceInput.value;
  const downPct = +downInput.value;
  const years = +yearsInput.value;

  priceOut.textContent = rub(price);
  downOut.textContent = downPct + '% · ' + rub(price * downPct / 100);
  yearsOut.textContent = years + ' ' + yearsWord(years);

  const loan = price * (1 - downPct / 100);
  const r = RATE / 100 / 12;
  const n = years * 12;
  const monthly = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  monthlyOut.textContent = rub(monthly) + '/мес';

  [priceInput, downInput, yearsInput].forEach(paintRange);
}

[priceInput, downInput, yearsInput].forEach((el) => el.addEventListener('input', calc));
calc();

// --- Форма (демо, без бэкенда) ---
const form = document.getElementById('leadForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  form.querySelectorAll('input[required]').forEach((input) => {
    const bad = !input.value.trim() || (input.type === 'tel' && input.value.replace(/\D/g, '').length < 10);
    input.classList.toggle('is-error', bad);
    if (bad) valid = false;
  });
  if (!valid) return;
  document.getElementById('formSuccess').hidden = false;
});

// --- Маска телефона ---
const phone = form.querySelector('input[type="tel"]');
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 4) out += ') ' + d.slice(4, 7);
  if (d.length >= 7) out += '-' + d.slice(7, 9);
  if (d.length >= 9) out += '-' + d.slice(9, 11);
  phone.value = out;
});
