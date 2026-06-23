const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { verifyToken } = require('../middleware/authMiddleware');
const { projectValidation } = require('../validations/projectValidation');

router.use(verifyToken);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', projectValidation, createProject);
router.put('/:id', projectValidation, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
