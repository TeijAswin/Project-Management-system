const { body } = require('express-validator');

const taskValidation = [
  body('task_name')
    .trim()
    .notEmpty().withMessage('Task name is required')
    .isLength({ max: 200 }).withMessage('Task name max 200 chars'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority')
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('due_date').isDate().withMessage('Valid due date is required'),
  body('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Valid project ID is required'),
];

module.exports = { taskValidation };
