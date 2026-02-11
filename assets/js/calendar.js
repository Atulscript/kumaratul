/**
 * Google Calendar Appointment Scheduling
 * Opens Google Calendar's built-in scheduling page in a popup window.
 * No third-party tools — Google handles date, time, form, and booking.
 */

const CALENDAR_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0umZp4r6FsReCuIBjzVUkS65Cevhx69h_zOPM_EPErG-k6LsBk2rAt1AHyO22D6llRXxEHelbn?gv=true";

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.open-calendar');
        if (btn) {
            e.preventDefault();
            openCalendar();
        }
    });
});

function openCalendar() {
    // Popup window size and centering
    const w = 700, h = 700;
    const left = (screen.width - w) / 2;
    const top = (screen.height - h) / 2;

    window.open(
        CALENDAR_URL,
        'BookConsultation',
        `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );
}
