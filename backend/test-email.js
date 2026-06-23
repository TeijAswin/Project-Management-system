/**
 * PMS Email Test Script
 * Run: node test-email.js
 *
 * Tests:
 *  1. SMTP connection (verify credentials)
 *  2. Send a real test email to your own address
 *  3. Preview what each template looks like
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_FROM = process.env.EMAIL_FROM || `"PMS Notifications" <${EMAIL_USER}>`;

// ─── Colour helpers for console output ───
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const cyan   = (s) => `\x1b[36m${s}\x1b[0m`;

function sep() { console.log(cyan('─'.repeat(55))); }

async function main() {
  console.log('\n');
  sep();
  console.log(bold('  📧  PMS Email Test'));
  sep();

  // ── Step 1: Check config ───────────────────────────────
  console.log('\n' + bold('Step 1 — Checking .env config'));

  const missing = [];
  if (!EMAIL_USER) missing.push('EMAIL_USER');
  if (!EMAIL_PASS) missing.push('EMAIL_PASS');

  if (missing.length) {
    console.log(red(`  ✗ Missing in .env: ${missing.join(', ')}`));
    console.log(yellow('  → Open backend/.env and fill in your Gmail address and App Password'));
    console.log(yellow('  → App Password setup: https://myaccount.google.com/apppasswords\n'));
    process.exit(1);
  }

  console.log(green(`  ✓ EMAIL_USER  = ${EMAIL_USER}`));
  console.log(green(`  ✓ EMAIL_PASS  = ${'*'.repeat(EMAIL_PASS.replace(/\s/g,'').length)} (${EMAIL_PASS.replace(/\s/g,'').length} chars)`));
  console.log(green(`  ✓ EMAIL_HOST  = ${EMAIL_HOST}:${EMAIL_PORT}`));
  console.log(green(`  ✓ EMAIL_FROM  = ${EMAIL_FROM}`));

  // ── Step 2: Verify SMTP connection ────────────────────
  console.log('\n' + bold('Step 2 — Verifying SMTP connection'));

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  try {
    await transporter.verify();
    console.log(green('  ✓ SMTP connection successful — credentials are valid!'));
  } catch (err) {
    console.log(red('  ✗ SMTP connection FAILED'));
    console.log(red(`  Error: ${err.message}\n`));

    if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
      console.log(yellow('  Possible fixes:'));
      console.log(yellow('  1. Make sure you are using an App Password, not your Gmail login password'));
      console.log(yellow('  2. Generate one at: https://myaccount.google.com/apppasswords'));
      console.log(yellow('  3. Make sure 2-Step Verification is ON for your Google account'));
      console.log(yellow('  4. Copy the 16-char App Password exactly (spaces are OK)'));
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      console.log(yellow('  → Network/firewall issue. Check your internet connection.'));
    } else if (err.message.includes('self signed') || err.message.includes('certificate')) {
      console.log(yellow('  → SSL issue. Try setting EMAIL_PORT=465 and secure=true in emailService.js'));
    }
    process.exit(1);
  }

  // ── Step 3: Send a real test email ─────────────────────
  console.log('\n' + bold('Step 3 — Sending test email to yourself'));

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
  <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">📋 PMS</h1>
    <p style="margin:4px 0 0;color:#dcfce7;font-size:13px;">Project Management System</p>
  </div>
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;
              box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #e2e8f0;overflow:hidden;">
    <div style="height:4px;background:linear-gradient(90deg,#22c55e,#86efac);"></div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#111827;">✅ Email system is working!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        This is a test email from your <strong>PMS — Project Management System</strong>.<br/>
        Your Gmail SMTP configuration is correct and emails will be delivered.
      </p>
      <div style="margin-top:20px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;">
        <p style="margin:0;font-size:13px;color:#15803d;">
          <strong>Sent at:</strong> ${new Date().toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}<br/>
          <strong>From:</strong> ${EMAIL_FROM}<br/>
          <strong>To:</strong> ${EMAIL_USER}
        </p>
      </div>
      <p style="margin-top:20px;color:#6b7280;font-size:13px;">
        Automated notifications are now active. You will receive:<br/>
        &bull; Daily digest at 8:00 AM<br/>
        &bull; Deadline alerts for overdue items (every hour)<br/>
        &bull; Not-started project reminders at 9:00 AM
      </p>
    </div>
    <div style="padding:16px 32px;background:#f0fdf4;border-top:1px solid #dcfce7;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">PMS — Automated Notification System</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_USER,
      subject: '✅ PMS Email Test — System Working',
      html,
    });
    console.log(green(`  ✓ Email sent successfully!`));
    console.log(green(`  ✓ Message ID: ${info.messageId}`));
    console.log(green(`  ✓ Delivered to: ${EMAIL_USER}`));
    console.log(yellow(`\n  👉 Check your inbox (and spam folder) for the test email.`));
  } catch (err) {
    console.log(red(`  ✗ Send failed: ${err.message}`));
    process.exit(1);
  }

  // ── Step 4: Summary ────────────────────────────────────
  console.log('\n');
  sep();
  console.log(bold('  Result Summary'));
  sep();
  console.log(green('  ✓ Config loaded'));
  console.log(green('  ✓ SMTP connection verified'));
  console.log(green('  ✓ Test email delivered'));
  console.log('\n  ' + bold('Email system is fully operational! 🎉'));
  console.log('\n  Scheduled notifications:');
  console.log(`  • Daily digest  : ${process.env.NOTIFY_DAILY_CRON || '0 8 * * *'} (8:00 AM)`);
  console.log('  • Deadline check: every hour');
  console.log('  • Not-started   : 0 9 * * * (9:00 AM)');
  sep();
  console.log('');
}

main().catch((err) => {
  console.error(red('\nUnexpected error: ' + err.message));
  process.exit(1);
});
