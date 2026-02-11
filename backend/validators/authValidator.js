const { body } = require('express-validator');

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['attendee', 'organizer']).withMessage('Invalid role'),
];

exports.loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];
