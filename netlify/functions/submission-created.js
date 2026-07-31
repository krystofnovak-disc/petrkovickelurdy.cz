// Netlify function triggered automatically when a form is submitted.
// 1. Sends confirmation email to guest + notification with confirm button to owner via Resend API
// 2. Creates a Google Calendar event for the reservation (yellow = pending)
//
// Required env variables:
//   RESEND_API_KEY          — Resend API key for emails
//   OWNER_EMAIL             — owner's email for notifications
//   CONFIRM_SECRET          — shared secret for confirm-reservation function
//   GOOGLE_CALENDAR_ID      — Google Calendar ID (optional)
//   GOOGLE_SERVICE_ACCOUNT  — Google service account JSON key (optional)
//   URL                     — site URL (set automatically by Netlify)

export default async (req) => {
  const { payload } = await req.json();
  const { data } = payload;

  const lang = data.lang || 'cs';
  const guestName = data.name || '';
  const guestEmail = data.email || '';
  const siteUrl = process.env.URL || 'https://petrkovickelurdy.cz';

  const details = `
    ${lang === 'cs' ? 'Jméno' : 'Name'}: ${data.name}
    Email: ${data.email}
    ${lang === 'cs' ? 'Telefon' : 'Phone'}: ${data.phone || '-'}
    ${lang === 'cs' ? 'Příjezd' : 'Arrival'}: ${data.arrival}
    ${lang === 'cs' ? 'Odjezd' : 'Departure'}: ${data.departure}
    ${lang === 'cs' ? 'Počet vozidel' : 'Vehicles'}: ${data.vehicles}
    ${lang === 'cs' ? 'Typ' : 'Type'}: ${data['vehicle-type']}
    ${lang === 'cs' ? 'Elektřina' : 'Electricity'}: ${data.electricity ? (lang === 'cs' ? 'Ano' : 'Yes') : (lang === 'cs' ? 'Ne' : 'No')}
    ${lang === 'cs' ? 'Poznámka' : 'Note'}: ${data.note || '-'}
  `.trim();

  const resendKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || 'info@petrkovickelurdy.cz';
  const confirmSecret = process.env.CONFIRM_SECRET || '';

  // --- 1. Create Google Calendar event (need eventId for confirm link) ---
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
  let calendarEventId = '';

  if (calendarId && serviceAccountJson && data.arrival && data.departure) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      const accessToken = await getGoogleAccessToken(serviceAccount);

      const event = {
        summary: `POPTÁVKA: ${guestName} (${data.vehicles}x ${data['vehicle-type']})`,
        description: details,
        start: { date: data.arrival },
        end: { date: data.departure },
        colorId: '5', // Yellow — pending
      };

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(event),
        }
      );

      if (res.ok) {
        const created = await res.json();
        calendarEventId = created.id || '';
      } else {
        console.error('Google Calendar create event error:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    }
  }

  // --- 2. Send emails via Resend ---
  if (resendKey) {
    // Guest confirmation
    const guestSubject = lang === 'cs'
      ? 'Potvrzení poptávky – Stellplatz Petřkovické Lurdy'
      : 'Inquiry confirmation – Stellplatz Petřkovické Lurdy';

    const guestBody = lang === 'cs'
      ? `<h2>Děkujeme za vaši poptávku!</h2>
         <p>Dobrý den ${guestName},</p>
         <p>přijali jsme vaši poptávku na pobyt na Stellplatzu Petřkovické Lurdy. Budeme vás kontaktovat co nejdříve.</p>
         <h3>Shrnutí:</h3>
         <pre>${details}</pre>
         <p>S pozdravem,<br>Stellplatz Petřkovické Lurdy</p>`
      : `<h2>Thank you for your inquiry!</h2>
         <p>Dear ${guestName},</p>
         <p>We have received your inquiry for a stay at Stellplatz Petřkovické Lurdy. We will get back to you as soon as possible.</p>
         <h3>Summary:</h3>
         <pre>${details}</pre>
         <p>Best regards,<br>Stellplatz Petřkovické Lurdy</p>`;

    // Owner notification with confirm button
    const confirmParams = new URLSearchParams({
      eventId: calendarEventId,
      email: guestEmail,
      name: guestName,
      arrival: data.arrival || '',
      departure: data.departure || '',
      lang,
      secret: confirmSecret,
    });
    const confirmUrl = `${siteUrl}/.netlify/functions/confirm-reservation?${confirmParams}`;

    const ownerBody = `
      <h2>Nová poptávka ze stellplatz webu</h2>
      <pre>${details}</pre>
      <br>
      <table cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#5a7a3a" style="border-radius:6px;">
        <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-family:Arial,sans-serif;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">
          ✓ Potvrdit rezervaci
        </a>
      </td></tr></table>
      <br>
      <p style="color:#999;font-size:12px;">Kliknutím se potvrdí rezervace v kalendáři a klientovi odejde potvrzovací e-mail.</p>
    `;

    const emails = [
      {
        from: 'Stellplatz Petřkovické Lurdy <noreply@petrkovickelurdy.cz>',
        to: [guestEmail],
        subject: guestSubject,
        html: guestBody,
      },
      {
        from: 'Stellplatz Web <noreply@petrkovickelurdy.cz>',
        to: [ownerEmail],
        subject: `Nova poptavka: ${guestName} (${data.arrival} - ${data.departure})`,
        html: ownerBody,
      },
    ];

    for (const email of emails) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify(email),
        });
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }
  } else {
    console.warn('RESEND_API_KEY not set — skipping emails');
  }

  return new Response('OK', { status: 200 });
};

// --- Google Service Account JWT auth ---
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
