const express = require('express');
const router = express.Router();
const {
  getMyBookings,
  getBooking,
  createBooking,
  cancelBooking,
  getEventBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBookingValidator } = require('../validators/bookingValidator');

router.use(protect);
router.get('/', getMyBookings);
router.get('/event/:eventId', getEventBookings);
router.get('/:id', getBooking);
router.post('/', createBookingValidator, validate, createBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
