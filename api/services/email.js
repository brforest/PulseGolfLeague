import { Resend } from 'resend';

// Lazy client — env vars are loaded by the time these functions are called
function getClient() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = () => process.env.EMAIL_FROM || 'PGL <noreply@pulsegolfleague.com>';

export async function sendConfirmationEmail(playerInfo) {
  const { error } = await getClient().emails.send({
    from: FROM(),
    to: [playerInfo.email],
    subject: "You're registered — Yolo Fliers Matchplay Championship",
    html: confirmationHtml(playerInfo),
  });
  if (error) throw error;
}

export async function sendChargeEmail(playerInfo, { amountFormatted, paymentId }) {
  const { error } = await getClient().emails.send({
    from: FROM(),
    to: [playerInfo.email],
    subject: 'Entry fee charged — Yolo Fliers Matchplay Championship',
    html: chargeHtml(playerInfo, { amountFormatted, paymentId }),
  });
  if (error) throw error;
}

export async function sendContactEmail({ name, email, message }) {
  const to = process.env.ADMIN_ALERT_EMAIL || 'info@pulsegolfleague.com';
  const { error } = await getClient().emails.send({
    from: FROM(),
    to: [to],
    reply_to: email,
    subject: `[PGL Contact] Message from ${name}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="background:#1e2418;color:#f0ece0;font-family:Inter,sans-serif;padding:32px;max-width:600px;margin:0 auto;">
  <h2 style="color:#c42020;margin-bottom:8px;">New Contact Form Message</h2>
  <p style="color:#b0ab98;margin-bottom:24px;font-size:0.85rem;">${new Date().toISOString()}</p>
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:rgba(0,0,0,0.2);border-radius:4px;padding:16px;margin-bottom:20px;">
    <tr><td style="padding:6px 0;"><strong style="color:#b0ab98;">Name:</strong> ${esc(name)}</td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#b0ab98;">Email:</strong>
      <a href="mailto:${esc(email)}" style="color:#c42020;">${esc(email)}</a></td></tr>
  </table>
  <div style="background:rgba(0,0,0,0.2);border-radius:4px;padding:16px;white-space:pre-wrap;line-height:1.6;">
    ${esc(message)}
  </div>
</body>
</html>`,
  });
  if (error) throw error;
}

export async function sendAdminAlertEmail({ subject, errorType, playerEmail, playerInfo, detail, raw }) {
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!to) return; // silently skip if not configured

  const ts = new Date().toISOString();
  const detailHtml = detail ? `<p style="margin:0 0 8px;"><strong>Detail:</strong> ${esc(detail)}</p>` : '';
  const rawHtml = raw
    ? `<pre style="background:#111;color:#f0ece0;padding:16px;border-radius:4px;font-size:0.8rem;overflow-x:auto;white-space:pre-wrap;">${esc(
        typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)
      )}</pre>`
    : '';

  const p = playerInfo ?? {};
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const addressLine = [p.address, p.city, p.state, p.zip, p.country].filter(Boolean).join(', ');
  const contactHtml = (fullName || p.email || p.phone || addressLine) ? `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:rgba(0,0,0,0.2);border-radius:4px;padding:16px;margin-bottom:20px;">
      <tr><td style="padding:4px 0;"><strong style="color:#b0ab98;font-size:0.7rem;letter-spacing:2px;">PLAYER CONTACT</strong></td></tr>
      ${fullName   ? `<tr><td style="padding:4px 0;"><strong>Name:</strong> ${esc(fullName)}</td></tr>` : ''}
      ${p.email    ? `<tr><td style="padding:4px 0;"><strong>Email:</strong> <a href="mailto:${esc(p.email)}" style="color:#c42020;">${esc(p.email)}</a></td></tr>` : ''}
      ${p.phone    ? `<tr><td style="padding:4px 0;"><strong>Phone:</strong> ${esc(p.phone)}</td></tr>` : ''}
      ${addressLine ? `<tr><td style="padding:4px 0;"><strong>Address:</strong> ${esc(addressLine)}</td></tr>` : ''}
    </table>` : '';

  await getClient().emails.send({
    from: FROM(),
    to: [to],
    subject: `[PGL Alert] ${subject}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:32px 24px;background:#1e2418;font-family:Arial,sans-serif;color:#f0ece0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#2a3020;border:1px solid #c42020;border-radius:8px;overflow:hidden;">
    <tr><td style="background:#c42020;padding:20px 32px;">
      <p style="margin:0;font-size:0.65rem;letter-spacing:6px;color:#f0ece0;">PULSE GOLF LEAGUE — REGISTRATION ALERT</p>
      <h1 style="margin:8px 0 0;font-size:1.3rem;color:#f0ece0;">${esc(subject)}</h1>
    </td></tr>
    <tr><td style="padding:28px 32px;">
      <p style="margin:0 0 8px;"><strong>Time:</strong> ${ts}</p>
      <p style="margin:0 0 20px;"><strong>Error type:</strong> ${esc(errorType)}</p>
      ${contactHtml}
      ${detailHtml}
      ${rawHtml}
      <hr style="border:none;border-top:1px solid rgba(176,171,152,0.2);margin:24px 0;" />
      <p style="font-size:0.75rem;color:#706c58;">Check <code>pm2 logs pgl-api</code> for full stack traces.</p>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ─── Templates ────────────────────────────────────────────────────────────────

function confirmationHtml(p) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#1e2418;font-family:Arial,sans-serif;color:#f0ece0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e2418;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#2a3020;border:1px solid rgba(176,171,152,0.2);border-radius:8px;overflow:hidden;max-width:600px;">

        <!-- Header bar -->
        <tr>
          <td style="background:#c42020;padding:32px 40px;">
            <p style="margin:0;font-size:0.7rem;font-weight:700;letter-spacing:6px;color:#f0ece0;text-transform:uppercase;">
              Pulse Golf League
            </p>
            <h1 style="margin:12px 0 0;font-size:1.8rem;font-weight:700;color:#f0ece0;line-height:1.2;">
              You're in the field.
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 28px;font-size:0.95rem;color:#b0ab98;line-height:1.7;">
              Welcome, <strong style="color:#f0ece0;">${esc(p.firstName)} ${esc(p.lastName)}</strong>.
              Your registration for the
              <strong style="color:#f0ece0;">Yolo Fliers Matchplay Championship</strong>
              is confirmed.
            </p>

            <!-- Detail rows -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${row('Event', 'Yolo Fliers Matchplay Championship')}
              ${row('Qualifier', 'Monday, September 8, 2026')}
              ${row('Match Play', 'September 9–11, 2026')}
              ${row('Venue', 'Yolo Fliers Club — Woodland, CA')}
              ${row('Playing Status', esc(p.playingStatus))}
              ${row('Entry Fee', '$519.00 USD')}
              ${row('Charge Date', 'On or around August 25, 2026')}
            </table>

            <!-- Charge notice -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:16px 20px;background:rgba(0,0,0,0.25);border-left:2px solid #c42020;
                           font-size:0.85rem;color:#b0ab98;line-height:1.7;border-radius:0 4px 4px 0;">
                  Your card will <strong style="color:#f0ece0;">not</strong> be charged today.
                  The $519 entry fee will be collected approximately two weeks before the event,
                  on or around <strong style="color:#f0ece0;">August 25, 2026</strong>.
                  You'll receive another email when your card is charged.
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:0.82rem;color:#706c58;line-height:1.6;">
              Questions? Reply to this email or contact us at
              <a href="mailto:info@pulsegolfleague.com" style="color:#b0ab98;">info@pulsegolfleague.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(176,171,152,0.15);">
            <p style="margin:0;font-size:0.65rem;letter-spacing:2px;color:#706c58;text-transform:uppercase;">
              © 2026 Pulse Golf League · pulsegolfleague.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function chargeHtml(p, { amountFormatted, paymentId }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Entry Fee Charged</title>
</head>
<body style="margin:0;padding:0;background:#1e2418;font-family:Arial,sans-serif;color:#f0ece0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e2418;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#2a3020;border:1px solid rgba(176,171,152,0.2);border-radius:8px;overflow:hidden;max-width:600px;">

        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid rgba(176,171,152,0.15);">
            <p style="margin:0;font-size:0.7rem;font-weight:700;letter-spacing:6px;color:#706c58;text-transform:uppercase;">
              Pulse Golf League
            </p>
            <h1 style="margin:12px 0 0;font-size:1.8rem;font-weight:700;color:#f0ece0;line-height:1.2;">
              Entry fee confirmed.
            </h1>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 28px;font-size:0.95rem;color:#b0ab98;line-height:1.7;">
              Hi <strong style="color:#f0ece0;">${esc(p.firstName)}</strong>,
              your entry fee for the Yolo Fliers Matchplay Championship has been successfully processed.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${row('Amount Charged', esc(amountFormatted))}
              ${row('Payment ID', esc(paymentId))}
              ${row('Event', 'Yolo Fliers Matchplay Championship')}
              ${row('Qualifier', 'Monday, September 8, 2026')}
              ${row('Match Play', 'September 9–11, 2026')}
              ${row('Venue', 'Yolo Fliers Club — Woodland, CA')}
            </table>

            <p style="margin:0;font-size:0.82rem;color:#706c58;line-height:1.6;">
              Questions? Contact us at
              <a href="mailto:info@pulsegolfleague.com" style="color:#b0ab98;">info@pulsegolfleague.com</a>
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(176,171,152,0.15);">
            <p style="margin:0;font-size:0.65rem;letter-spacing:2px;color:#706c58;text-transform:uppercase;">
              © 2026 Pulse Golf League · pulsegolfleague.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Custom admin email ────────────────────────────────────────────────────────

export async function sendCustomEmail({ to, subject, bodyText }) {
  const { error } = await getClient().emails.send({
    from: FROM(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html: customEmailHtml(subject, bodyText),
  });
  if (error) throw error;
}

function customEmailHtml(subject, bodyText) {
  const bodyHtml = String(bodyText ?? '')
    .split(/\n\n+/)
    .map(
      (para) =>
        `<p style="margin:0 0 20px;font-size:0.95rem;color:#b0ab98;line-height:1.7;">${esc(para).replace(/\n/g, '<br />')}</p>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#1e2418;font-family:Arial,sans-serif;color:#f0ece0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e2418;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#2a3020;border:1px solid rgba(176,171,152,0.2);border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#c42020;padding:32px 40px;">
            <p style="margin:0;font-size:0.7rem;font-weight:700;letter-spacing:6px;color:#f0ece0;text-transform:uppercase;">
              Pulse Golf League
            </p>
            <h1 style="margin:12px 0 0;font-size:1.8rem;font-weight:700;color:#f0ece0;line-height:1.2;">
              ${esc(subject)}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            ${bodyHtml}
            <p style="margin:0;font-size:0.82rem;color:#706c58;line-height:1.6;">
              Questions? Contact us at
              <a href="mailto:info@pulsegolfleague.com" style="color:#b0ab98;">info@pulsegolfleague.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(176,171,152,0.15);">
            <p style="margin:0;font-size:0.65rem;letter-spacing:2px;color:#706c58;text-transform:uppercase;">
              © 2026 Pulse Golf League · pulsegolfleague.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escape HTML to prevent injection in email templates */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label, value) {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(176,171,152,0.1);
               font-size:0.62rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;
               color:#706c58;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0 10px 16px;border-bottom:1px solid rgba(176,171,152,0.1);
               font-size:0.88rem;color:#f0ece0;">${value}</td>
  </tr>`;
}
