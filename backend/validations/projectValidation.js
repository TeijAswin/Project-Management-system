const { body } = require('express-validator');

const projectValidation = [
  body('project_name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 200 }).withMessage('Project name max 200 chars'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date')
    .isDate().withMessage('Valid end date is required')
    .custom((end_date, { req }) => {
      if (new Date(end_date) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

module.exports = { projectValidation };
