// Netlify function to read events from Google Calendar.
// Returns occupied dates for the availability calendar.
//
// Required env variables:
//   GOOGLE_CALENDAR_ID  — the calendar ID (looks like xxx@group.calendar.google.com)
//   GOOGLE_API_KEY      — Google API key with Calendar API enabled (read-only)

export default async (req) => {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!calendarId || !apiKey) {
    return new Response(JSON.stringify({ occupied: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
  }

  try {
    // Fetch events for the next 3 months
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=250`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Google Calendar API error:', res.status, await res.text());
      return new Response(JSON.stringify({ occupied: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const occupied = new Set();

    for (const event of data.items || []) {
      // Support both all-day events (date) and timed events (dateTime)
      const startStr = event.start?.date || event.start?.dateTime?.slice(0, 10);
      const endStr = event.end?.date || event.end?.dateTime?.slice(0, 10);

      if (!startStr) continue;

      // Fill in all dates between start and end
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : new Date(startStr);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        occupied.add(d.toISOString().slice(0, 10));
      }
    }

    return new Response(JSON.stringify({ occupied: [...occupied].sort() }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache 5 minutes
      },
    });
  } catch (err) {
    console.error('Calendar fetch error:', err);
    return new Response(JSON.stringify({ occupied: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
