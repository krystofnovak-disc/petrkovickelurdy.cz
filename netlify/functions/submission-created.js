// Netlify function triggered automatically when a form is submitted.
// Sends confirmation email to guest + notification to owner via Resend API.
// Set RESEND_API_KEY and OWNER_EMAIL in Netlify environment variables.

export default async (req) => {
  const { payload } = await req.json();
  const { data } = payload;

  const resendKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || 'info@petrkovickelurdy.cz';

  if (!resendKey) {
    console.error('RESEND_API_KEY not set');
    return new Response('Missing API key', { status: 500 });
  }

  const lang = data.lang || 'cs';
  const guestName = data.name || '';
  const guestEmail = data.email || '';

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

  const guestSubject = lang === 'cs'
    ? 'Potvrzení poptávky – Stellplatz Petřkovice u Lurdy'
    : 'Inquiry confirmation – Stellplatz Petřkovice u Lurdy';

  const guestBody = lang === 'cs'
    ? `<h2>Děkujeme za vaši poptávku!</h2>
       <p>Dobrý den ${guestName},</p>
       <p>přijali jsme vaši poptávku na pobyt na Stellplatzu Petřkovice u Lurdy. Budeme vás kontaktovat co nejdříve.</p>
       <h3>Shrnutí:</h3>
       <pre>${details}</pre>
       <p>S pozdravem,<br>Stellplatz Petřkovice u Lurdy</p>`
    : `<h2>Thank you for your inquiry!</h2>
       <p>Dear ${guestName},</p>
       <p>We have received your inquiry for a stay at Stellplatz Petřkovice u Lurdy. We will get back to you as soon as possible.</p>
       <h3>Summary:</h3>
       <pre>${details}</pre>
       <p>Best regards,<br>Stellplatz Petřkovice u Lurdy</p>`;

  const emails = [
    // Guest confirmation
    {
      from: 'Stellplatz Petřkovice <noreply@petrkovickelurdy.cz>',
      to: [guestEmail],
      subject: guestSubject,
      html: guestBody,
    },
    // Owner notification
    {
      from: 'Stellplatz Web <noreply@petrkovickelurdy.cz>',
      to: [ownerEmail],
      subject: `Nova poptavka: ${guestName} (${data.arrival} - ${data.departure})`,
      html: `<h2>Nová poptávka ze stellplatz webu</h2><pre>${details}</pre>`,
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

  return new Response('OK', { status: 200 });
};