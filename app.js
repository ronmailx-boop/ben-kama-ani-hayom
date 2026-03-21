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
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

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
  birthdateLabel.textContent = '📅 תאריך לידה: ' + formatDate(p.birthdate);
}

// ── Handlers ─────────────────────────────────────────────────────────────────
function selectPerson(id) {
  activeId = id;
  renderTabs();
  renderCard();

  // Show popup
  const p = people.find(x => x.id === id);
  const { years, months, days } = calcAge(p.birthdate);
  showPopup(`גיל ${years}, ${months} חודשים, ${days} ימים`);
}

function handleAdd() {
  const name = inputName.value.trim();
  const date = inputDate.value;
  if (!name) return showError('נא להזין שם');
  if (!date) return showError('נא לבחור תאריך לידה');
  if (new Date(date) > new Date()) return showError('תאריך לידה לא יכול להיות בעתיד');
  if (people.length >= MAX_PEOPLE) return showError(`ניתן להוסיף עד ${MAX_PEOPLE} אנשים`);

  const id = Date.now().toString();
  people.push({ id, name, birthdate: date });
  activeId = id;
  savePeople();
  closeModal();
  render();

  showPopup(`${name} נוסף/ה בהצלחה! 🎉`);
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
  return `${d}/${m}/${y}`;
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
