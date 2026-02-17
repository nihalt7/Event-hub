const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const createOrderValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID required'),
  body('ticketTypeName').trim().notEmpty().withMessage('Ticket type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const verifyValidator = [
  body('razorpay_payment_id').trim().notEmpty().withMessage('Payment ID required'),
  body('razorpay_order_id').trim().notEmpty().withMessage('Order ID required'),
  body('razorpay_signature').trim().notEmpty().withMessage('Signature required'),
  body('eventId').isMongoId().withMessage('Valid event ID required'),
  body('ticketTypeName').trim().notEmpty().withMessage('Ticket type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

router.use(protect);
router.post('/create-order', createOrderValidator, validate, createOrder);
router.post('/verify', verifyValidator, validate, verifyPayment);

module.exports = router;
