const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await sequelize.query(
      `SELECT
        COUNT(DISTINCT p.id) AS total_projects,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS pending_tasks,
        SUM(CASE WHEN p.status = 'In Progress' THEN 1 ELSE 0 END) AS projects_in_progress
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.user_id = :userId`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    const stats = result[0];
    return res.status(200).json({
      total_projects: parseInt(stats.total_projects) || 0,
      total_tasks: parseInt(stats.total_tasks) || 0,
      completed_tasks: parseInt(stats.completed_tasks) || 0,
      pending_tasks: parseInt(stats.pending_tasks) || 0,
      projects_in_progress: parseInt(stats.projects_in_progress) || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
