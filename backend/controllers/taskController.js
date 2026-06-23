const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Task, Project } = require('../models');

const getAllTasks = async (req, res, next) => {
  try {
    const { project_id, search, status, priority } = req.query;
    const projectWhere = { user_id: req.user.id };
    if (project_id) projectWhere.id = project_id;

    const taskWhere = {};
    if (search) taskWhere.task_name = { [Op.like]: `%${search}%` };
    if (status) taskWhere.status = status;
    if (priority) taskWhere.priority = priority;

    const tasks = await Task.findAll({
      where: taskWhere,
      include: [{ model: Project, where: projectWhere, attributes: ['id', 'project_name', 'user_id'] }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [{ model: Project, attributes: ['id', 'project_name', 'user_id'] }],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    if (task.Project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { project_id, task_name, description, priority, status, due_date } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({ where: { id: project_id, user_id: req.user.id } });
    if (!project) {
      return res.status(403).json({ message: 'Project not found or access denied.' });
    }

    const task = await Task.create({
      project_id,
      task_name,
      description,
      priority,
      status: status || 'Pending',
      due_date,
    });

    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [{ model: Project, attributes: ['id', 'user_id'] }],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    if (task.Project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { task_name, description, priority, status, due_date } = req.body;
    await task.update({ task_name, description, priority, status, due_date });

    return res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [{ model: Project, attributes: ['id', 'user_id'] }],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    if (task.Project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await task.destroy();
    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
