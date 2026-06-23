const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Project, Task } = require('../models');

const getAllProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const where = { user_id: req.user.id };

    if (search) {
      where.project_name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const projects = await Project.findAll({ where, order: [['created_at', 'DESC']] });
    return res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id },
      include: [{ model: Task }],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { project_name, description, status, start_date, end_date } = req.body;
    const project = await Project.create({
      user_id: req.user.id,
      project_name,
      description,
      status: status || 'Not Started',
      start_date,
      end_date,
    });

    return res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { project_name, description, status, start_date, end_date } = req.body;
    await project.update({ project_name, description, status, start_date, end_date });

    return res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await project.destroy();
    return res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
