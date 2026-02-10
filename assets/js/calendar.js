/**
 * Google Calendar Appointment Scheduling Modal
 * 
 * INSTRUCTIONS:
 * 1. Go to Google Calendar -> Settings -> Appointment Schedules (or use Calendly).
 * 2. Create a booking page.
 * 3. Copy the link and paste it into the 'calendarUrl' variable below.
 */

const CALENDAR_CONFIG = {
    // PASTE YOUR LINK HERE (e.g., "https://calendar.google.com/calendar/u/0/appointments/schedules/...")
    calendarUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0umZp4r6FsReCuIBjzVUkS65Cevhx69h_zOPM_EPErG-k6LsBk2rAt1AHyO22D6llRXxEHelbn",

    // Message shown if URL is not configured
    demoMessage: "This is a demo booking modal. To make this functional, please add your Google Calendar (or Calendly) link in 'assets/js/calendar.js'."
};

// Inject Modal HTML into the document
document.addEventListener("DOMContentLoaded", () => {
    const modalHTML = `
    <div id="calendar-modal" class="fixed inset-0 z-[100] hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity opacity-0" id="modal-backdrop"></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <!-- Modal Panel -->
                <div class="relative transform overflow-hidden rounded-lg bg-[#2b2d31] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-[#1e1f22] opacity-0 scale-95" id="modal-panel">
                    
                    <!-- Header -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#1e1f22] bg-[#2b2d31]">
                        <h3 class="text-white font-bold flex items-center gap-2 font-display">
                            <span class="material-symbols-outlined text-[#5865F2]">calendar_month</span>
                            Schedule a Call
                        </h3>
                        <button type="button" class="text-[#949ba4] hover:text-white transition-colors outline-none" onclick="closeCalendar()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <!-- Iframe Container -->
                    <div class="w-full h-[80vh] bg-white relative">
                        <div id="calendar-loader" class="absolute inset-0 flex items-center justify-center bg-[#2b2d31] z-10">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2]"></div>
                        </div>
                        <iframe id="calendar-frame" src="" class="w-full h-full border-0" onload="document.getElementById('calendar-loader').style.display='none'"></iframe>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event Delegation for "Schedule" buttons
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

    // Check configuration
    let urlToLoad = CALENDAR_CONFIG.calendarUrl;
    if (!urlToLoad) {
        alert(CALENDAR_CONFIG.demoMessage);
        // Fallback to a generic calendar page or just stop
        // urlToLoad = "https://calendar.google.com/"; 
        // For now, let's load a placeholder so they see how it looks
        urlToLoad = "https://calendar.google.com/calendar/u/0/r";
    }

    // Set src if empty (lazy load)
    if (frame.src === "about:blank" || frame.src === "") {
        frame.src = urlToLoad;
    }

    // Show Modal
    modal.classList.remove('hidden');

    // Animate In (small delay to allow display:block to apply)
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
