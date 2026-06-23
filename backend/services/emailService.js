const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a styled HTML email.
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not configured — skipping email send.');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"PMS Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[EmailService] Failed to send to ${to}:`, err.message);
  }
};

/** Base HTML email wrapper with green branding */
const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Inter,Arial,sans-serif;">
  <!-- Top green banner -->
  <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.5px;">📋 PMS</h1>
    <p style="margin:4px 0 0;color:#dcfce7;font-size:13px;">Project Management System</p>
  </div>

  <!-- Card -->
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;border:1px solid #e2e8f0;">
    <!-- Light green accent strip -->
    <div style="height:4px;background:linear-gradient(90deg,#22c55e,#86efac);"></div>
    <div style="padding:32px;">
      ${bodyHtml}
    </div>
    <div style="padding:16px 32px;background:#f0fdf4;border-top:1px solid #dcfce7;text-align:center;">
      <p style="margin:0;color:#6b7280;font-size:12px;">
        PMS — Project Management System &nbsp;|&nbsp;
        This is an automated notification. Do not reply.
      </p>
    </div>
  </div>
</body>
</html>`;

/** ─── Email Templates ─── */

const templates = {

  /**
   * Daily digest: list of today's deadlines for projects + tasks
   */
  dailyDigest: (user, projects, tasks) => {
    const projectRows = projects.length
      ? projects.map(p => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:500;color:#111827;">${p.project_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">
              <span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:999px;font-size:12px;">${p.status}</span>
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">${new Date(p.end_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
          </tr>`).join('')
      : `<tr><td colspan="3" style="padding:12px;text-align:center;color:#9ca3af;font-size:13px;">No projects due soon</td></tr>`;

    const taskRows = tasks.length
      ? tasks.map(t => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:500;color:#111827;">${t.task_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">
              <span style="background:${t.priority==='High'?'#fee2e2':t.priority==='Medium'?'#fef3c7':'#f3f4f6'};color:${t.priority==='High'?'#dc2626':t.priority==='Medium'?'#d97706':'#4b5563'};padding:2px 8px;border-radius:999px;font-size:12px;">${t.priority}</span>
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">${new Date(t.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
          </tr>`).join('')
      : `<tr><td colspan="3" style="padding:12px;text-align:center;color:#9ca3af;font-size:13px;">No tasks due soon</td></tr>`;

    const body = `
      <h2 style="margin:0 0 4px;color:#111827;font-size:20px;">Good morning, ${user.fullname.split(' ')[0]}! ☀️</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Here's your daily project update for <strong>${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</strong>.</p>

      <h3 style="margin:0 0 10px;color:#15803d;font-size:15px;display:flex;align-items:center;gap:6px;">🗂️ Projects Due Soon</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
        <thead>
          <tr style="background:#f0fdf4;">
            <th style="text-align:left;padding:8px 12px;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Project</th>
            <th style="text-align:left;padding:8px 12px;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
            <th style="text-align:left;padding:8px 12px;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Deadline</th>
          </tr>
        </thead>
        <tbody>${projectRows}</tbody>
      </table>

      <h3 style="margin:0 0 10px;color:#15803d;font-size:15px;">✅ Tasks Due Soon</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f0fdf4;">
            <th style="text-align:left;padding:8px 12px;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Task</th>
            <th style="text-align:left;padding:8px 12px;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Priority</th>
            <th style="text-align:left;padding:8px 12px;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Due Date</th>
          </tr>
        </thead>
        <tbody>${taskRows}</tbody>
      </table>`;

    return {
      subject: `📋 PMS Daily Update — ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}`,
      html: emailWrapper('Daily Update', body),
    };
  },

  /**
   * Deadline alert: project or task is due today or overdue
   */
  deadlineAlert: (user, item, type) => {
    const isOverdue = new Date(item.end_date || item.due_date) < new Date();
    const deadlineStr = new Date(item.end_date || item.due_date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const name = item.project_name || item.task_name;
    const color = isOverdue ? '#dc2626' : '#d97706';
    const bg = isOverdue ? '#fee2e2' : '#fef3c7';
    const label = isOverdue ? '🚨 OVERDUE' : '⏰ DUE TODAY';

    const body = `
      <div style="background:${bg};border:1px solid ${color};border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <span style="color:${color};font-weight:700;font-size:14px;">${label}</span>
      </div>
      <h2 style="margin:0 0 6px;color:#111827;font-size:18px;">Hi ${user.fullname.split(' ')[0]}, your ${type} needs attention</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">The following ${type} ${isOverdue ? 'was due on' : 'is due'} <strong>${deadlineStr}</strong>.</p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-weight:600;color:#111827;font-size:15px;">${name}</p>
        ${item.description ? `<p style="margin:0;color:#6b7280;font-size:13px;">${item.description}</p>` : ''}
        ${item.status ? `<p style="margin:8px 0 0;font-size:13px;color:#374151;">Status: <strong>${item.status}</strong></p>` : ''}
        ${item.priority ? `<p style="margin:4px 0 0;font-size:13px;color:#374151;">Priority: <strong>${item.priority}</strong></p>` : ''}
      </div>
      <p style="color:#6b7280;font-size:13px;">Log in to PMS to update the status.</p>`;

    return {
      subject: `${isOverdue ? '🚨 Overdue' : '⏰ Due Today'}: ${name}`,
      html: emailWrapper(`${type} Deadline Alert`, body),
    };
  },

  /**
   * Not-started project reminder: project hasn't started yet
   */
  notStartedReminder: (user, project, approxStartDate) => {
    const body = `
      <h2 style="margin:0 0 6px;color:#111827;font-size:18px;">Project not started yet</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Hi ${user.fullname.split(' ')[0]}, a project that was scheduled to begin has not started.</p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-weight:600;color:#111827;font-size:15px;">${project.project_name}</p>
        <p style="margin:0;color:#6b7280;font-size:13px;">${project.description}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#374151;">Scheduled start: <strong>${new Date(project.start_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</strong></p>
        <p style="margin:4px 0 0;font-size:13px;color:#374151;">Deadline: <strong>${new Date(project.end_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</strong></p>
        ${approxStartDate ? `<div style="margin-top:12px;background:#dcfce7;border:1px solid #86efac;border-radius:6px;padding:10px;">
          <p style="margin:0;color:#15803d;font-size:13px;font-weight:600;">💡 Suggested start date: ${new Date(approxStartDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
        </div>` : ''}
      </div>
      <p style="color:#6b7280;font-size:13px;">Log in to PMS to update the project status to "In Progress".</p>`;

    return {
      subject: `📌 Project Not Started: ${project.project_name}`,
      html: emailWrapper('Project Not Started', body),
    };
  },
};

module.exports = { sendEmail, templates };
