/**
 * Google Calendar Appointment Scheduling Modal
 * 
 * NOTE: If the calendar shows a white screen, Google might be blocking the embed.
 * In that case, use the official Embed Code from Google Calendar Settings.
 */

const CALENDAR_CONFIG = {
    // Official Public URL (Cleaned, no /u/0/)
    calendarUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0umZp4r6FsReCuIBjzVUkS65Cevhx69h_zOPM_EPErG-k6LsBk2rAt1AHyO22D6llRXxEHelbn?gv=true",

    demoMessage: "Please configure your Google Calendar link in assets/js/calendar.js"
};

document.addEventListener("DOMContentLoaded", () => {
    // Inject Modal HTML
    const modalHTML = `
    <div id="calendar-modal" class="fixed inset-0 z-[100] hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity opacity-0" id="modal-backdrop"></div>

        <div class="fixed inset-0 z-[101] w-screen overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <!-- Modal Panel -->
                <div class="relative transform overflow-hidden rounded-gh-lg bg-white dark:bg-gh-canvas-dark text-left shadow-gh-lg transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gh-border dark:border-gh-border-dark opacity-0 scale-95" id="modal-panel">
                    
                    <!-- Header -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-gh-border dark:border-gh-border-dark bg-gh-canvas dark:bg-gh-canvas-dark">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-gh-accent font-bold">calendar_month</span>
                            <div>
                                <h3 class="text-gh-fg dark:text-gh-fg-dark font-bold text-sm lg:text-base leading-none mb-1">
                                    Strategy Consultation
                                </h3>
                                <p class="text-[10px] text-gh-fg-muted dark:text-gh-fg-muted-dark font-medium">
                                    Select a convenient time for our call
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <a href="${CALENDAR_CONFIG.calendarUrl}" target="_blank" class="hidden sm:flex items-center gap-1 text-gh-accent hover:underline text-xs font-semibold">
                                Open in new tab <span class="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                            <button type="button" class="p-1 rounded-gh hover:bg-gh-canvas-subtle dark:hover:bg-gh-canvas-subtle-dark text-gh-fg-muted dark:text-gh-fg-muted-dark hover:text-gh-danger transition-colors outline-none" onclick="closeCalendar()">
                                <span class="material-symbols-outlined font-bold">close</span>
                            </button>
                        </div>
                    </div>

                    <!-- Iframe Container -->
                    <div class="w-full h-[75vh] sm:h-[80vh] bg-white relative">
                        <div id="calendar-loader" class="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gh-canvas-dark z-10">
                            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gh-accent mb-4"></div>
                            <p class="text-xs text-gh-fg-muted dark:text-gh-fg-muted-dark font-medium animate-pulse">Connecting to Google Calendar...</p>
                        </div>
                        <iframe id="calendar-frame" src="" class="w-full h-full border-0" 
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                                allow="camera; microphone; autoplay; fullscreen"
                                onload="document.getElementById('calendar-loader').style.display='none'">
                        </iframe>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event Delegation
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-calendar');
        if (btn) {
            e.preventDefault();
            openCalendar();
        }
    });

    // Close on backdrop click
    document.getElementById('modal-backdrop').addEventListener('click', closeCalendar);
});

function openCalendar() {
    const modal = document.getElementById('calendar-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');
    const frame = document.getElementById('calendar-frame');

    let urlToLoad = CALENDAR_CONFIG.calendarUrl;
    if (!urlToLoad) return;

    // Load URL if not set
    if (frame.src === "about:blank" || frame.src === "") {
        frame.src = urlToLoad;
    }

    // Show Modal
    modal.classList.remove('hidden');

    // Animate In
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
    }, 10);
}

function closeCalendar() {
    const modal = document.getElementById('calendar-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');

    // Animate Out
    backdrop.classList.add('opacity-0');
    panel.classList.remove('opacity-100', 'scale-100');
    panel.classList.add('opacity-0', 'scale-95');

    // Hide after animation
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
