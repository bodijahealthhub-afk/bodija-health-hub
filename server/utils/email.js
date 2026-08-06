const nodemailer = require('nodemailer');

let transporter = null;

function init() {
  if (!process.env.SMTP_HOST) {
    console.log('[email] SMTP not configured — email notifications disabled');
    return;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

init();

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`[email] skipped (SMTP not configured): to=${to} subject=${subject}`);
    return null;
  }
  try {
    const from = process.env.SMTP_FROM || 'Bodija Health Hub <noreply@bodijahealthhub.com>';
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`[email] sent to=${to} subject=${subject} id=${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[email] send failed to=${to}: ${err.message}`);
    return null;
  }
}

module.exports = { sendMail };
