/**
 * Native Google Calendar Appointment Schedule Embed
 * Replacing custom widget with bulletproof official Google Iframe.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inject the HTML and CSS
    const s = document.createElement('style');
    s.textContent = _css();
    document.head.appendChild(s);
    document.body.insertAdjacentHTML('beforeend', _html());

    // Event listener for all "open-calendar" buttons
    document.addEventListener('click', e => {
        const b = e.target.closest('.open-calendar');
        if (b) {
            e.preventDefault();
            bkOpen();
        }
    });

    // Close on bg click
    document.getElementById('bk-bg').addEventListener('click', bkClose);
    // Close on ESC
    document.addEventListener('keydown', e => { if (e.key === 'Escape') bkClose(); });
});

function bkOpen() {
    const m = document.getElementById('bk-modal');
    m.classList.remove('bk-hidden');
    document.body.style.overflow = 'hidden'; // Stop scrolling
    
    // Smooth fade in
    requestAnimationFrame(() => {
        document.getElementById('bk-bg').style.opacity = "1";
        document.getElementById('bk-panel').classList.add('bk-pv');
    });
}

function bkClose() {
    document.getElementById('bk-bg').style.opacity = "0";
    document.getElementById('bk-panel').classList.remove('bk-pv');
    setTimeout(() => {
        document.getElementById('bk-modal').classList.add('bk-hidden');
        document.body.style.overflow = '';
    }, 300);
}

function _html() {
    return `
<div id="bk-modal" class="bk-overlay bk-hidden" role="dialog" aria-modal="true">
    <div class="bk-bg" id="bk-bg"></div>
    <div class="bk-wrap">
        <div class="bk-center">
            <div class="bk-panel" id="bk-panel">
                <div class="bk-hdr">
                    <div class="bk-hl">
                        <div class="bk-hi">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        <div>
                            <h3 class="bk-title">Strategy Consultation</h3>
                            <p class="bk-sub">Real-time availability via Google Calendar</p>
                        </div>
                    </div>
                    <button type="button" class="bk-x" onclick="bkClose()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="bk-body">
                    <!-- OFFICIAL GOOGLE CALENDAR EMBED -->
                    <iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3peL0LRm3GCjm4H5vGcd0Xk6eu8Ii961sWMrqWbZmKoO1N0sB8dfdKQSuj2pVWOAoPSyNTiUYN?gv=true" style="border: 0" width="100%" height="700" frameborder="0"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

function _css() {
    return `
.bk-overlay{position:fixed;inset:0;z-index:99999}.bk-hidden{display:none!important}
.bk-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);opacity:0;transition:opacity .3s;z-index:1}
.bk-wrap{position:fixed;inset:0;z-index:2;overflow-y:auto;padding:12px}
.bk-center{display:flex;min-height:100%;align-items:center;justify-content:center}
.bk-panel{width:100%;max-width:900px;background:#fff;border-radius:16px;box-shadow:0 25px 60px rgba(0,0,0,.3);overflow:hidden;transform:scale(.95) translateY(20px);opacity:0;transition:all .4s cubic-bezier(.16,1,.3,1);font-family:sans-serif}
.dark .bk-panel{background:#0d1117;border:1px solid #30363d}
.bk-panel.bk-pv{transform:none;opacity:1}

.bk-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#f6f8fa;border-bottom:1px solid #d0d7de}
.dark .bk-hdr{background:#161b22;border-color:#30363d;color:#e6edf3}
.bk-hl{display:flex;align-items:center;gap:12px}
.bk-hi{width:38px;height:38px;border-radius:10px;background:#2f81f7;display:flex;align-items:center;justify-content:center;color:#fff}
.bk-title{font-size:16px;font-weight:700;margin:0}
.bk-sub{font-size:12px;color:#656d76;margin:2px 0 0}.dark .bk-sub{color:#8b949e}

.bk-x{width:34px;height:34px;border-radius:8px;border:none;background:transparent;color:#656d76;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.bk-x:hover{background:rgba(248,81,73,.1);color:#f85149}

.bk-body{height:700px;overflow:hidden;background:#fff}
@media(max-width:768px){ .bk-body{height:600px} .bk-panel{max-height:95vh} }
`;
}
