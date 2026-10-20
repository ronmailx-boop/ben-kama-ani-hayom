// ── Language ────────────────────────────────────────────────────────────────
// Hebrew for devices set to Hebrew, English for everyone else.
const STRINGS = {
  he: {
    subtitle: 'הוסף אנשים וגלה את גילם המדויק',
    help: 'איך משתמשים?',
    addPerson: 'הוסף אדם',
    emptyBefore: 'לחץ על',
    emptyAfter: 'כדי להוסיף אדם ראשון',
    years: 'שנים', months: 'חודשים', days: 'ימים',
    remove: '🗑 הסר',
    modalTitle: '➕ הוסף אדם חדש',
    name: 'שם', namePlaceholder: 'לדוגמה: דנה',
    birthdate: 'תאריך לידה',
    add: 'הוסף', cancel: 'ביטול', close: 'סגור',
    bornOn: date => '📅 תאריך לידה: ' + date,
    agePopup: (y, m, d) => `גיל ${y}, ${m} חודשים, ${d} ימים`,
    added: name => `${name} נוסף/ה בהצלחה! 🎉`,
    errName: 'נא להזין שם',
    errDate: 'נא לבחור תאריך לידה',
    errFuture: 'תאריך לידה לא יכול להיות בעתיד',
    errMax: max => `ניתן להוסיף עד ${max} אנשים`,
  },
  en: {
    subtitle: 'Add people and see their exact age',
    help: 'How to use',
    addPerson: 'Add person',
    emptyBefore: 'Tap',
    emptyAfter: 'to add your first person',
    years: 'years', months: 'months', days: 'days',
    remove: '🗑 Remove',
    modalTitle: '➕ Add a person',
    name: 'Name', namePlaceholder: 'e.g. Dana',
    birthdate: 'Date of birth',
    add: 'Add', cancel: 'Cancel', close: 'Close',
    bornOn: date => '📅 Born: ' + date,
    agePopup: (y, m, d) => `Age ${y} · ${m} ${m === 1 ? 'month' : 'months'} · ${d} ${d === 1 ? 'day' : 'days'}`,
    added: name => `${name} added! 🎉`,
    errName: 'Please enter a name',
    errDate: 'Please pick a date of birth',
    errFuture: "Date of birth can't be in the future",
    errMax: max => `You can add up to ${max} people`,
  },
};

const LANG = /^(he|iw)\b/i.test(navigator.language || '') ? 'he' : 'en';
const t = STRINGS[LANG];
applyLanguage();

function applyLanguage() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t[el.dataset.i18nPlaceholder]; });
  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    el.title = t[el.dataset.i18nLabel];
    el.setAttribute('aria-label', t[el.dataset.i18nLabel]);
  });
  // The usage guide video is narrated in Hebrew
  if (LANG !== 'he') document.getElementById('helpBtn').classList.add('hidden');
}

// ── State ──────────────────────────────────────────────────────────────────
const MAX_PEOPLE = 5;
const STORAGE_KEY = 'benKamaAni_people';

let people = loadPeople();   // [{ id, name, birthdate }]
let activeId = people.length ? people[0].id : null;

// ── DOM refs ────────────────────────────────────────────────────────────────
const tabsEl        = document.getElementById('tabs');
const addBtn        = document.getElementById('addBtn');
const mainCard      = document.getElementById('mainCard');
const emptyState    = document.getElementById('emptyState');
const personView    = document.getElementById('personView');
const personAvatar  = document.getElementById('personAvatar');
const personName    = document.getElementById('personName');
const ageYears      = document.getElementById('ageYears');
const ageMonths     = document.getElementById('ageMonths');
const ageDays       = document.getElementById('ageDays');
const birthdateLabel= document.getElementById('birthdateLabel');
const deleteBtn     = document.getElementById('deleteBtn');

const modalOverlay  = document.getElementById('modalOverlay');
const inputName     = document.getElementById('inputName');
const inputDate     = document.getElementById('inputDate');
const confirmBtn    = document.getElementById('confirmBtn');
const cancelBtn     = document.getElementById('cancelBtn');
const modalError    = document.getElementById('modalError');

const helpBtn       = document.getElementById('helpBtn');
const guideOverlay  = document.getElementById('guideOverlay');
const guideVideo    = document.getElementById('guideVideo');
const guideClose    = document.getElementById('guideClose');

const popup         = document.getElementById('popup');
const popupText     = document.getElementById('popupText');

// ── Init ────────────────────────────────────────────────────────────────────
render();

// ── Event listeners ─────────────────────────────────────────────────────────
addBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
confirmBtn.addEventListener('click', handleAdd);
deleteBtn.addEventListener('click', handleDelete);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
helpBtn.addEventListener('click', openGuide);
guideClose.addEventListener('click', closeGuide);
guideOverlay.addEventListener('click', e => { if (e.target === guideOverlay) closeGuide(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeGuide(); } });

// set max date to today
inputDate.max = todayStr();

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  renderTabs();
  renderCard();
  addBtn.disabled = people.length >= MAX_PEOPLE;
}

function renderTabs() {
  tabsEl.innerHTML = '';
  people.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (p.id === activeId ? ' active' : '');
    btn.textContent = p.name;
    btn.addEventListener('click', () => selectPerson(p.id));
    tabsEl.appendChild(btn);
  });
}

function renderCard() {
  if (!people.length) {
    emptyState.classList.remove('hidden');
    personView.classList.add('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  personView.classList.remove('hidden');

  const p = people.find(x => x.id === activeId) || people[0];
  activeId = p.id;

  const { years, months, days } = calcAge(p.birthdate);

  // Avatar emoji from name initial
  personAvatar.textContent = nameToEmoji(p.name);
  personName.textContent = p.name;
  ageYears.textContent  = years;
  ageMonths.textContent = months;
  ageDays.textContent   = days;
  birthdateLabel.textContent = t.bornOn(formatDate(p.birthdate));
}

// ── Handlers ─────────────────────────────────────────────────────────────────
function selectPerson(id) {
  activeId = id;
  renderTabs();
  renderCard();

  // Show popup
  const p = people.find(x => x.id === id);
  const { years, months, days } = calcAge(p.birthdate);
  showPopup(t.agePopup(years, months, days));
}

function handleAdd() {
  const name = inputName.value.trim();
  const date = inputDate.value;
  if (!name) return showError(t.errName);
  if (!date) return showError(t.errDate);
  if (new Date(date) > new Date()) return showError(t.errFuture);
  if (people.length >= MAX_PEOPLE) return showError(t.errMax(MAX_PEOPLE));

  const id = Date.now().toString();
  people.push({ id, name, birthdate: date });
  activeId = id;
  savePeople();
  closeModal();
  render();

  showPopup(t.added(name));
}

function handleDelete() {
  const idx = people.findIndex(x => x.id === activeId);
  people.splice(idx, 1);
  activeId = people.length ? people[Math.max(0, idx - 1)].id : null;
  savePeople();
  render();
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openModal() {
  inputName.value = '';
  inputDate.value = '';
  modalError.classList.add('hidden');
  modalOverlay.classList.remove('hidden');
  setTimeout(() => inputName.focus(), 50);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

function showError(msg) {
  modalError.textContent = msg;
  modalError.classList.remove('hidden');
}

// ── Usage guide video ─────────────────────────────────────────────────────────
function openGuide() {
  guideOverlay.classList.remove('hidden');
  guideVideo.currentTime = 0;
  guideVideo.play().catch(() => {});   // autoplay may be blocked; controls stay available
}

function closeGuide() {
  guideVideo.pause();
  guideOverlay.classList.add('hidden');
}

// ── Popup toast ───────────────────────────────────────────────────────────────
let popupTimer;
function showPopup(msg) {
  popupText.textContent = msg;
  popup.classList.add('show');
  clearTimeout(popupTimer);
  popupTimer = setTimeout(() => popup.classList.remove('show'), 3000);
}

// ── Age calculation ───────────────────────────────────────────────────────────
function calcAge(birthdateStr) {
  const birth = new Date(birthdateStr);
  const today = new Date();

  let years  = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth()    - birth.getMonth();
  let days   = today.getDate()     - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(str) {
  const [y, m, d] = str.split('-');
  if (LANG === 'he') return `${d}/${m}/${y}`;
  return new Date(+y, m - 1, +d).toLocaleDateString(navigator.language || 'en', { day: 'numeric', month: 'short', year: 'numeric' });
}

function nameToEmoji(name) {
  const emojis = ['🎂','🌟','😊','🦊','🌈','🎵','🍀','⭐','🦋','🌸'];
  let hash = 0;
  for (const ch of name) hash += ch.charCodeAt(0);
  return emojis[hash % emojis.length];
}

// ── LocalStorage ──────────────────────────────────────────────────────────────
function savePeople() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

function loadPeople() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
