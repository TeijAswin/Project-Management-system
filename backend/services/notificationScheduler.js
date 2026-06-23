const cron = require('node-cron');
const { Op } = require('sequelize');
const { User, Project, Task } = require('../models');
const { sendEmail, templates } = require('./emailService');
require('dotenv').config();

/** Returns true if a date is today */
const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

/** Returns true if a date is in the past (not today) */
const isOverdue = (dateStr) => {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59);
  return d < new Date();
};

/** Returns true if date is within N days from now */
const isWithinDays = (dateStr, days) => {
  const d = new Date(dateStr);
  const future = new Date();
  future.setDate(future.getDate() + days);
  return d >= new Date() && d <= future;
};

/**
 * DAILY DIGEST — runs every day at 8:00 AM (configurable via NOTIFY_DAILY_CRON)
 * Sends each user a summary of projects & tasks due within 7 days
 */
const scheduleDailyDigest = () => {
  const cronExpr = process.env.NOTIFY_DAILY_CRON || '0 8 * * *';
  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Running daily digest...');
    try {
      const users = await User.findAll();
      for (const user of users) {
        // Projects due within 7 days, not completed
        const projects = await Project.findAll({
          where: {
            user_id: user.id,
            status: { [Op.ne]: 'Completed' },
            end_date: {
              [Op.between]: [
                new Date(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              ],
            },
          },
          order: [['end_date', 'ASC']],
        });

        // Tasks due within 7 days, not completed
        const tasks = await Task.findAll({
          include: [{
            model: Project,
            where: { user_id: user.id },
            attributes: [],
          }],
          where: {
            status: { [Op.ne]: 'Completed' },
            due_date: {
              [Op.between]: [
                new Date(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              ],
            },
          },
          order: [['due_date', 'ASC']],
        });

        if (projects.length > 0 || tasks.length > 0) {
          const { subject, html } = templates.dailyDigest(user, projects, tasks);
          await sendEmail(user.email, subject, html);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Daily digest error:', err.message);
    }
  });
  console.log(`[Scheduler] Daily digest scheduled: ${cronExpr}`);
};

/**
 * DEADLINE ALERTS — runs every hour
 * Sends alerts for items due today or overdue (fires once per item per day via simple flag check)
 */
const scheduleDeadlineAlerts = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Checking deadlines...');
    try {
      const users = await User.findAll();
      for (const user of users) {
        // Projects due today or overdue
        const projects = await Project.findAll({
          where: {
            user_id: user.id,
            status: { [Op.ne]: 'Completed' },
            end_date: { [Op.lte]: new Date() },
          },
        });

        for (const project of projects) {
          const { subject, html } = templates.deadlineAlert(user, project, 'project');
          await sendEmail(user.email, subject, html);
        }

        // Tasks due today or overdue
        const tasks = await Task.findAll({
          include: [{
            model: Project,
            where: { user_id: user.id },
            attributes: ['id', 'project_name'],
          }],
          where: {
            status: { [Op.ne]: 'Completed' },
            due_date: { [Op.lte]: new Date() },
          },
        });

        for (const task of tasks) {
          const { subject, html } = templates.deadlineAlert(user, task, 'task');
          await sendEmail(user.email, subject, html);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Deadline alert error:', err.message);
    }
  });
  console.log('[Scheduler] Deadline alerts scheduled: every hour');
};

/**
 * NOT-STARTED REMINDERS — runs every day at 9:00 AM
 * Alerts users about projects that are still "Not Started" but past their start_date
 */
const scheduleNotStartedReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Checking not-started projects...');
    try {
      const users = await User.findAll();
      for (const user of users) {
        const projects = await Project.findAll({
          where: {
            user_id: user.id,
            status: 'Not Started',
            start_date: { [Op.lte]: new Date() }, // start date has passed
          },
        });

        for (const project of projects) {
          // Suggest an approximate start date = today
          const approxStart = new Date().toISOString().slice(0, 10);
          const { subject, html } = templates.notStartedReminder(user, project, approxStart);
          await sendEmail(user.email, subject, html);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Not-started reminder error:', err.message);
    }
  });
  console.log('[Scheduler] Not-started reminders scheduled: daily at 9:00 AM');
};

/** Start all schedulers */
const startSchedulers = () => {
  scheduleDailyDigest();
  scheduleDeadlineAlerts();
  scheduleNotStartedReminders();
};

module.exports = { startSchedulers };
