/**
 * Booking Popup Widget — Micro Application
 * Uses Google Calendar API for availability + Google Apps Script for booking.
 * Flow: Date → Time → Form → Confirmed ✅
 */
const CAL = {
    apiKey: "AIzaSyA0r5uNFwvreve3aVJ3Ieb-ClBlKQzm1Ro",
    calendarId: "getintouch.atul@gmail.com",
    appsScriptUrl: "YOUR_APPS_SCRIPT_URL_HERE",
    tz: "Asia/Kolkata",
    hours: { s: 10, e: 18 }, dur: 30,
    offDays: [0, 6], minDays: 1, maxDays: 60,
};
let CM, CY, CSEL, CSLOT, CBUSY = {}, CAPI = null;
const MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

document.addEventListener("DOMContentLoaded", () => {
    const n = new Date(); CM = n.getMonth(); CY = n.getFullYear();
    const s = document.createElement('style'); s.textContent = _css(); document.head.appendChild(s);
    document.body.insertAdjacentHTML('beforeend', _html());
    DN.forEach(d => { const e = document.createElement('div'); e.className = 'bk-dh'; e.textContent = d; document.getElementById('bk-dhs').appendChild(e); });
    document.addEventListener('click', e => { const b = e.target.closest('.open-calendar'); if (b) { e.preventDefault(); bkOpen(); } });
    document.getElementById('bk-bg').addEventListener('click', bkClose);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') bkClose(); });
});

// ── API ──
async function _busy(date) {
    const k = date.toISOString().split('T')[0];
    if (CBUSY[k] !== undefined) return CBUSY[k];
    if (CAPI === false || !CAL.apiKey) { CBUSY[k] = []; return []; }
    try {
        const a = new Date(date); a.setHours(0, 0, 0, 0);
        const b = new Date(date); b.setHours(23, 59, 59, 999);
        const r = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy?key=${CAL.apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeMin: a.toISOString(), timeMax: b.toISOString(), timeZone: CAL.tz, items: [{ id: CAL.calendarId }] })
        });
        if (!r.ok) { CAPI = false; CBUSY[k] = []; return []; }
        const d = await r.json();
        CAPI = true;
        CBUSY[k] = (d.calendars?.[CAL.calendarId]?.busy || []).map(p => ({ s: new Date(p.start), e: new Date(p.end) }));
        return CBUSY[k];
    } catch { CAPI = false; CBUSY[k] = []; return []; }
}

async function _slots(date) {
    const busy = await _busy(date), out = [];
    for (let h = CAL.hours.s; h < CAL.hours.e; h++) {
        for (let m = 0; m < 60; m += CAL.dur) {
            const s = new Date(date); s.setHours(h, m, 0, 0);
            const e = new Date(s); e.setMinutes(e.getMinutes() + CAL.dur);
            if (e.getHours() > CAL.hours.e || (e.getHours() === CAL.hours.e && e.getMinutes() > 0)) continue;
            if (!busy.some(b => s < b.e && e > b.s)) out.push({ s, e, l: _ft(s), el: _ft(e) });
        }
    }
    return out;
}

function _ft(d) { let h = d.getHours(); const m = d.getMinutes(), p = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m.toString().padStart(2, '0')} ${p}`; }

// ── Calendar Grid ──
function _grid() {
    const g = document.getElementById('bk-grid'), l = document.getElementById('bk-ml');
    g.innerHTML = ''; l.textContent = `${MN[CM]} ${CY}`;
    const fd = new Date(CY, CM, 1).getDay(), dim = new Date(CY, CM + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const mn = new Date(today); mn.setDate(mn.getDate() + CAL.minDays);
    const mx = new Date(today); mx.setDate(mx.getDate() + CAL.maxDays);
    for (let i = 0; i < fd; i++) { const e = document.createElement('div'); e.className = 'bk-d bk-de'; g.appendChild(e); }
    for (let day = 1; day <= dim; day++) {
        const date = new Date(CY, CM, day), el = document.createElement('button');
        el.className = 'bk-d'; el.textContent = day; el.type = 'button';
        if (CAL.offDays.includes(date.getDay()) || date < mn || date > mx) { el.classList.add('bk-dd'); el.disabled = true; }
        else el.addEventListener('click', () => _selDate(date));
        if (date.toDateString() === today.toDateString()) el.classList.add('bk-dt');
        if (CSEL && date.toDateString() === CSEL.toDateString()) el.classList.add('bk-ds');
        g.appendChild(el);
    }
}

function bkNav(dir) {
    CM += dir;
    if (CM > 11) { CM = 0; CY++; } if (CM < 0) { CM = 11; CY--; }
    const today = new Date(), cv = new Date(CY, CM, 1);
    if (cv < new Date(today.getFullYear(), today.getMonth(), 1)) { CM = today.getMonth(); CY = today.getFullYear(); return; }
    const mx = new Date(today); mx.setDate(mx.getDate() + CAL.maxDays);
    if (cv > new Date(mx.getFullYear(), mx.getMonth(), 1)) { CM -= dir; if (CM > 11) { CM = 0; CY++; } if (CM < 0) { CM = 11; CY--; } return; }
    _grid();
}

// ── Steps ──
function _step(n) {
    ['bk-s0', 'bk-s1', 'bk-s2', 'bk-s3'].forEach((id, i) => {
        document.getElementById(id).classList.toggle('bk-hidden', i !== n);
    });
}

async function _selDate(date) {
    CSEL = date; CSLOT = null; _grid(); _step(1);
    const dl = document.getElementById('bk-dl'), list = document.getElementById('bk-sl'), ld = document.getElementById('bk-ld');
    dl.textContent = date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    list.innerHTML = ''; ld.classList.remove('bk-hidden');
    const slots = await _slots(date);
    ld.classList.add('bk-hidden');
    if (!CSEL || date.toDateString() !== CSEL.toDateString()) return;
    list.innerHTML = '';
    if (CAPI === true) { const b = document.createElement('div'); b.className = 'bk-live'; b.innerHTML = '<span class="bk-dot"></span> Live availability'; list.appendChild(b); }
    if (!slots.length) { list.innerHTML = '<div class="bk-empty"><p>No slots available — try another date.</p></div>'; return; }
    slots.forEach((sl, i) => {
        const btn = document.createElement('button'); btn.className = 'bk-sb'; btn.type = 'button';
        btn.style.animationDelay = `${i * 30}ms`;
        btn.innerHTML = `<div><span class="bk-st">${sl.l}</span><span class="bk-sd">30 min</span></div><span class="bk-sa">Select →</span>`;
        btn.addEventListener('click', () => { CSLOT = sl; _step(2); _fillSummary(); });
        list.appendChild(btn);
    });
}

function _fillSummary() {
    document.getElementById('bk-sum').innerHTML = `<div class="bk-sr">📅 ${CSEL.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}</div><div class="bk-sr">🕐 ${CSLOT.l} — ${CSLOT.el} (30 min)</div><div class="bk-sr">📹 Google Meet (link after booking)</div>`;
    document.getElementById('bk-err').classList.add('bk-hidden');
    document.getElementById('bk-form').reset();
}

async function bkSubmit(e) {
    e.preventDefault();
    const f = document.getElementById('bk-form'), btn = document.getElementById('bk-sbtn'), err = document.getElementById('bk-err');
    const name = f.querySelector('[name="name"]').value.trim(), email = f.querySelector('[name="email"]').value.trim();
    const phone = f.querySelector('[name="phone"]').value.trim(), notes = f.querySelector('[name="notes"]').value.trim();
    if (!name || !email) { err.textContent = 'Name and email are required.'; err.classList.remove('bk-hidden'); return; }

    btn.disabled = true; btn.innerHTML = '<span class="bk-spin"></span> Booking...'; err.classList.add('bk-hidden');
    const dateLabel = CSEL.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeLabel = `${CSLOT.l} — ${CSLOT.el}`;

    try {
        if (CAL.appsScriptUrl && CAL.appsScriptUrl !== "YOUR_APPS_SCRIPT_URL_HERE") {
            await fetch(CAL.appsScriptUrl, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, notes, startTime: CSLOT.s.toISOString(), endTime: CSLOT.e.toISOString(), dateLabel, timeLabel })
            });
        }
        _step(3);
        document.getElementById('bk-cn').textContent = name;
        document.getElementById('bk-ce').textContent = email;
        document.getElementById('bk-cd').textContent = dateLabel;
        document.getElementById('bk-ct').textContent = timeLabel;
    } catch (ex) {
        err.textContent = 'Something went wrong. Please try again.'; err.classList.remove('bk-hidden');
    } finally { btn.disabled = false; btn.innerHTML = 'Confirm Booking'; }
}

// ── Modal ──
function bkOpen() {
    const m = document.getElementById('bk-modal'); const now = new Date();
    CM = now.getMonth(); CY = now.getFullYear(); CSEL = null; CSLOT = null;
    _step(0); m.classList.remove('bk-hidden'); document.body.style.overflow = 'hidden'; _grid();
    requestAnimationFrame(() => requestAnimationFrame(() => {
        document.getElementById('bk-bg').classList.add('bk-bgv');
        const p = document.getElementById('bk-panel'); p.classList.remove('bk-ph'); p.classList.add('bk-pv');
    }));
}
function bkClose() {
    document.getElementById('bk-bg').classList.remove('bk-bgv');
    const p = document.getElementById('bk-panel'); p.classList.remove('bk-pv'); p.classList.add('bk-ph');
    setTimeout(() => { document.getElementById('bk-modal').classList.add('bk-hidden'); document.body.style.overflow = ''; }, 300);
}
function bkBack() { _step(1); }

// ── HTML ──
function _html() {
    return `
<div id="bk-modal" class="bk-overlay bk-hidden" role="dialog" aria-modal="true">
<div class="bk-bg" id="bk-bg"></div>
<div class="bk-wrap"><div class="bk-center"><div class="bk-panel bk-ph" id="bk-panel">

<div class="bk-hdr">
  <div class="bk-hl"><div class="bk-hi"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div><h3 class="bk-title">Strategy Consultation</h3><p class="bk-sub">Book a 30-min strategy call</p></div></div>
  <button type="button" class="bk-x" onclick="bkClose()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
</div>

<div class="bk-body">
  <div class="bk-left">
    <div class="bk-info"><span>⏱ 30 min</span><span>•</span><span>📹 Video Call</span></div>
    <div class="bk-cal">
      <div class="bk-mn"><button type="button" class="bk-nb" onclick="bkNav(-1)">‹</button><span class="bk-ml" id="bk-ml"></span><button type="button" class="bk-nb" onclick="bkNav(1)">›</button></div>
      <div class="bk-dhs" id="bk-dhs"></div>
      <div class="bk-grid" id="bk-grid"></div>
    </div>
    <div class="bk-tz">🌍 India Standard Time (IST)</div>
  </div>

  <div class="bk-right">
    <div id="bk-s0" class="bk-ph0"><div class="bk-ph0i">📅</div><p class="bk-ph0t">Pick a Date</p><p class="bk-ph0s">Select a day to see time slots</p></div>

    <div id="bk-s1" class="bk-hidden"><div class="bk-dl" id="bk-dl"></div><div class="bk-ld bk-hidden" id="bk-ld"><div class="bk-spin2"></div><p>Checking availability...</p></div><div class="bk-sl" id="bk-sl"></div></div>

    <div id="bk-s2" class="bk-hidden">
      <button type="button" class="bk-back" onclick="bkBack()">← Change time</button>
      <div class="bk-sum" id="bk-sum"></div>
      <form id="bk-form" onsubmit="bkSubmit(event)">
        <div class="bk-fg"><label class="bk-lb">Full Name *</label><input type="text" name="name" class="bk-in" placeholder="Your name" required></div>
        <div class="bk-fg"><label class="bk-lb">Email *</label><input type="email" name="email" class="bk-in" placeholder="you@email.com" required></div>
        <div class="bk-fg"><label class="bk-lb">Phone</label><input type="tel" name="phone" class="bk-in" placeholder="+91 XXXXX XXXXX"></div>
        <div class="bk-fg"><label class="bk-lb">Notes</label><textarea name="notes" class="bk-in bk-ta" placeholder="Tell us about your project..." rows="2"></textarea></div>
        <div class="bk-err bk-hidden" id="bk-err"></div>
        <button type="submit" class="bk-submit" id="bk-sbtn">Confirm Booking</button>
      </form>
    </div>

    <div id="bk-s3" class="bk-hidden bk-conf">
      <div class="bk-ck">✅</div>
      <h3 class="bk-ct2">Booking Confirmed!</h3>
      <p class="bk-ct3">A calendar invite & confirmation email will be sent shortly.</p>
      <div class="bk-cd2">
        <div class="bk-cr"><span>Name</span><span id="bk-cn"></span></div>
        <div class="bk-cr"><span>Email</span><span id="bk-ce"></span></div>
        <div class="bk-cr"><span>Date</span><span id="bk-cd"></span></div>
        <div class="bk-cr"><span>Time</span><span id="bk-ct"></span></div>
      </div>
      <button type="button" class="bk-done" onclick="bkClose()">Done</button>
    </div>
  </div>
</div>

</div></div></div></div>`;
}

// ── CSS ──
function _css() {
    return `
.bk-overlay{position:fixed;inset:0;z-index:99999}.bk-overlay.bk-hidden,.bk-hidden{display:none!important}
.bk-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity .3s;z-index:99999}.bk-bgv{opacity:1}
.bk-wrap{position:fixed;inset:0;z-index:100000;overflow-y:auto;padding:12px}
.bk-center{display:flex;min-height:100%;align-items:center;justify-content:center}
.bk-panel{width:100%;max-width:840px;background:#fff;border-radius:14px;box-shadow:0 25px 60px rgba(0,0,0,.15);overflow:hidden;transition:all .3s cubic-bezier(.16,1,.3,1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#1f2328}
.bk-ph{opacity:0;transform:scale(.96) translateY(10px)}.bk-pv{opacity:1;transform:none}
.dark .bk-panel{background:#0d1117;color:#e6edf3;box-shadow:0 25px 60px rgba(0,0,0,.5)}

.bk-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:#f6f8fa;border-bottom:1px solid #d0d7de}
.dark .bk-hdr{background:#161b22;border-color:#30363d}
.bk-hl{display:flex;align-items:center;gap:10px}
.bk-hi{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#2563eb,#3b82f6);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 2px 6px rgba(37,99,235,.3)}
.bk-title{font-size:15px;font-weight:700;margin:0}.bk-sub{font-size:11px;color:#656d76;margin:1px 0 0;font-weight:500}
.dark .bk-sub{color:#8b949e}
.bk-x{width:32px;height:32px;border-radius:7px;border:none;background:0 0;color:#656d76;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.bk-x:hover{background:#fee;color:#dc2626}.dark .bk-x{color:#8b949e}.dark .bk-x:hover{background:rgba(248,81,73,.1);color:#f85149}

.bk-body{display:flex;flex-direction:column}@media(min-width:640px){.bk-body{flex-direction:row}}
.bk-left{padding:16px;border-bottom:1px solid #d0d7de}@media(min-width:640px){.bk-left{flex:0 0 340px;border-right:1px solid #d0d7de;border-bottom:none}}
.dark .bk-left{border-color:#30363d}
.bk-right{flex:1;padding:16px;display:flex;flex-direction:column;overflow-y:auto;max-height:500px}

.bk-info{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:12px;font-size:12px;font-weight:600;color:#1e40af}
.dark .bk-info{background:rgba(37,99,235,.08);border-color:rgba(37,99,235,.2);color:#58a6ff}

.bk-mn{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.bk-ml{font-size:14px;font-weight:700}.bk-nb{width:28px;height:28px;border-radius:6px;border:1px solid #d0d7de;background:#fff;color:#1f2328;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;transition:all .15s}
.bk-nb:hover{border-color:#2563eb;color:#2563eb;background:#f0f7ff}
.dark .bk-nb{background:#21262d;border-color:#30363d;color:#e6edf3}.dark .bk-nb:hover{border-color:#58a6ff;color:#58a6ff}

.bk-dhs{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;margin-bottom:2px}
.bk-dh{text-align:center;font-size:10px;font-weight:600;color:#656d76;padding:4px 0;text-transform:uppercase}.dark .bk-dh{color:#8b949e}
.bk-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.bk-d{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;font-weight:600;border:none;background:0 0;cursor:pointer;transition:all .15s;font-family:inherit;padding:0;color:inherit}
.bk-d:not(.bk-dd):not(.bk-de):hover{background:#eff6ff;color:#2563eb;transform:scale(1.08)}.dark .bk-d:not(.bk-dd):not(.bk-de):hover{background:rgba(37,99,235,.1);color:#58a6ff}
.bk-de{cursor:default;pointer-events:none}.bk-dd{color:#d0d7de!important;cursor:not-allowed!important;opacity:.4}.dark .bk-dd{color:#30363d!important}
.bk-dt{box-shadow:inset 0 0 0 1.5px #d0d7de;background:#f6f8fa}.dark .bk-dt{box-shadow:inset 0 0 0 1.5px #30363d;background:#21262d}
.bk-ds{background:linear-gradient(135deg,#2563eb,#3b82f6)!important;color:#fff!important;box-shadow:0 2px 8px rgba(37,99,235,.3)!important;transform:scale(1.1)}
.bk-tz{font-size:10px;color:#656d76;margin-top:10px;padding-top:8px;border-top:1px solid #e5e7eb;font-weight:500}.dark .bk-tz{color:#8b949e;border-color:#30363d}

.bk-ph0{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 16px}
.bk-ph0i{font-size:40px;margin-bottom:12px;opacity:.4}.bk-ph0t{font-size:16px;font-weight:700;margin:0 0 4px}.bk-ph0s{font-size:13px;color:#656d76;margin:0}.dark .bk-ph0s{color:#8b949e}

.bk-dl{font-size:13px;font-weight:700;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e5e7eb}.dark .bk-dl{border-color:#30363d}
.bk-ld{display:flex;flex-direction:column;align-items:center;gap:8px;padding:30px}.bk-ld p{font-size:12px;color:#656d76;margin:0}
.bk-spin2{width:24px;height:24px;border-radius:50%;border:3px solid #e5e7eb;border-top-color:#2563eb;animation:bksp .7s linear infinite}.dark .bk-spin2{border-color:#30363d;border-top-color:#58a6ff}
@keyframes bksp{to{transform:rotate(360deg)}}

.bk-live{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:600;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:3px 10px;margin-bottom:8px}
.dark .bk-live{color:#3fb950;background:rgba(63,185,80,.08);border-color:rgba(63,185,80,.2)}
.bk-dot{width:5px;height:5px;border-radius:50%;background:#22c55e;animation:bkp 2s ease-in-out infinite}
@keyframes bkp{0%,100%{opacity:1}50%{opacity:.4}}

.bk-sl{display:flex;flex-direction:column;gap:4px;overflow-y:auto;max-height:340px;padding-right:2px}
.bk-sl::-webkit-scrollbar{width:3px}.bk-sl::-webkit-scrollbar-thumb{background:#d0d7de;border-radius:3px}.dark .bk-sl::-webkit-scrollbar-thumb{background:#30363d}
.bk-sb{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;transition:all .2s;animation:bksi .25s ease both;font-family:inherit;font-size:13px;color:inherit}
.dark .bk-sb{background:#161b22;border-color:#30363d}
.bk-sb:hover{border-color:#2563eb;background:#f0f7ff;transform:translateX(3px)}.dark .bk-sb:hover{border-color:#58a6ff;background:rgba(37,99,235,.06)}
.bk-st{font-weight:600}.bk-sd{font-size:11px;color:#656d76;margin-left:6px}.dark .bk-sd{color:#8b949e}
.bk-sa{font-size:11px;font-weight:700;color:#2563eb;opacity:0;transition:opacity .2s}.dark .bk-sa{color:#58a6ff}
.bk-sb:hover .bk-sa{opacity:1}
@keyframes bksi{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
.bk-empty{text-align:center;padding:30px;color:#656d76;font-size:13px}

.bk-back{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#656d76;background:0 0;border:none;cursor:pointer;padding:0 0 10px;font-family:inherit;transition:color .15s}
.bk-back:hover{color:#2563eb}.dark .bk-back{color:#8b949e}.dark .bk-back:hover{color:#58a6ff}
.bk-sum{display:flex;flex-direction:column;gap:6px;padding:10px 12px;background:#f6f8fa;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;font-size:13px}
.dark .bk-sum{background:#161b22;border-color:#30363d}
.bk-sr{display:flex;align-items:center;gap:6px}
.bk-fg{display:flex;flex-direction:column;gap:3px;margin-bottom:8px}
.bk-lb{font-size:11px;font-weight:600}.bk-in{padding:8px 10px;border:1px solid #d0d7de;border-radius:7px;font-size:13px;font-family:inherit;background:#fff;color:inherit;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s}
.bk-in:focus{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.1)}.dark .bk-in{background:#0d1117;border-color:#30363d}.dark .bk-in:focus{border-color:#58a6ff}
.bk-ta{resize:vertical;min-height:40px}
.bk-err{font-size:12px;color:#dc2626;padding:6px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;margin-bottom:6px}.dark .bk-err{background:rgba(248,81,73,.08);border-color:rgba(248,81,73,.2);color:#f85149}
.bk-submit{width:100%;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px}
.bk-submit:hover{box-shadow:0 4px 12px rgba(37,99,235,.3);transform:translateY(-1px)}.bk-submit:disabled{opacity:.7;cursor:wait}
.bk-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:bksp .6s linear infinite}

.bk-conf{display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 10px;animation:bkfi .4s ease}
@keyframes bkfi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.bk-ck{font-size:44px;margin-bottom:8px;animation:bkpop .5s cubic-bezier(.16,1,.3,1)}
@keyframes bkpop{from{transform:scale(0)}to{transform:scale(1)}}
.bk-ct2{font-size:18px;font-weight:700;margin:0 0 4px}.bk-ct3{font-size:12px;color:#656d76;margin:0 0 14px;max-width:260px;line-height:1.5}.dark .bk-ct3{color:#8b949e}
.bk-cd2{width:100%;max-width:280px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:14px}.dark .bk-cd2{border-color:#30363d}
.bk-cr{display:flex;justify-content:space-between;padding:8px 12px;font-size:12px;border-bottom:1px solid #e5e7eb}.bk-cr:last-child{border:none}.dark .bk-cr{border-color:#30363d}
.bk-cr span:first-child{font-weight:600;color:#656d76}.dark .bk-cr span:first-child{color:#8b949e}
.bk-cr span:last-child{font-weight:600}
.bk-done{padding:8px 28px;border:none;border-radius:8px;background:#22c55e;color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit}
.bk-done:hover{background:#16a34a;box-shadow:0 3px 10px rgba(34,197,94,.3)}

@media(max-width:639px){.bk-panel{max-width:100%;border-radius:12px;max-height:92vh;overflow-y:auto}.bk-left{padding:12px}.bk-right{padding:12px;max-height:none}.bk-sl{max-height:200px}}
`;
}
