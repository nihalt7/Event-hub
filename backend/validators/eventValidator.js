const { body } = require('express-validator');

const categories = ['conference', 'workshop', 'concert', 'meetup', 'sports', 'webinar', 'festival', 'other'];

exports.createEventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(categories).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('ticketTypes').optional().isArray(),
  body('ticketTypes.*.name').optional().trim().notEmpty(),
  body('ticketTypes.*.price').optional().isFloat({ min: 0 }),
  body('ticketTypes.*.quantity').optional().isInt({ min: 0 }),
  body('capacity').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['draft', 'published']),
  body('images').optional().isArray(),
];

exports.updateEventValidator = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty(),
  body('category').optional().isIn(categories),
  body('date').optional().isISO8601(),
  body('venue').optional().trim().notEmpty(),
  body('ticketTypes').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']),
];
