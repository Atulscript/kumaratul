# Booking System Setup — Google Apps Script Backend

## Why Google Apps Script?
To create events on your Google Calendar from your website, we need a small backend.
Google Apps Script is **free**, runs on Google's servers, and directly accesses your Google Calendar.
It's NOT a third-party tool — it's a Google product.

---

## Step 1: Create the Apps Script

1. Go to **[script.google.com](https://script.google.com)**
2. Click **"New Project"**
3. Delete the default code and paste the entire code below:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var calendarId = "connect@kumaratul.com";
    var calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      return sendResponse({ success: false, error: "Calendar not found" });
    }

    var startTime = new Date(data.startTime);
    var endTime = new Date(data.endTime);

    var event = calendar.createEvent(
      "Strategy Consultation — " + data.name,
      startTime,
      endTime,
      {
        description:
          "Booking from kumaratul.com\n\n" +
          "Name: " + data.name + "\n" +
          "Email: " + data.email + "\n" +
          "Phone: " + (data.phone || "Not provided") + "\n" +
          "Notes: " + (data.notes || "None"),
        guests: data.email,
        sendInvites: true
      }
    );

    // Send confirmation email
    MailApp.sendEmail({
      to: data.email,
      subject: "Booking Confirmed — Strategy Consultation with Atul Kumar",
      htmlBody:
        "<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;'>" +
        "<h2 style='color:#2563eb;'>✅ Booking Confirmed!</h2>" +
        "<p>Hi " + data.name + ",</p>" +
        "<p>Your strategy consultation has been booked successfully.</p>" +
        "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>" +
        "<tr><td style='padding:8px;border:1px solid #e5e7eb;font-weight:bold;'>Date</td><td style='padding:8px;border:1px solid #e5e7eb;'>" + data.dateLabel + "</td></tr>" +
        "<tr><td style='padding:8px;border:1px solid #e5e7eb;font-weight:bold;'>Time</td><td style='padding:8px;border:1px solid #e5e7eb;'>" + data.timeLabel + "</td></tr>" +
        "<tr><td style='padding:8px;border:1px solid #e5e7eb;font-weight:bold;'>Duration</td><td style='padding:8px;border:1px solid #e5e7eb;'>30 minutes</td></tr>" +
        "</table>" +
        "<p>A Google Calendar invite has been sent to your email. A Google Meet link will be added automatically.</p>" +
        "<p>Best regards,<br><strong>Atul Kumar</strong></p>" +
        "</div>"
    });

    // Notify owner
    MailApp.sendEmail({
      to: calendarId,
      subject: "New Booking: " + data.name + " — " + data.dateLabel + " at " + data.timeLabel,
      htmlBody:
        "<h3>New consultation booking</h3>" +
        "<p><strong>Name:</strong> " + data.name + "</p>" +
        "<p><strong>Email:</strong> " + data.email + "</p>" +
        "<p><strong>Phone:</strong> " + (data.phone || "N/A") + "</p>" +
        "<p><strong>Date:</strong> " + data.dateLabel + "</p>" +
        "<p><strong>Time:</strong> " + data.timeLabel + "</p>" +
        "<p><strong>Notes:</strong> " + (data.notes || "None") + "</p>"
    });

    return sendResponse({ success: true, eventId: event.getId() });

  } catch (err) {
    return sendResponse({ success: false, error: err.toString() });
  }
}

function sendResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Allow CORS preflight
function doGet(e) {
  return sendResponse({ status: "Booking API is running" });
}
```

4. Name the project: **"Booking Backend"**
5. Click **Save** (Ctrl+S)

---

## Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **"Web app"**
3. Set these options:
   - **Description:** Booking API
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Authorize** when prompted (click Advanced → Go to project)
6. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## Step 3: Add URL to Website

Open `assets/js/calendar.js` and replace the placeholder:

```javascript
appsScriptUrl: "YOUR_APPS_SCRIPT_URL_HERE",
```

With your actual URL:

```javascript
appsScriptUrl: "https://script.google.com/macros/s/AKfycbx.../exec",
```

---

## Done! 🎉

The booking widget will now:
1. Show real availability from your Google Calendar
2. Create events directly on your calendar
3. Send confirmation emails to both you and the visitor
4. Add Google Meet link automatically
