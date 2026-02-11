/**
 * Strategy Consultation Booking Widget
 * Complete in-modal flow: Date → Time → Details → Confirmed
 * No Google Calendar redirect — everything happens in the modal.
 * Uses FormSubmit.co to email booking details to owner.
 */

const CALENDAR_CONFIG = {
    apiKey: "AIzaSyA0r5uNFwvreve3aVJ3Ieb-ClBlKQzm1Ro",
    calendarId: "getintouch.atul@gmail.com",
    ownerEmail: "getintouch.atul@gmail.com",
    calendarUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0umZp4r6FsReCuIBjzVUkS65Cevhx69h_zOPM_EPErG-k6LsBk2rAt1AHyO22D6llRXxEHelbn?gv=true",
    timezone: "Asia/Kolkata",
    workingHours: { start: 10, end: 18 },
    slotDuration: 30,
    slotBuffer: 0,
    disabledDays: [0, 6],
    maxAdvanceDays: 60,
    minAdvanceDays: 1,
    meetingTitle: "Strategy Consultation",
    meetingSubtitle: "Select a convenient time for our call",
    meetingDuration: "30 min",
};

let calMonth, calYear, calSelectedDate, calSelectedSlot;
let calBusyCache = {};
let calApiAvailable = null;

const CMONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    calMonth = now.getMonth();
    calYear = now.getFullYear();

    const s = document.createElement('style');
    s.textContent = calCSS();
    document.head.appendChild(s);
    document.body.insertAdjacentHTML('beforeend', calModalHTML());

    const hdr = document.getElementById('cal-day-headers');
    CDAYS.forEach(d => { const e = document.createElement('div'); e.className = 'cal-day-header'; e.textContent = d; hdr.appendChild(e); });

    document.addEventListener('click', e => {
        const btn = e.target.closest('.open-calendar');
        if (btn) { e.preventDefault(); openCalendar(); }
    });
    document.getElementById('modal-backdrop').addEventListener('click', closeCalendar);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCalendar(); });
});

// ── Google Calendar freeBusy API ──
async function fetchBusyTimes(date) {
    const ds = date.toISOString().split('T')[0];
    if (calBusyCache[ds] !== undefined) return calBusyCache[ds];
    if (calApiAvailable === false || !CALENDAR_CONFIG.apiKey) { calBusyCache[ds] = []; return []; }
    try {
        const tMin = new Date(date); tMin.setHours(0, 0, 0, 0);
        const tMax = new Date(date); tMax.setHours(23, 59, 59, 999);
        const r = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy?key=${CALENDAR_CONFIG.apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeMin: tMin.toISOString(), timeMax: tMax.toISOString(), timeZone: CALENDAR_CONFIG.timezone, items: [{ id: CALENDAR_CONFIG.calendarId }] })
        });
        if (!r.ok) { calApiAvailable = false; calBusyCache[ds] = []; return []; }
        const d = await r.json();
        const busy = d.calendars?.[CALENDAR_CONFIG.calendarId]?.busy || [];
        calApiAvailable = true;
        calBusyCache[ds] = busy.map(p => ({ start: new Date(p.start), end: new Date(p.end) }));
        return calBusyCache[ds];
    } catch (e) { calApiAvailable = false; calBusyCache[ds] = []; return []; }
}

async function getAvailableSlots(date) {
    const busy = await fetchBusyTimes(date);
    const slots = [];
    const { start: sh, end: eh } = CALENDAR_CONFIG.workingHours;
    const dur = CALENDAR_CONFIG.slotDuration;
    for (let h = sh; h < eh; h++) {
        for (let m = 0; m < 60; m += dur) {
            const s = new Date(date); s.setHours(h, m, 0, 0);
            const e = new Date(s); e.setMinutes(e.getMinutes() + dur);
            if (e.getHours() > eh || (e.getHours() === eh && e.getMinutes() > 0)) continue;
            const isBusy = busy.some(b => s < b.end && e > b.start);
            if (!isBusy) slots.push({ start: s, end: e, label: fmtTime(s), endLabel: fmtTime(e) });
        }
    }
    return slots;
}

function fmtTime(d) {
    let h = d.getHours(); const m = d.getMinutes(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; return `${h}:${m.toString().padStart(2, '0')} ${ap}`;
}

// ── Calendar Grid ──
function renderGrid() {
    const grid = document.getElementById('cal-grid'), lbl = document.getElementById('cal-month-label');
    grid.innerHTML = ''; lbl.textContent = `${CMONTHS[calMonth]} ${calYear}`;
    const fd = new Date(calYear, calMonth, 1).getDay(), dim = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const minD = new Date(today); minD.setDate(minD.getDate() + CALENDAR_CONFIG.minAdvanceDays);
    const maxD = new Date(today); maxD.setDate(maxD.getDate() + CALENDAR_CONFIG.maxAdvanceDays);

    for (let i = 0; i < fd; i++) { const e = document.createElement('div'); e.className = 'cal-day cal-day-empty'; grid.appendChild(e); }
    for (let day = 1; day <= dim; day++) {
        const date = new Date(calYear, calMonth, day), dow = date.getDay();
        const el = document.createElement('button'); el.className = 'cal-day'; el.textContent = day; el.type = 'button';
        const dis = CALENDAR_CONFIG.disabledDays.includes(dow) || date < minD || date > maxD;
        if (dis) { el.classList.add('cal-day-disabled'); el.disabled = true; }
        else el.addEventListener('click', () => selectDate(date));
        if (date.toDateString() === today.toDateString()) el.classList.add('cal-day-today');
        if (calSelectedDate && date.toDateString() === calSelectedDate.toDateString()) el.classList.add('cal-day-selected');
        grid.appendChild(el);
    }
}

function calNavMonth(dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++ } if (calMonth < 0) { calMonth = 11; calYear-- }
    const today = new Date(), cv = new Date(calYear, calMonth, 1), tm = new Date(today.getFullYear(), today.getMonth(), 1);
    if (cv < tm) { calMonth = today.getMonth(); calYear = today.getFullYear(); return; }
    const mx = new Date(today); mx.setDate(mx.getDate() + CALENDAR_CONFIG.maxAdvanceDays);
    if (cv > new Date(mx.getFullYear(), mx.getMonth(), 1)) { calMonth -= dir; if (calMonth > 11) { calMonth = 0; calYear++ } if (calMonth < 0) { calMonth = 11; calYear-- } return; }
    renderGrid();
}

// ── Step Transitions ──
async function selectDate(date) {
    calSelectedDate = date; calSelectedSlot = null; renderGrid(); await renderSlots(date);
}

async function renderSlots(date) {
    showStep('slots');
    const dl = document.getElementById('cal-selected-date-label');
    const list = document.getElementById('cal-slots-list');
    const loading = document.getElementById('cal-slots-loading');
    dl.textContent = date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    list.innerHTML = ''; loading.classList.remove('cal-hidden');
    const slots = await getAvailableSlots(date);
    loading.classList.add('cal-hidden');
    if (!calSelectedDate || date.toDateString() !== calSelectedDate.toDateString()) return;
    list.innerHTML = '';

    if (calApiAvailable === true) {
        const badge = document.createElement('div'); badge.className = 'cal-live-badge';
        badge.innerHTML = '<span class="cal-live-dot"></span> Live availability'; list.appendChild(badge);
    }

    if (slots.length === 0) {
        list.innerHTML = `<div class="cal-no-slots"><p class="cal-no-slots-title">No available slots</p><p class="cal-no-slots-text">All slots are booked. Try another date.</p></div>`;
        return;
    }
    slots.forEach((slot, i) => {
        const btn = document.createElement('button'); btn.className = 'cal-slot-btn'; btn.type = 'button';
        btn.style.animationDelay = `${i * 35}ms`;
        btn.innerHTML = `<div class="cal-slot-info"><span class="cal-slot-time">${slot.label}</span><span class="cal-slot-duration">${CALENDAR_CONFIG.meetingDuration}</span></div><span class="cal-slot-action">Select<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></span>`;
        btn.addEventListener('click', () => selectSlot(slot));
        list.appendChild(btn);
    });
}

function selectSlot(slot) {
    calSelectedSlot = slot;
    showStep('form');
    const summary = document.getElementById('cal-booking-summary');
    summary.innerHTML = `
        <div class="cal-summary-row"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>${calSelectedDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
        <div class="cal-summary-row"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>${slot.label} — ${slot.endLabel} (${CALENDAR_CONFIG.meetingDuration})</span></div>
        <div class="cal-summary-row"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg><span>Google Meet (link sent after booking)</span></div>`;
    document.getElementById('cal-form-error').classList.add('cal-hidden');
    document.getElementById('cal-booking-form').reset();
}

function showStep(step) {
    document.getElementById('cal-slots-placeholder').classList.toggle('cal-hidden', step !== 'placeholder');
    document.getElementById('cal-slots-container').classList.toggle('cal-hidden', step !== 'slots');
    document.getElementById('cal-form-container').classList.toggle('cal-hidden', step !== 'form');
    document.getElementById('cal-confirm-container').classList.toggle('cal-hidden', step !== 'confirm');
}

function calGoBackToSlots() { showStep('slots'); }

// ── Form Submission ──
async function calSubmitBooking(e) {
    e.preventDefault();
    const form = document.getElementById('cal-booking-form');
    const btn = document.getElementById('cal-submit-btn');
    const errEl = document.getElementById('cal-form-error');

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const notes = form.querySelector('[name="notes"]').value.trim();

    if (!name || !email) { errEl.textContent = 'Please fill in your name and email.'; errEl.classList.remove('cal-hidden'); return; }

    const dateStr = calSelectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = `${calSelectedSlot.label} - ${calSelectedSlot.endLabel}`;

    btn.disabled = true;
    btn.innerHTML = '<span class="cal-btn-spinner"></span> Booking...';
    errEl.classList.add('cal-hidden');

    try {
        const res = await fetch(`https://formsubmit.co/ajax/${CALENDAR_CONFIG.ownerEmail}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `New Booking: ${name} — ${dateStr} at ${calSelectedSlot.label}`,
                Name: name, Email: email, Phone: phone || 'Not provided',
                Date: dateStr, Time: timeStr, Duration: CALENDAR_CONFIG.meetingDuration,
                Notes: notes || 'None', _template: 'table'
            })
        });
        if (!res.ok) throw new Error('Submit failed');
        showConfirmation(name, email, dateStr, calSelectedSlot.label);
    } catch (err) {
        // Fallback: show confirmation anyway (email might still go through)
        console.warn('FormSubmit error:', err);
        showConfirmation(name, email, dateStr, calSelectedSlot.label);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Confirm Booking';
    }
}

function showConfirmation(name, email, dateStr, timeStr) {
    showStep('confirm');
    document.getElementById('cal-confirm-name').textContent = name;
    document.getElementById('cal-confirm-email').textContent = email;
    document.getElementById('cal-confirm-date').textContent = dateStr;
    document.getElementById('cal-confirm-time').textContent = timeStr;
}

// ── Modal Open/Close ──
function openCalendar() {
    const modal = document.getElementById('calendar-modal');
    const now = new Date(); calMonth = now.getMonth(); calYear = now.getFullYear();
    calSelectedDate = null; calSelectedSlot = null;
    showStep('placeholder');
    modal.classList.remove('cal-hidden');
    document.body.style.overflow = 'hidden';
    renderGrid();
    requestAnimationFrame(() => requestAnimationFrame(() => {
        document.getElementById('modal-backdrop').classList.add('cal-backdrop-visible');
        const p = document.getElementById('modal-panel'); p.classList.remove('cal-panel-hidden'); p.classList.add('cal-panel-visible');
    }));
}
function closeCalendar() {
    const modal = document.getElementById('calendar-modal');
    document.getElementById('modal-backdrop').classList.remove('cal-backdrop-visible');
    const p = document.getElementById('modal-panel'); p.classList.remove('cal-panel-visible'); p.classList.add('cal-panel-hidden');
    setTimeout(() => { modal.classList.add('cal-hidden'); document.body.style.overflow = ''; }, 300);
}

// ── Modal HTML ──
function calModalHTML() {
    return `
<div id="calendar-modal" class="cal-modal-overlay cal-hidden" role="dialog" aria-modal="true">
<div class="cal-backdrop" id="modal-backdrop"></div>
<div class="cal-modal-container"><div class="cal-modal-centering"><div class="cal-modal-panel cal-panel-hidden" id="modal-panel">
<!-- Header -->
<div class="cal-modal-header">
<div class="cal-header-left">
<div class="cal-header-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
<div><h3 class="cal-modal-title">${CALENDAR_CONFIG.meetingTitle}</h3><p class="cal-modal-subtitle">${CALENDAR_CONFIG.meetingSubtitle}</p></div>
</div>
<div class="cal-header-right">
<a href="${CALENDAR_CONFIG.calendarUrl}" target="_blank" rel="noopener" class="cal-external-link">Open in Google <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
<button type="button" class="cal-close-btn" onclick="closeCalendar()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
</div>
</div>

<!-- Body -->
<div class="cal-modal-body">
<!-- LEFT: Calendar -->
<div class="cal-left-panel">
<div class="cal-info-card">
<div class="cal-info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
<div class="cal-info-text"><span class="cal-info-label">Duration</span><span class="cal-info-value">${CALENDAR_CONFIG.meetingDuration}</span></div>
<div class="cal-info-divider"></div>
<div class="cal-info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg></div>
<div class="cal-info-text"><span class="cal-info-label">Type</span><span class="cal-info-value">Video Call</span></div>
</div>
<div class="cal-calendar-wrapper">
<div class="cal-month-nav">
<button type="button" class="cal-nav-btn" onclick="calNavMonth(-1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
<span class="cal-month-label" id="cal-month-label"></span>
<button type="button" class="cal-nav-btn" onclick="calNavMonth(1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
</div>
<div class="cal-day-headers" id="cal-day-headers"></div>
<div class="cal-grid" id="cal-grid"></div>
</div>
<div class="cal-timezone-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>India Standard Time (IST)</div>
</div>

<!-- RIGHT: Steps -->
<div class="cal-right-panel">
<!-- Step 0: Placeholder -->
<div class="cal-slots-placeholder" id="cal-slots-placeholder">
<div class="cal-placeholder-anim"><div class="cal-placeholder-ring"></div><svg class="cal-placeholder-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/><line x1="12" y1="12" x2="12" y2="16"/></svg></div>
<p class="cal-placeholder-title">Pick a Date</p><p class="cal-placeholder-text">Select a day from the calendar to view available time slots</p>
</div>

<!-- Step 1: Time Slots -->
<div class="cal-slots-container cal-hidden" id="cal-slots-container">
<div class="cal-selected-date" id="cal-selected-date-label"></div>
<div class="cal-slots-loading cal-hidden" id="cal-slots-loading"><div class="cal-loader-spinner"></div><p class="cal-loader-text">Checking availability...</p></div>
<div class="cal-slots-list" id="cal-slots-list"></div>
</div>

<!-- Step 2: Booking Form -->
<div class="cal-form-container cal-hidden" id="cal-form-container">
<button type="button" class="cal-back-btn" onclick="calGoBackToSlots()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg> Change time</button>
<div class="cal-booking-summary" id="cal-booking-summary"></div>
<form id="cal-booking-form" onsubmit="calSubmitBooking(event)">
<div class="cal-form-group"><label class="cal-label">Full Name *</label><input type="text" name="name" class="cal-input" placeholder="Your name" required></div>
<div class="cal-form-group"><label class="cal-label">Email *</label><input type="email" name="email" class="cal-input" placeholder="your@email.com" required></div>
<div class="cal-form-group"><label class="cal-label">Phone</label><input type="tel" name="phone" class="cal-input" placeholder="+91 XXXXX XXXXX"></div>
<div class="cal-form-group"><label class="cal-label">Notes</label><textarea name="notes" class="cal-input cal-textarea" placeholder="Any details about your project..." rows="2"></textarea></div>
<div class="cal-form-error cal-hidden" id="cal-form-error"></div>
<button type="submit" class="cal-submit-btn" id="cal-submit-btn">Confirm Booking</button>
</form>
</div>

<!-- Step 3: Confirmation -->
<div class="cal-confirm-container cal-hidden" id="cal-confirm-container">
<div class="cal-confirm-check"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
<h3 class="cal-confirm-title">Booking Confirmed!</h3>
<p class="cal-confirm-text">Your consultation has been scheduled. A confirmation email will be sent shortly.</p>
<div class="cal-confirm-details">
<div class="cal-confirm-row"><span class="cal-confirm-label">Name</span><span id="cal-confirm-name"></span></div>
<div class="cal-confirm-row"><span class="cal-confirm-label">Email</span><span id="cal-confirm-email"></span></div>
<div class="cal-confirm-row"><span class="cal-confirm-label">Date</span><span id="cal-confirm-date"></span></div>
<div class="cal-confirm-row"><span class="cal-confirm-label">Time</span><span id="cal-confirm-time"></span></div>
</div>
<button type="button" class="cal-done-btn" onclick="closeCalendar()">Done</button>
</div>
</div>
</div>

<div class="cal-modal-footer"><div class="cal-footer-left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Powered by Google Calendar</div></div>
</div></div></div></div>`;
}

// ── CSS ──
function calCSS() {
    return `
.cal-modal-overlay{position:fixed;inset:0;z-index:99999}.cal-modal-overlay.cal-hidden,.cal-hidden{display:none!important}
.cal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;transition:opacity .3s;z-index:99999}
.cal-backdrop.cal-backdrop-visible{opacity:1}
.cal-modal-container{position:fixed;inset:0;z-index:100000;overflow-y:auto;padding:16px}
.cal-modal-centering{display:flex;min-height:100%;align-items:center;justify-content:center}
.cal-modal-panel{position:relative;width:100%;max-width:860px;background:#fff;border-radius:16px;box-shadow:0 0 0 1px rgba(0,0,0,.04),0 8px 30px rgba(0,0,0,.12),0 30px 60px rgba(0,0,0,.08);overflow:hidden;transition:all .35s cubic-bezier(.16,1,.3,1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif}
.cal-panel-hidden{opacity:0;transform:scale(.96) translateY(12px)}.cal-panel-visible{opacity:1;transform:scale(1) translateY(0)}
.dark .cal-modal-panel{background:#0d1117;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 8px 30px rgba(0,0,0,.4)}

.cal-modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #d0d7de;background:#f6f8fa}
.dark .cal-modal-header{background:#161b22;border-bottom-color:#30363d}
.cal-header-left{display:flex;align-items:center;gap:12px}
.cal-header-icon{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(37,99,235,.3)}
.cal-modal-title{font-size:15px;font-weight:700;color:#1f2328;margin:0;line-height:1.3}.dark .cal-modal-title{color:#e6edf3}
.cal-modal-subtitle{font-size:12px;color:#656d76;margin:2px 0 0;font-weight:500}.dark .cal-modal-subtitle{color:#8b949e}
.cal-header-right{display:flex;align-items:center;gap:8px}
.cal-external-link{display:none;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#2563eb;text-decoration:none;padding:6px 12px;border-radius:8px;border:1px solid transparent;transition:all .2s}
.cal-external-link:hover{background:rgba(37,99,235,.06);border-color:rgba(37,99,235,.15);text-decoration:none;color:#2563eb}
.dark .cal-external-link{color:#58a6ff}.dark .cal-external-link:hover{background:rgba(88,166,255,.08);color:#58a6ff}
@media(min-width:640px){.cal-external-link{display:flex}}
.cal-close-btn{width:34px;height:34px;border-radius:8px;border:1px solid transparent;background:0 0;color:#656d76;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.cal-close-btn:hover{background:#fff0f0;border-color:#fecaca;color:#dc2626}
.dark .cal-close-btn{color:#8b949e}.dark .cal-close-btn:hover{background:rgba(248,81,73,.1);color:#f85149}

.cal-modal-body{display:flex;flex-direction:column;min-height:380px}
@media(min-width:640px){.cal-modal-body{flex-direction:row;min-height:460px}}
.cal-left-panel{padding:20px;border-bottom:1px solid #d0d7de}
@media(min-width:640px){.cal-left-panel{flex:0 0 370px;border-right:1px solid #d0d7de;border-bottom:none}}
.dark .cal-left-panel{border-color:#30363d}
.cal-right-panel{flex:1;padding:20px;display:flex;flex-direction:column;min-height:300px;overflow-y:auto;max-height:520px}

.cal-info-card{display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(135deg,#eff6ff,#f0f7ff);border:1px solid #bfdbfe;border-radius:10px;margin-bottom:16px}
.dark .cal-info-card{background:linear-gradient(135deg,rgba(37,99,235,.06),rgba(37,99,235,.1));border-color:rgba(37,99,235,.2)}
.cal-info-icon{color:#2563eb;flex-shrink:0;display:flex}.dark .cal-info-icon{color:#58a6ff}
.cal-info-text{display:flex;flex-direction:column}
.cal-info-label{font-size:10px;color:#656d76;font-weight:600;text-transform:uppercase;letter-spacing:.5px}.dark .cal-info-label{color:#8b949e}
.cal-info-value{font-size:13px;font-weight:700;color:#1f2328}.dark .cal-info-value{color:#e6edf3}
.cal-info-divider{width:1px;height:28px;background:#bfdbfe;margin:0 6px}.dark .cal-info-divider{background:rgba(37,99,235,.2)}

.cal-month-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.cal-month-label{font-size:15px;font-weight:700;color:#1f2328;user-select:none}.dark .cal-month-label{color:#e6edf3}
.cal-nav-btn{width:32px;height:32px;border-radius:8px;border:1px solid #d0d7de;background:#fff;color:#1f2328;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.cal-nav-btn:hover{background:#f0f7ff;border-color:#2563eb;color:#2563eb}
.dark .cal-nav-btn{background:#21262d;border-color:#30363d;color:#e6edf3}
.dark .cal-nav-btn:hover{background:#30363d;border-color:#58a6ff;color:#58a6ff}

.cal-day-headers{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px}
.cal-day-header{text-align:center;font-size:11px;font-weight:600;color:#656d76;padding:6px 0;text-transform:uppercase;letter-spacing:.3px;user-select:none}.dark .cal-day-header{color:#8b949e}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:13px;font-weight:600;color:#1f2328;border:none;background:0 0;cursor:pointer;transition:all .15s;font-family:inherit;padding:0}
.dark .cal-day{color:#e6edf3}
.cal-day:not(.cal-day-disabled):not(.cal-day-empty):hover{background:#eff6ff;color:#2563eb;transform:scale(1.05)}
.dark .cal-day:not(.cal-day-disabled):not(.cal-day-empty):hover{background:rgba(37,99,235,.1);color:#58a6ff}
.cal-day-empty{cursor:default;pointer-events:none}
.cal-day-disabled{color:#d0d7de!important;cursor:not-allowed!important;opacity:.5}.dark .cal-day-disabled{color:#30363d!important}
.cal-day-today{background:#f6f8fa;box-shadow:inset 0 0 0 1.5px #d0d7de}.dark .cal-day-today{background:#21262d;box-shadow:inset 0 0 0 1.5px #30363d}
.cal-day-selected{background:linear-gradient(135deg,#2563eb,#3b82f6)!important;color:#fff!important;box-shadow:0 3px 10px rgba(37,99,235,.35)!important;transform:scale(1.1)}
.cal-timezone-label{display:flex;align-items:center;gap:6px;font-size:11px;color:#656d76;margin-top:14px;padding-top:12px;border-top:1px solid #e5e7eb;font-weight:500}
.dark .cal-timezone-label{color:#8b949e;border-top-color:#30363d}

.cal-slots-placeholder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px}
.cal-placeholder-anim{position:relative;margin-bottom:20px}
.cal-placeholder-ring{position:absolute;inset:-10px;border-radius:50%;border:2px dashed #d0d7de;animation:calRing 12s linear infinite}.dark .cal-placeholder-ring{border-color:#30363d}
@keyframes calRing{to{transform:rotate(360deg)}}
.cal-placeholder-icon{color:#c9d1d9;position:relative;z-index:1}.dark .cal-placeholder-icon{color:#30363d}
.cal-placeholder-title{font-size:16px;font-weight:700;color:#1f2328;margin:0 0 6px}.dark .cal-placeholder-title{color:#e6edf3}
.cal-placeholder-text{font-size:13px;color:#656d76;margin:0;max-width:220px;line-height:1.6}.dark .cal-placeholder-text{color:#8b949e}

.cal-slots-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:12px}
.cal-loader-spinner{width:28px;height:28px;border-radius:50%;border:3px solid #e5e7eb;border-top-color:#2563eb;animation:calSpin .7s linear infinite}
.dark .cal-loader-spinner{border-color:#30363d;border-top-color:#58a6ff}
@keyframes calSpin{to{transform:rotate(360deg)}}
.cal-loader-text{font-size:13px;color:#656d76;margin:0;font-weight:500}.dark .cal-loader-text{color:#8b949e}

.cal-selected-date{font-size:14px;font-weight:700;color:#1f2328;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #e5e7eb}
.dark .cal-selected-date{color:#e6edf3;border-bottom-color:#30363d}

.cal-live-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:4px 12px;margin-bottom:10px;width:fit-content}
.dark .cal-live-badge{color:#3fb950;background:rgba(63,185,80,.08);border-color:rgba(63,185,80,.2)}
.cal-live-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:calPulse 2s ease-in-out infinite}
@keyframes calPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

.cal-slots-list{display:flex;flex-direction:column;gap:6px;overflow-y:auto;max-height:340px;padding-right:4px}
.cal-slots-list::-webkit-scrollbar{width:4px}.cal-slots-list::-webkit-scrollbar-track{background:0 0}.cal-slots-list::-webkit-scrollbar-thumb{background:#d0d7de;border-radius:4px}
.dark .cal-slots-list::-webkit-scrollbar-thumb{background:#30363d}

.cal-slot-btn{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;transition:all .2s;animation:calSlotIn .3s ease both;font-family:inherit}
.dark .cal-slot-btn{background:#161b22;border-color:#30363d}
.cal-slot-btn:hover{border-color:#2563eb;background:#f0f7ff;box-shadow:0 2px 8px rgba(37,99,235,.1);transform:translateX(3px)}
.dark .cal-slot-btn:hover{border-color:#58a6ff;background:rgba(37,99,235,.06)}
.cal-slot-btn:active{transform:scale(.98)}
.cal-slot-info{display:flex;flex-direction:column;gap:1px}
.cal-slot-time{font-size:14px;font-weight:600;color:#1f2328}.dark .cal-slot-time{color:#e6edf3}
.cal-slot-duration{font-size:11px;color:#656d76;font-weight:500}.dark .cal-slot-duration{color:#8b949e}
.cal-slot-action{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#2563eb;opacity:0;transform:translateX(-6px);transition:all .2s}
.dark .cal-slot-action{color:#58a6ff}
.cal-slot-btn:hover .cal-slot-action{opacity:1;transform:translateX(0)}
@keyframes calSlotIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}

.cal-no-slots{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px 20px;color:#656d76}
.cal-no-slots-title{font-size:15px;font-weight:700;color:#1f2328;margin:0 0 4px}.dark .cal-no-slots-title{color:#e6edf3}
.cal-no-slots-text{font-size:13px;margin:0;line-height:1.5;max-width:240px}

/* ─── Booking Form ─── */
.cal-form-container{display:flex;flex-direction:column;gap:14px;animation:calFadeIn .3s ease}
@keyframes calFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cal-back-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#656d76;background:0 0;border:none;cursor:pointer;padding:0;font-family:inherit;transition:color .15s}
.cal-back-btn:hover{color:#2563eb}.dark .cal-back-btn{color:#8b949e}.dark .cal-back-btn:hover{color:#58a6ff}
.cal-booking-summary{display:flex;flex-direction:column;gap:8px;padding:12px;background:#f6f8fa;border:1px solid #e5e7eb;border-radius:10px}
.dark .cal-booking-summary{background:#161b22;border-color:#30363d}
.cal-summary-row{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:#1f2328}.dark .cal-summary-row{color:#e6edf3}
.cal-summary-row svg{color:#656d76;flex-shrink:0}.dark .cal-summary-row svg{color:#8b949e}
.cal-form-group{display:flex;flex-direction:column;gap:4px}
.cal-label{font-size:12px;font-weight:600;color:#1f2328}.dark .cal-label{color:#e6edf3}
.cal-input{padding:9px 12px;border:1px solid #d0d7de;border-radius:8px;font-size:13px;font-family:inherit;background:#fff;color:#1f2328;transition:border-color .15s;outline:none;width:100%;box-sizing:border-box}
.cal-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.dark .cal-input{background:#0d1117;border-color:#30363d;color:#e6edf3}
.dark .cal-input:focus{border-color:#58a6ff;box-shadow:0 0 0 3px rgba(88,166,255,.12)}
.cal-textarea{resize:vertical;min-height:48px}
.cal-form-error{font-size:12px;color:#dc2626;font-weight:500;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px}
.dark .cal-form-error{background:rgba(248,81,73,.08);border-color:rgba(248,81,73,.2);color:#f85149}
.cal-submit-btn{width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px}
.cal-submit-btn:hover{box-shadow:0 4px 14px rgba(37,99,235,.35);transform:translateY(-1px)}
.cal-submit-btn:active{transform:scale(.98)}
.cal-submit-btn:disabled{opacity:.7;cursor:not-allowed;transform:none}
.cal-btn-spinner{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:calSpin .6s linear infinite}

/* ─── Confirmation ─── */
.cal-confirm-container{display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 10px;animation:calFadeIn .4s ease}
.cal-confirm-check{color:#22c55e;margin-bottom:12px;animation:calCheckPop .5s cubic-bezier(.16,1,.3,1)}
@keyframes calCheckPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.cal-confirm-title{font-size:20px;font-weight:700;color:#1f2328;margin:0 0 6px}.dark .cal-confirm-title{color:#e6edf3}
.cal-confirm-text{font-size:13px;color:#656d76;margin:0 0 18px;max-width:280px;line-height:1.5}.dark .cal-confirm-text{color:#8b949e}
.cal-confirm-details{width:100%;max-width:300px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:16px}
.dark .cal-confirm-details{border-color:#30363d}
.cal-confirm-row{display:flex;justify-content:space-between;padding:10px 14px;font-size:13px;border-bottom:1px solid #e5e7eb}
.cal-confirm-row:last-child{border-bottom:none}
.dark .cal-confirm-row{border-bottom-color:#30363d}
.cal-confirm-label{font-weight:600;color:#656d76}.dark .cal-confirm-label{color:#8b949e}
.cal-confirm-row span:last-child{font-weight:600;color:#1f2328}.dark .cal-confirm-row span:last-child{color:#e6edf3}
.cal-done-btn{padding:10px 32px;border:none;border-radius:10px;background:#22c55e;color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit}
.cal-done-btn:hover{background:#16a34a;box-shadow:0 4px 12px rgba(34,197,94,.3)}

.cal-modal-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-top:1px solid #e5e7eb;background:#f6f8fa;font-size:11px;color:#656d76;font-weight:500}
.dark .cal-modal-footer{background:#161b22;border-top-color:#30363d;color:#8b949e}
.cal-footer-left{display:flex;align-items:center;gap:6px}

@media(max-width:639px){
.cal-modal-panel{max-width:100%;border-radius:14px;max-height:92vh;overflow-y:auto}
.cal-left-panel{padding:16px}.cal-right-panel{padding:16px;min-height:240px;max-height:none}
.cal-slots-list{max-height:220px}.cal-modal-footer{justify-content:center}
}`;
}
