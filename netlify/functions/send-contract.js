// Netlify Function: emails a copy of a signed 0% finance boiler installation
// agreement (PDF attached) to the business inbox.
//
// Required Netlify environment variables (Site configuration > Environment variables):
//   GMAIL_USER          - the Gmail address that sends the email (e.g. broxburnboilers@gmail.com)
//   GMAIL_APP_PASSWORD  - a 16-character Google App Password for that account
// Optional:
//   CONTRACT_NOTIFY_TO  - override recipient (defaults to broxburnboilers@gmail.com)

const nodemailer = require('nodemailer');

const DEFAULT_TO = 'broxburnboilers@gmail.com';
const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4 MB safety cap

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clean(s, max) {
  return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim().slice(0, max || 300);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error('send-contract: GMAIL_USER / GMAIL_APP_PASSWORD not configured');
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Email not configured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
  }

  // Honeypot: bots fill hidden fields
  if (data.bot_field) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const pdfB64 = String(data.pdf_base64 || '').replace(/^data:application\/pdf;[^,]*,/, '');
  if (!pdfB64) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing PDF' }) };
  }
  const pdfBuffer = Buffer.from(pdfB64, 'base64');
  if (pdfBuffer.length < 100 || pdfBuffer.length > MAX_PDF_BYTES || pdfBuffer.slice(0, 4).toString() !== '%PDF') {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid PDF' }) };
  }

  const d = {
    name: clean(data.full_name, 120),
    address: clean(data.installation_address, 250),
    phone: clean(data.phone, 40),
    email: clean(data.email, 120),
    boiler: clean(data.boiler_model, 150),
    installDate: clean(data.installation_date, 120),
    agreementDate: clean(data.agreement_date, 60),
    totalPrice: clean(data.total_price, 40),
    monthly: clean(data.monthly_summary, 250),
    plan: clean(data.service_plan, 60) || 'None'
  };

  const safeName = (d.name || 'Customer').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = 'Signed-0pct-Finance-Agreement-' + safeName + '.pdf';

  const rows = [
    ['Customer', d.name],
    ['Installation address', d.address],
    ['Phone', d.phone],
    ['Email', d.email],
    ['Boiler', d.boiler],
    ['Total price', d.totalPrice],
    ['Monthly payment', d.monthly],
    ['Service plan add-on', d.plan],
    ['Preferred install date', d.installDate],
    ['Signed on', d.agreementDate]
  ];

  const html =
    '<div style="font-family:Arial,sans-serif;color:#0b2545;max-width:600px">' +
    '<h2 style="color:#0b2545;margin:0 0 4px">New 0% finance boiler installation sign-up</h2>' +
    '<p style="margin:0 0 16px;color:#444">A customer has signed the 0% interest, 12-month payment plan agreement on westlothiangas.com. The signed contract is attached as a PDF.</p>' +
    '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">' +
    rows.map(function (r) {
      return '<tr><th align="left" style="border-bottom:1px solid #e3e8ef;width:180px;color:#555;font-weight:600">' +
        esc(r[0]) + '</th><td style="border-bottom:1px solid #e3e8ef">' + esc(r[1] || '-') + '</td></tr>';
    }).join('') +
    '</table>' +
    '<p style="margin-top:16px;font-size:13px;color:#666">Next step: check Stripe for the first instalment payment, then contact the customer to arrange the survey/installation.</p>' +
    '</div>';

  const text = 'New 0% finance boiler installation sign-up\n\n' +
    rows.map(function (r) { return r[0] + ': ' + (r[1] || '-'); }).join('\n') +
    '\n\nThe signed contract is attached as a PDF.';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: user, pass: pass }
  });

  try {
    await transporter.sendMail({
      from: '"West Lothian Gas Website" <' + user + '>',
      to: process.env.CONTRACT_NOTIFY_TO || DEFAULT_TO,
      replyTo: d.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) ? d.email : undefined,
      subject: 'New 0% finance sign-up: ' + (d.name || 'Customer') + (d.boiler ? ' - ' + d.boiler : ''),
      text: text,
      html: html,
      attachments: [{ filename: filename, content: pdfBuffer, contentType: 'application/pdf' }]
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('send-contract: sendMail failed', err && err.message);
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'Email send failed' }) };
  }
};
