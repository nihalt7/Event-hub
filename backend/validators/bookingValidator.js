const { body } = require('express-validator');

exports.createBookingValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID required'),
  body('ticketTypeName').trim().notEmpty().withMessage('Ticket type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];
