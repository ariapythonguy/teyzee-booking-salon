// ====== Google Calendar Integration (New GIS) ======

// Replace with your credentials
const CLIENT_ID = "835682979879-k818eh3aefaibjttvds8bj28hdn1qati.apps.googleusercontent.com";
const API_KEY = "AIzaSyDvFnIHPWntyHQeSr1qclGmii3iKafQL-Y";
const CALENDAR_ID = "teyzeesites@gmail.com"; // client’s Gmail or Calendar ID

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// 1. Load GAPI client
function gapiLoaded() {
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    console.log("✅ Google API client loaded");
  });
}

// 2. Load GIS (called once the gsi/client script is loaded)
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // we’ll set this before requesting a token
  });
  gisInited = true;
  console.log("✅ Google Identity Services initialized");
}

// 3. Add event function
async function addEventToCalendar(serviceName, price, date, time, customerName, email, phone) {
  if (!gapiInited || !gisInited) {
    alert("Google API not initialized yet. Please try again.");
    return;
  }

  // Convert "HH:MM" to proper Date object
  // Extract start and end time parts from the slot string
let [startTimePart, endTimePart] = time.split("-").map(t => t.trim());

// Parse start time (e.g. "5:00 PM") with the selected date
let startIso;
try {
  startIso = new Date(`${date} ${startTimePart}`);
  if (isNaN(startIso)) throw new Error("Invalid Date parse");
} catch (e) {
  console.warn("Could not parse time, defaulting to midnight", e);
  startIso = new Date(`${date}T00:00:00`);
}

let endIso;
if (endTimePart) {
  // If slot string had an end time, parse it too
  try {
    endIso = new Date(`${date} ${endTimePart}`);
    if (isNaN(endIso)) throw new Error("Invalid Date parse");
  } catch (e) {
    console.warn("Could not parse end time, defaulting to +60min", e);
    endIso = new Date(startIso.getTime() + 60 * 60000);
  }
} else {
  // No explicit end time → default to +60min
  endIso = new Date(startIso.getTime() + 60 * 60000);
}
console.log("The addEvent is working.");
const startDateTime = startIso;
const endDateTime = endIso;

  const event = {
    summary: `${serviceName} - ${customerName}`,
    description: `Price: ₹${price}, Email: ${email}, Phone: ${phone}`,
    start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Kolkata" },
  };

  // Request access token and then insert event
  tokenClient.callback = async (tokenResponse) => {
    if (tokenResponse.error) {
      console.error("❌ Token error:", tokenResponse);
      return;
    }

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: event,
      });
      alert("✅ Booking added to Google Calendar!");
      console.log("Event created:", response);
    } catch (err) {
      console.error("❌ Error creating event:", err);
    }
  };

  tokenClient.requestAccessToken();
}

// Expose globally
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
window.addEventToCalendar = addEventToCalendar;
