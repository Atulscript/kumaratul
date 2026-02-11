/**
 * Google Calendar Appointment Scheduling - Embedded Widget
 * 
 * Embeds the Google Calendar Appointment Scheduling page directly
 * inside a modal. Google handles date, time, and booking form.
 */

const CALENDAR_CONFIG = {
    calendarUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0umZp4r6FsReCuIBjzVUkS65Cevhx69h_zOPM_EPErG-k6LsBk2rAt1AHyO22D6llRXxEHelbn?gv=true",
    meetingTitle: "Strategy Consultation",
    meetingSubtitle: "Select a convenient time for our call",
};

document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement('style');
    s.textContent = calCSS();
    document.head.appendChild(s);
    document.body.insertAdjacentHTML('beforeend', calModalHTML());

    document.addEventListener('click', e => {
        const btn = e.target.closest('.open-calendar');
        if (btn) { e.preventDefault(); openCalendar(); }
    });
    document.getElementById('modal-backdrop').addEventListener('click', closeCalendar);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCalendar(); });
});

function openCalendar() {
    const modal = document.getElementById('calendar-modal');
    const frame = document.getElementById('calendar-frame');
    const loader = document.getElementById('calendar-loader');

    // Load iframe src only once
    if (!frame.src || frame.src === 'about:blank' || frame.src === '') {
        loader.classList.remove('cal-hidden');
        frame.src = CALENDAR_CONFIG.calendarUrl;
    }

    modal.classList.remove('cal-hidden');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => requestAnimationFrame(() => {
        document.getElementById('modal-backdrop').classList.add('cal-backdrop-visible');
        const p = document.getElementById('modal-panel');
        p.classList.remove('cal-panel-hidden');
        p.classList.add('cal-panel-visible');
    }));
}

function closeCalendar() {
    document.getElementById('modal-backdrop').classList.remove('cal-backdrop-visible');
    const p = document.getElementById('modal-panel');
    p.classList.remove('cal-panel-visible');
    p.classList.add('cal-panel-hidden');
    setTimeout(() => {
        document.getElementById('calendar-modal').classList.add('cal-hidden');
        document.body.style.overflow = '';
    }, 300);
}

function calFrameLoaded() {
    document.getElementById('calendar-loader').classList.add('cal-hidden');
}

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
        <a href="${CALENDAR_CONFIG.calendarUrl}" target="_blank" rel="noopener" class="cal-external-link">Open in new tab <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
        <button type="button" class="cal-close-btn" onclick="closeCalendar()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
</div>

<!-- Google Calendar Iframe -->
<div class="cal-iframe-wrapper">
    <div class="cal-loader" id="calendar-loader">
        <div class="cal-loader-spinner"></div>
        <p class="cal-loader-text">Loading Google Calendar...</p>
    </div>
    <iframe id="calendar-frame"
        src=""
        class="cal-iframe"
        frameborder="0"
        scrolling="yes"
        allow="camera; microphone; autoplay; fullscreen; clipboard-write"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        onload="calFrameLoaded()"
    ></iframe>
</div>

</div></div></div></div>`;
}

function calCSS() {
    return `
.cal-modal-overlay{position:fixed;inset:0;z-index:99999}
.cal-modal-overlay.cal-hidden,.cal-hidden{display:none!important}
.cal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;transition:opacity .3s;z-index:99999}
.cal-backdrop.cal-backdrop-visible{opacity:1}
.cal-modal-container{position:fixed;inset:0;z-index:100000;overflow-y:auto;padding:16px}
.cal-modal-centering{display:flex;min-height:100%;align-items:center;justify-content:center}
.cal-modal-panel{position:relative;width:100%;max-width:960px;background:#fff;border-radius:16px;box-shadow:0 0 0 1px rgba(0,0,0,.04),0 8px 30px rgba(0,0,0,.12),0 30px 60px rgba(0,0,0,.08);overflow:hidden;transition:all .35s cubic-bezier(.16,1,.3,1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif}
.cal-panel-hidden{opacity:0;transform:scale(.96) translateY(12px)}
.cal-panel-visible{opacity:1;transform:scale(1) translateY(0)}
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
@media(min-width:640px){.cal-external-link{display:flex}}
.cal-close-btn{width:34px;height:34px;border-radius:8px;border:1px solid transparent;background:0 0;color:#656d76;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.cal-close-btn:hover{background:#fff0f0;border-color:#fecaca;color:#dc2626}
.dark .cal-close-btn{color:#8b949e}.dark .cal-close-btn:hover{background:rgba(248,81,73,.1);color:#f85149}

.cal-iframe-wrapper{position:relative;width:100%;height:75vh;min-height:500px;background:#fff}
.dark .cal-iframe-wrapper{background:#0d1117}
.cal-iframe{width:100%;height:100%;border:none;display:block}
.cal-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;z-index:10;gap:12px}
.dark .cal-loader{background:#0d1117}
.cal-loader-spinner{width:32px;height:32px;border-radius:50%;border:3px solid #e5e7eb;border-top-color:#2563eb;animation:calSpin .7s linear infinite}
.dark .cal-loader-spinner{border-color:#30363d;border-top-color:#58a6ff}
@keyframes calSpin{to{transform:rotate(360deg)}}
.cal-loader-text{font-size:13px;color:#656d76;font-weight:500;animation:calPulse 1.5s ease-in-out infinite}
.dark .cal-loader-text{color:#8b949e}
@keyframes calPulse{0%,100%{opacity:1}50%{opacity:.5}}

@media(max-width:639px){
    .cal-modal-panel{max-width:100%;border-radius:14px}
    .cal-iframe-wrapper{height:80vh;min-height:400px}
}
`;
}
