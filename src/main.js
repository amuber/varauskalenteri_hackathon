import './styles.css';

const STORAGE_KEY = 'paivystyskalenteri-demo';
const currentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};
const hourlyRates = { Kandi: 35, 'Erikoistuva lääkäri': 55, Erikoislääkäri: 80 };
const lastBookableMonth = () => {
  const month = currentMonth();
  return new Date(month.getFullYear(), month.getMonth() + 3, 1);
};
const demoUsers = [
  { email: 'laakari1@hyvaks.fi', password: 'laakari1', name: 'Laura Laaksonen', role: 'doctor', careerLevel: 'Erikoislääkäri', employmentType: 'Vakinainen' },
  { email: 'laakari2@hyvaks.fi', password: 'laakari2', name: 'Mikko Mallikas', role: 'doctor', careerLevel: 'Erikoistuva lääkäri', employmentType: 'Määräaikainen' },
  { email: 'kandi@hyvaks.fi', password: 'kandi', name: 'Kaisa Kandidaatti', role: 'doctor', careerLevel: 'Kandi', employmentType: 'Määräaikainen' },
  { email: 'admin@hyvaks.fi', password: 'admin', name: 'Päivystyksen ylläpito', role: 'admin' }
];

const initialState = {
  user: null,
  selectedMonth: currentMonth(),
  shifts: [
    { id: 1, date: '2026-09-21', type: 'Kiireellinen', start: '08:00', end: '16:00', doctor: null, requiredCareerLevel: 'Valmis lääkäri' },
    { id: 2, date: '2026-09-23', type: 'Triage', start: '16:00', end: '22:00', doctor: 'Laura Laaksonen', requiredCareerLevel: 'Valmis lääkäri' },
    { id: 3, date: '2026-09-25', type: 'Kiireellinen', start: '08:00', end: '16:00', doctor: null, requiredCareerLevel: 'Kaikki lääkärit' },
    { id: 4, date: '2026-09-27', type: 'Puhelinlääkäri', start: '09:00', end: '15:00', doctor: null, requiredCareerLevel: 'Kaikki lääkärit' },
    { id: 5, date: '2026-09-29', type: 'Ruuhkan purku', start: '16:00', end: '22:00', doctor: null, requiredCareerLevel: 'Valmis lääkäri' }
  ],
  reports: [
    { id: 1, shiftId: 3, doctor: 'Mikko Mallikas', date: '2026-09-12', status: 'Käsittelyssä', summary: 'Päivystysvuoro sujui normaalisti.', patients: 18 }
  ]
};

let state = loadState();
ensureCalendarShifts();
const app = document.querySelector('#app');

app.addEventListener('click', event => {
  const logout = event.target.closest('#logout');
  if (!logout) return;
  event.preventDefault();
  event.stopPropagation();
  state.user = null;
  saveState();
  render();
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState;
  const parsed = JSON.parse(saved);
  const selectedMonth = new Date(parsed.selectedMonth);
  const min = currentMonth();
  const max = lastBookableMonth();
  return {
    ...initialState,
    ...parsed,
    selectedMonth: selectedMonth < min ? min : selectedMonth > max ? max : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureCalendarShifts() {
  const doctors = ['Laura Laaksonen', 'Mikko Mallikas'];
  const types = ['Kiireellinen', 'Triage', 'Puhelinlääkäri', 'Päivystys'];
  const startTimes = ['08:00', '16:00', '09:00', '16:00'];
  const endTimes = ['16:00', '22:00', '15:00', '22:00'];
  const existing = new Set(state.shifts.map(shift => `${shift.date}|${shift.start}`));
  const first = currentMonth();
  const last = lastBookableMonth();
  for (let month = new Date(first); month <= last; month.setMonth(month.getMonth() + 1)) {
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= days; day++) {
      const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayShiftCount = state.shifts.filter(shift => shift.date === date).length;
      for (let slot = dayShiftCount; slot < 6; slot++) {
        const index = state.shifts.length;
        const typeIndex = (day + slot + index) % types.length;
        const start = startTimes[typeIndex];
        if (existing.has(`${date}|${start}`)) continue;
        state.shifts.push({
          id: Date.now() + index,
          date,
          type: types[typeIndex],
          start,
          end: endTimes[typeIndex],
          doctor: index % 5 === 0 ? doctors[index % doctors.length] : null,
          requiredCareerLevel: index % 3 === 0 ? 'Valmis lääkäri' : 'Kaikki lääkärit'
        });
        existing.add(`${date}|${start}`);
      }
    }
  }
  saveState();
}

function formatDate(dateString, options = { weekday: 'short', day: 'numeric', month: 'numeric' }) {
  return new Intl.DateTimeFormat('fi-FI', options).format(new Date(`${dateString}T12:00:00`));
}

function render() {
  app.innerHTML = state.user ? renderShell() : renderLogin();
  bindEvents();
}

function renderLogin() {
  return `
    <main class="login-page">
      <section class="login-card">
        <div class="brand-mark">✚</div>
        <p class="eyebrow">Keski-Suomen hyvinvointialue</p>
        <h1>Päivystyskalenteri</h1>
        <p class="muted login-intro">Kirjaudu sisään hallinnoidaksesi päivystysvuoroja ja toteumia.</p>
        <form id="login-form" class="stack">
          <label>Sähköposti<input name="email" type="email" placeholder="etunimi.sukunimi@hyvaks.fi" required /></label>
          <label>Salasana<input name="password" type="password" placeholder="••••••••" required /></label>
          <p id="login-error" class="form-error" hidden>Virheellinen sähköposti tai salasana.</p>
          <button class="button primary wide" type="submit">Kirjaudu sisään <span>→</span></button>
        </form>
        <div class="demo-hint"><strong>Demotunnukset</strong><br />Lääkäri 1: laakari1@hyvaks.fi / laakari1<br />Lääkäri 2: laakari2@hyvaks.fi / laakari2<br />Kandi: kandi@hyvaks.fi / kandi<br />Admin: admin@hyvaks.fi / admin</div>
      </section>
      <aside class="login-aside"><div class="aside-content"><p class="eyebrow light">Yksi näkymä koko päivystykseen</p><h2>Vuorot hallintaan.<br /><em>Toteumat talteen.</em></h2><p>Varaa työvuorosi helposti ja täytä toteuma heti vuoron jälkeen.</p></div></aside>
    </main>`;
}

function renderShell() {
  const admin = state.user.role === 'admin';
  return `<div class="app-shell">
    <header class="topbar"><div class="topbar-inner"><div class="logo"><span>✚</span><strong>Päivystyskalenteri</strong></div><div class="user-menu"><div class="avatar">${state.user.name.charAt(0)}</div><div><strong>${state.user.name}</strong><small>${admin ? 'Ylläpitäjä' : `${state.user.careerLevel} · ${state.user.employmentType}`}</small></div><button type="button" id="logout" class="icon-button" aria-label="Kirjaudu ulos" title="Kirjaudu ulos">↪</button></div></div></header>
    <div class="layout"><nav class="sidebar"><div class="nav-label">Valikko</div>${admin ? `<button class="nav-item active" data-view="admin"><span>▦</span> Yhteenveto</button><button class="nav-item" data-view="reports"><span>▤</span> Toteumat</button>` : `<button class="nav-item active" data-view="calendar"><span>▦</span> Vuorokalenteri</button><button class="nav-item" data-view="my-reports"><span>▤</span> Omat toteumat</button>`}<div class="sidebar-bottom"><span class="status-dot"></span> Järjestelmä toimii normaalisti</div></nav><main class="content">${admin ? renderAdmin() : renderDoctor()}</main></div></div>`;
}

function renderDoctor() {
  const min = currentMonth();
  const max = lastBookableMonth();
  const canPrevious = state.selectedMonth > min;
  const canNext = state.selectedMonth < max;
  return `<div class="page-heading"><div><p class="eyebrow">Lääkärin työpöytä</p><h1>Hei, ${state.user.name.split(' ')[0]}!</h1><p class="muted">Tässä näet tulevat päivystysvuorot ja toteumasi.</p></div><div class="date-chip">● Tänään<br /><strong>${formatDate(new Date().toISOString().slice(0, 10), { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div></div>${renderStats()}<section class="panel calendar-panel"><div class="panel-heading"><div><h2>Vuorokalenteri</h2><p class="muted">Varaa vuoroja nykyisestä kuukaudesta kolmen kuukauden päähän.</p></div><div class="month-controls"><button class="icon-button" data-month="-1" ${canPrevious ? '' : 'disabled'} aria-label="Edellinen kuukausi">‹</button><strong>${new Intl.DateTimeFormat('fi-FI', { month: 'long', year: 'numeric' }).format(state.selectedMonth)}</strong><button class="icon-button" data-month="1" ${canNext ? '' : 'disabled'} aria-label="Seuraava kuukausi">›</button></div></div>${renderCalendar()}</section>`;
}

function renderStats() {
  const mine = state.shifts.filter(s => s.doctor === state.user.name).length;
  const pending = state.reports.filter(r => r.doctor === state.user.name && r.status === 'Käsittelyssä').length;
  return `<div class="stats-grid"><div class="stat-card"><span class="stat-icon blue">▦</span><div><small>Varatut vuorot</small><strong>${mine}</strong></div></div><div class="stat-card"><span class="stat-icon green">✓</span><div><small>Tehdyt toteumat</small><strong>${state.reports.filter(r => r.doctor === state.user.name).length}</strong></div></div><div class="stat-card"><span class="stat-icon amber">◷</span><div><small>Käsittelyssä</small><strong>${pending}</strong></div></div></div>`;
}

function renderCalendar() {
  const year = state.selectedMonth.getFullYear(), month = state.selectedMonth.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const labels = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
  let cells = labels.map(d => `<div class="weekday">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) cells += '<div class="day empty"></div>';
  for (let day = 1; day <= days; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const shifts = state.shifts.filter(s => s.date === date);
    const dayStatus = shifts.map(s => s.doctor ? `Varattu · ${s.doctor}` : 'Vapaa').join(' · ');
    cells += `<div class="day"><span class="day-number">${day}</span><span class="day-status ${shifts.some(s => s.doctor) ? 'reserved' : 'available'}">${dayStatus}</span>${shifts.map(s => `<button type="button" class="shift ${s.doctor === state.user.name ? 'mine' : s.doctor ? 'taken' : ''} ${s.requiredCareerLevel === 'Valmis lääkäri' ? 'qualified-only' : ''}" data-shift="${s.id}"><b>${s.start}–${s.end}</b><small>${s.type}</small>${s.requiredCareerLevel === 'Valmis lääkäri' ? '<small class="qualification">Vain valmis lääkäri</small>' : ''}<span>${s.doctor === state.user.name ? 'Varattu sinulle' : s.doctor ? `Varaaja: ${s.doctor}` : 'Vapaa · Varaa'}</span></button>`).join('')}</div>`;
  }
  return `<div class="calendar">${cells}</div>`;
}

function renderAdmin() {
  const pending = state.reports.filter(r => r.status === 'Käsittelyssä');
  return `<div class="page-heading"><div><p class="eyebrow">Ylläpitäjän työpöytä</p><h1>Yhteenveto</h1><p class="muted">Seuraa päivystysvuoroja ja käsittele saapuneet toteumat.</p></div><button class="button primary" data-view="reports">Avaa toteumat <span>→</span></button></div><div class="stats-grid admin-stats"><div class="stat-card"><span class="stat-icon blue">▦</span><div><small>Vuoroja yhteensä</small><strong>${state.shifts.length}</strong></div></div><div class="stat-card"><span class="stat-icon amber">◷</span><div><small>Toteumia odottaa</small><strong>${pending.length}</strong></div></div><div class="stat-card"><span class="stat-icon green">✓</span><div><small>Varattuja vuoroja</small><strong>${state.shifts.filter(s => s.doctor).length}</strong></div></div></div><section class="panel"><div class="panel-heading"><div><h2>Viimeisimmät toteumat</h2><p class="muted">Toteumat vaativat käsittelyn vuoron jälkeen</p></div><button class="text-button" data-view="reports">Näytä kaikki →</button></div>${renderReportsTable(pending.slice(0, 4))}</section>`;
}

function renderReportsTable(reports) {
  if (!reports.length) return '<div class="empty-state"><span>✓</span><strong>Kaikki käsitelty</strong><p>Uusia toteumia ei ole tällä hetkellä.</p></div>';
  return `<div class="table-wrap"><table><thead><tr><th>Lääkäri</th><th>Vuoro</th><th>Potilaat</th><th>Arvioitu korvaus</th><th>Tila</th><th></th></tr></thead><tbody>${reports.map(r => `<tr><td><div class="person"><span class="avatar small">${r.doctor.charAt(0)}</span><strong>${r.doctor}</strong></div></td><td>${formatDate(r.date)}<small class="subline">${state.shifts.find(s => s.id === r.shiftId)?.type || 'Päivystys'}</small></td><td>${r.patients}</td><td><strong>${r.compensation != null ? formatCurrency(r.compensation) : '—'}</strong></td><td><span class="status pending">${r.status}</span></td><td><button class="small-button" data-report="${r.id}">Avaa</button></td></tr>`).join('')}</tbody></table></div>`;
}

function bindEvents() {
  document.querySelector('#login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const found = demoUsers.find(u => u.email === data.get('email') && u.password === data.get('password'));
    if (!found) { document.querySelector('#login-error').hidden = false; return; }
    state.user = { name: found.name, email: found.email, role: found.role, careerLevel: found.careerLevel, employmentType: found.employmentType }; saveState(); render();
  });
  document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', e => {
    const view = e.currentTarget.dataset.view;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === e.currentTarget));
    if (view === 'admin' && state.user.role === 'admin') document.querySelector('.content').innerHTML = renderAdmin();
    if (view === 'calendar' && state.user.role === 'doctor') document.querySelector('.content').innerHTML = renderDoctor();
    if (view === 'reports' && state.user.role === 'admin') document.querySelector('.content').innerHTML = renderReportsPage();
    if (view === 'my-reports' && state.user.role === 'doctor') document.querySelector('.content').innerHTML = renderMyReportsPage();
    bindEvents();
  }));
  document.querySelectorAll('[data-month]').forEach(el => el.addEventListener('click', e => {
    const next = new Date(state.selectedMonth);
    next.setMonth(next.getMonth() + Number(e.currentTarget.dataset.month));
    const min = currentMonth();
    const max = lastBookableMonth();
    state.selectedMonth = next < min ? min : next > max ? max : next;
    render();
  }));
  document.querySelectorAll('[data-shift]').forEach(el => el.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    reserveShift(Number(el.dataset.shift));
  }));
  document.querySelectorAll('[data-report]').forEach(el => el.addEventListener('click', () => updateReport(Number(el.dataset.report))));
  document.querySelector('#confirm-shift')?.addEventListener('click', confirmShift);
  document.querySelector('#confirm-report')?.addEventListener('click', confirmReport);
  document.querySelector('#report-edit-form')?.addEventListener('submit', saveReportEdits);
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.querySelector('#report-form')?.addEventListener('submit', submitReport);
  document.querySelector('[data-dismiss-notice]')?.addEventListener('click', () => { state.lastSubmittedAmount = null; saveState(); render(); });
}

function renderReportsPage() {
  return `<div class="page-heading"><div><p class="eyebrow">Ylläpitäjän työpöytä</p><h1>Toteumat</h1><p class="muted">Tarkista ja merkitse toteumat käsitellyiksi.</p></div></div><section class="panel"><div class="panel-heading"><h2>Saapuneet toteumat</h2></div>${renderReportsTable(state.reports)}</section>`;
}

function renderMyReportsPage() {
  const mine = state.reports.filter(r => r.doctor === state.user.name);
  const reportable = state.shifts.filter(s => s.doctor === state.user.name && !mine.some(r => r.shiftId === s.id));
  const amountNotice = state.lastSubmittedAmount ? `<div class="amount-notice"><span>✓</span><div><strong>Toteuma lähetetty</strong><p>Arvioitu korvaus: <b>${formatCurrency(state.lastSubmittedAmount)}</b></p></div><button type="button" data-dismiss-notice aria-label="Sulje">×</button></div>` : '';
  return `${amountNotice}<div class="page-heading"><div><p class="eyebrow">Lääkärin työpöytä</p><h1>Omat toteumat</h1><p class="muted">Kalenterin tiedot täyttyvät automaattisesti. Täydennä vain toteutuneet tiedot.</p></div></div>${reportable.length ? `<section class="panel report-form-panel"><div class="panel-heading"><div><h2>Tee uusi päivystysilmoitus</h2><p class="muted">Tarkista vuoron perustiedot ja ilmoita toteutunut työaika.</p></div></div><form id="report-form" class="report-form"><label>Vuoro<select name="shiftId" required>${reportable.map(s => `<option value="${s.id}">${formatDate(s.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${s.type} · ${s.start}–${s.end}</option>`).join('')}</select></label><label>Hoitolinja<select name="careLine" required><option>Kiireellinen</option><option>Triage</option><option>Puhelinlääkäri</option><option>Ruuhkan purku</option></select></label><label>Toteutunut alkuaika<input name="actualStart" type="time" required /></label><label>Toteutunut loppuaika<input name="actualEnd" type="time" required /></label><label>Uraporras<input name="careerLevel" value="${state.user.careerLevel || ''}" required /></label><label>Työsuhde<input name="employmentType" value="${state.user.employmentType || ''}" required /></label><label class="full-field">Yhteenveto<textarea name="summary" rows="4" placeholder="Kirjoita tarvittaessa lisätiedot..." required></textarea></label><button class="button primary" type="submit">Lähetä päivystysilmoitus <span>→</span></button></form></section>` : ''}<section class="panel"><div class="panel-heading"><h2>Lähetetyt toteumat</h2></div>${mine.length ? renderReportsTable(mine) : '<div class="empty-state"><span>▤</span><strong>Ei vielä toteumia</strong><p>Vuoron jälkeen täytetyt toteumat näkyvät täällä.</p></div>'}</section>`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(value);
}

function calculateCompensation(date, start, end, careerLevel) {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  const hours = Math.max(0, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60);
  const weekendMultiplier = [0, 6].includes(new Date(`${date}T12:00:00`).getDay()) ? 1.5 : 1;
  return Math.round(hours * (hourlyRates[careerLevel] || 55) * weekendMultiplier * 100) / 100;
}

function reserveShift(id) {
  const shift = state.shifts.find(s => s.id === id);
  if (!shift) return;
  if (shift.doctor === state.user.name) {
    document.querySelector('.content').innerHTML = renderMyReportsPage();
    bindEvents();
    return;
  }
  if (shift.doctor) return;
  if (shift.requiredCareerLevel === 'Valmis lääkäri' && state.user.careerLevel === 'Kandi') {
    openModal(`<div class="modal-backdrop" data-close-modal><section class="modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-close-modal aria-label="Sulje">×</button><p class="eyebrow">Varausrajoitus</p><h2>Vuoroa ei voi varata</h2><p class="modal-note">Tämä vuoro on rajattu valmiille lääkäreille. Kandi näkee vuoron kalenterissa, mutta ei voi varata sitä.</p><div class="modal-actions"><button class="button primary" data-close-modal>Selvä</button></div></section></div>`);
    return;
  }
  openModal(renderShiftConfirmation(shift));
}

function renderShiftConfirmation(shift) {
  return `<div class="modal-backdrop" data-close-modal data-shift="${shift.id}"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="shift-confirm-title" onclick="event.stopPropagation()"><button class="modal-close" data-close-modal aria-label="Sulje">×</button><p class="eyebrow">Vahvista varaus</p><h2 id="shift-confirm-title">Varaa päivystysvuoro</h2><div class="confirmation-details"><div><small>Vuoro</small><strong>${formatDate(shift.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div><div><small>Tehtävä ja aika</small><strong>${shift.type} · ${shift.start}–${shift.end}</strong></div><label>Nimi<input id="confirm-name" value="${state.user.name}" required /></label><label>Sähköposti<input id="confirm-email" type="email" value="${state.user.email || 'laakari@hyvaks.fi'}" required /></label><div><small>Uraporras</small><strong>${state.user.careerLevel}</strong></div><div><small>Työsuhde</small><strong>${state.user.employmentType}</strong></div></div><p class="modal-note">Tarkista tietosi ennen vahvistamista. Voit korjata nimi- tai sähköpostitiedot ennen varausta.</p><div class="modal-actions"><button class="button secondary" data-close-modal>Peruuta</button><button class="button primary" id="confirm-shift">Vahvista varaus</button></div></section></div>`;
}

function openModal(content) {
  document.body.insertAdjacentHTML('beforeend', content);
  bindEvents();
}

function closeModal(event) {
  if (event) event.stopPropagation();
  document.querySelector('.modal-backdrop')?.remove();
}

function confirmShift() {
  const modal = document.querySelector('.modal-backdrop');
  const shift = state.shifts.find(s => s.id === Number(modal?.dataset.shift) && !s.doctor);
  if (!shift) return closeModal();
  const name = modal.querySelector('#confirm-name')?.value.trim();
  const email = modal.querySelector('#confirm-email')?.value.trim();
  if (!name || !email) return;
  state.user = { ...state.user, name, email };
  shift.doctor = name;
  saveState();
  closeModal();
  render();
}

function submitReport(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const shift = state.shifts.find(s => s.id === Number(data.get('shiftId')));
  const actualStart = data.get('actualStart');
  const actualEnd = data.get('actualEnd');
  const amount = calculateCompensation(shift.date, actualStart, actualEnd, data.get('careerLevel'));
  state.lastSubmittedAmount = amount;
  state.reports.unshift({
    id: Date.now(),
    shiftId: Number(data.get('shiftId')),
    doctor: state.user.name,
    date: shift.date,
    status: 'Käsittelyssä',
    summary: data.get('summary'),
    patients: 0,
    careLine: data.get('careLine'),
    actualStart,
    actualEnd,
    compensation: amount,
    careerLevel: data.get('careerLevel'),
    employmentType: data.get('employmentType'),
    alarmCompensation: false,
    rushRecovery: false
  });
  saveState();
  document.querySelector('.content').innerHTML = renderMyReportsPage();
  bindEvents();
}

function confirmReport() {
  const modal = document.querySelector('.modal-backdrop');
  const id = Number(modal?.dataset.report);
  const report = state.reports.find(r => r.id === id);
  if (!report) return closeModal();
  const form = modal.querySelector('#report-edit-form');
  const data = new FormData(form);
  report.patients = Number(data.get('patients'));
  report.summary = data.get('summary').trim();
  report.careLine = data.get('careLine');
  report.careerLevel = data.get('careerLevel');
  report.employmentType = data.get('employmentType');
  report.actualStart = data.get('actualStart');
  report.actualEnd = data.get('actualEnd');
  report.alarmCompensation = data.get('alarmCompensation') === 'on';
  report.rushRecovery = data.get('rushRecovery') === 'on';
  report.status = 'Käsitelty';
  saveState();
  closeModal();
  document.querySelector('.content').innerHTML = renderReportsPage();
  bindEvents();
}

function updateReport(id) {
  const report = state.reports.find(r => r.id === id);
  if (report) openModal(renderReportConfirmation(report));
}

function renderReportConfirmation(report) {
  const shift = state.shifts.find(s => s.id === report.shiftId);
  return `<div class="modal-backdrop" data-close-modal data-report="${report.id}"><section class="modal wide-modal" role="dialog" aria-modal="true" aria-labelledby="report-confirm-title" onclick="event.stopPropagation()"><button class="modal-close" data-close-modal aria-label="Sulje">×</button><p class="eyebrow">Toteuman tarkistus</p><h2 id="report-confirm-title">Päivystysilmoituksen tiedot</h2><form id="report-edit-form"><div class="confirmation-details report-details"><div><small>Lääkäri</small><strong>${report.doctor}</strong></div><div><small>Vuoro</small><strong>${formatDate(report.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div><div><small>Kalenterin työaika</small><strong>${shift ? `${shift.start}–${shift.end}` : '—'}</strong></div><div><small>Kalenterin tehtävä</small><strong>${shift?.type || 'Päivystys'}</strong></div><label>Hoitolinja<input name="careLine" value="${report.careLine || shift?.type || ''}" required /></label><label>Uraporras<input name="careerLevel" value="${report.careerLevel || ''}" required /></label><label>Työsuhde<input name="employmentType" value="${report.employmentType || ''}" required /></label><label>Toteutunut alkuaika<input name="actualStart" type="time" value="${report.actualStart || shift?.start || ''}" required /></label><label>Toteutunut loppuaika<input name="actualEnd" type="time" value="${report.actualEnd || shift?.end || ''}" required /></label><label>Potilaita yhteensä<input name="patients" type="number" min="0" value="${report.patients}" required /></label><label>Tila<select name="status"><option ${report.status === 'Käsittelyssä' ? 'selected' : ''}>Käsittelyssä</option><option ${report.status === 'Käsitelty' ? 'selected' : ''}>Käsitelty</option></select></label><label class="check-field"><input name="alarmCompensation" type="checkbox" ${report.alarmCompensation ? 'checked' : ''} /> Hälytysraha</label><label class="check-field"><input name="rushRecovery" type="checkbox" ${report.rushRecovery ? 'checked' : ''} /> Ruuhkanpurku</label></div><label class="modal-field">Yhteenveto<textarea name="summary" rows="4" required>${report.summary}</textarea></label><p class="modal-note">Voit korjata ilmoituksen tietoja ennen hyväksyntää. Tiedot ovat samaa rakennetta kuin lääkärin lähettämässä ilmoituksessa.</p><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Peruuta</button><button type="submit" class="button secondary">Tallenna muutokset</button><button type="button" class="button primary" id="confirm-report">Merkitse käsitellyksi</button></div></form></section></div>`;
}

function saveReportEdits(event) {
  event.preventDefault();
  const modal = document.querySelector('.modal-backdrop');
  const report = state.reports.find(r => r.id === Number(modal?.dataset.report));
  if (!report) return closeModal();
  const data = new FormData(event.currentTarget);
  report.patients = Number(data.get('patients'));
  report.summary = data.get('summary').trim();
  report.careLine = data.get('careLine');
  report.careerLevel = data.get('careerLevel');
  report.employmentType = data.get('employmentType');
  report.actualStart = data.get('actualStart');
  report.actualEnd = data.get('actualEnd');
  report.alarmCompensation = data.get('alarmCompensation') === 'on';
  report.rushRecovery = data.get('rushRecovery') === 'on';
  report.status = data.get('status');
  saveState();
  closeModal();
  document.querySelector('.content').innerHTML = renderReportsPage();
  bindEvents();
}

render();
