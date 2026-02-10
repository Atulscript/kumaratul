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

// Inject Modal HTML (Removed - Google blocks iframes. Using Popup pattern instead.)
document.addEventListener("DOMContentLoaded", () => {
    // Event Delegation for "Schedule" buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-calendar');
        if (btn) {
            e.preventDefault();
            openCalendar();
        }
    });
});

function openCalendar() {
    let urlToLoad = CALENDAR_CONFIG.calendarUrl;
    if (!urlToLoad) {
        alert(CALENDAR_CONFIG.demoMessage);
        return;
    }

    // Popup Window Dimensions
    const width = 1024;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    // Open clean booking window (looks like an app integration)
    window.open(
        urlToLoad,
        'Book Appointment',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
}

// Unused functions removed for cleanup
