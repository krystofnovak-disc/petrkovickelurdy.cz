// Netlify function called when the owner clicks "Confirm reservation" in the notification email.
// 1. Updates the Google Calendar event (yellow → green, POPTÁVKA → REZERVACE)
// 2. Sends confirmation email to the guest
//
// Query params: eventId, email, name, arrival, departure, lang, secret

export default async (req) => {
  const url = new URL(req.url);
  const eventId = url.searchParams.get('eventId');
  const guestEmail = url.searchParams.get('email');
  const guestName = url.searchParams.get('name');
  const arrival = url.searchParams.get('arrival');
  const departure = url.searchParams.get('departure');
  const lang = url.searchParams.get('lang') || 'cs';
  const secret = url.searchParams.get('secret');

  const confirmSecret = process.env.CONFIRM_SECRET || '';
  if (!confirmSecret || secret !== confirmSecret) {
    return new Response(htmlPage('Neplatný odkaz', 'Tento potvrzovací odkaz není platný.'), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;

  let calendarUpdated = false;
  let emailSent = false;

  // --- 1. Update Google Calendar event ---
  if (calendarId && serviceAccountJson && eventId) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      const accessToken = await getGoogleAccessToken(serviceAccount);

      const getRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (getRes.ok) {
        const event = await getRes.json();
        event.summary = event.summary.replace('POPTÁVKA:', 'REZERVACE:');
        event.colorId = '10'; // Green — confirmed

        const updateRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(event),
          }
        );
        calendarUpdated = updateRes.ok;
      }
    } catch (err) {
      console.error('Failed to update calendar event:', err);
    }
  }

  // --- 2. Send confirmation email to guest ---
  if (resendKey && guestEmail) {
    const subject = lang === 'cs'
      ? 'Rezervace potvrzena – Stellplatz Petřkovické Lurdy'
      : 'Reservation confirmed – Stellplatz Petřkovické Lurdy';

    const body = lang === 'cs'
      ? `<h2>Vaše rezervace byla potvrzena!</h2>
         <p>Dobrý den ${guestName},</p>
         <p>s radostí vám potvrzujeme rezervaci na Stellplatzu Petřkovické Lurdy.</p>
         <p><strong>Příjezd:</strong> ${arrival}<br>
         <strong>Odjezd:</strong> ${departure}</p>
         <p>GPS: 49°32'33.2" N, 17°57'20.3" E</p>
         <p>V případě dotazů nás kontaktujte na <a href="mailto:info@petrkovickelurdy.cz">info@petrkovickelurdy.cz</a> nebo na telefonu +420 603 540 643.</p>
         <p>Těšíme se na vás!<br>Stellplatz Petřkovické Lurdy</p>`
      : `<h2>Your reservation is confirmed!</h2>
         <p>Dear ${guestName},</p>
         <p>We are happy to confirm your reservation at Stellplatz Petřkovické Lurdy.</p>
         <p><strong>Arrival:</strong> ${arrival}<br>
         <strong>Departure:</strong> ${departure}</p>
         <p>GPS: 49°32'33.2" N, 17°57'20.3" E</p>
         <p>If you have any questions, contact us at <a href="mailto:info@petrkovickelurdy.cz">info@petrkovickelurdy.cz</a> or call +420 603 540 643.</p>
         <p>We look forward to seeing you!<br>Stellplatz Petřkovické Lurdy</p>`;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Stellplatz Petřkovické Lurdy <noreply@petrkovickelurdy.cz>',
          to: [guestEmail],
          subject,
          html: body,
        }),
      });
      emailSent = res.ok;
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
  }

  const title = calendarUpdated || emailSent ? 'Rezervace potvrzena' : 'Chyba';
  const message = calendarUpdated || emailSent
    ? `Rezervace pro <strong>${guestName}</strong> (${arrival} – ${departure}) byla potvrzena.${emailSent ? ' Potvrzovací e-mail byl odeslán.' : ''}${calendarUpdated ? ' Kalendář byl aktualizován.' : ''}`
    : 'Nepodařilo se potvrdit rezervaci. Zkuste to znovu nebo kontaktujte hosta ručně.';

  return new Response(htmlPage(title, message), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

function htmlPage(title, message) {
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0ebe3; color: #2d2a26; }
  .card { background: white; border-radius: 12px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  h1 { color: #5a7a3a; margin-top: 0; }
  a { color: #5a7a3a; }
</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p><p><a href="/">← Zpět na web</a></p></div></body>
</html>`;
}

// --- Google Service Account JWT auth (shared with submission-created) ---
async function getGoogleAccessToken(serviceAccount) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);

  const claimSet = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const signInput = `${header}.${claimSet}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signInput));
  const jwt = `${signInput}.${arrayBufferToBase64Url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await res.json();
  return tokenData.access_token;
}

function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
