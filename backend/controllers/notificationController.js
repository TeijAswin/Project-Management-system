const { Op } = require('sequelize');
const { User, Project, Task } = require('../models');
const { sendEmail, templates } = require('../services/emailService');

/**
 * POST /api/notifications/test-daily
 * Manually trigger daily digest for the logged-in user (for testing)
 */
const testDailyDigest = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const projects = await Project.findAll({
      where: {
        user_id: user.id,
        status: { [Op.ne]: 'Completed' },
      },
      order: [['end_date', 'ASC']],
      limit: 10,
    });

    const tasks = await Task.findAll({
      include: [{ model: Project, where: { user_id: user.id }, attributes: [] }],
      where: { status: { [Op.ne]: 'Completed' } },
      order: [['due_date', 'ASC']],
      limit: 10,
    });

    const { subject, html } = templates.dailyDigest(user, projects, tasks);
    await sendEmail(user.email, subject, html);

    return res.status(200).json({ message: `Daily digest sent to ${user.email}` });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications/send-deadline/:projectId
 * Manually send a deadline alert for a specific project
 */
const sendProjectDeadlineAlert = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const project = await Project.findOne({ where: { id: req.params.projectId, user_id: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const { subject, html } = templates.deadlineAlert(user, project, 'project');
    await sendEmail(user.email, subject, html);

    return res.status(200).json({ message: `Deadline alert sent to ${user.email}` });
  } catch (err) {
    next(err);
  }
};

module.exports = { testDailyDigest, sendProjectDeadlineAlert };
