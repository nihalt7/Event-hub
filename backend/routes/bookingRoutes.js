const express = require('express');
const router = express.Router();
const {
  getMyBookings,
  getBooking,
  createBooking,
  cancelBooking,
  getEventBookings,
  verifyQR,
  checkIn,
  checkInById,
  searchBookings,
  regenerateQR,
  getAllBookingsAdmin,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBookingValidator } = require('../validators/bookingValidator');

router.use(protect);

// Admin routes (must be before :id routes)
router.get('/admin/all', getAllBookingsAdmin);
router.get('/admin/stats', getBookingStats);

router.get('/', getMyBookings);
router.get('/event/:eventId', getEventBookings);
router.get('/search/:eventId', searchBookings);
router.get('/:id', getBooking);
router.post('/', createBookingValidator, validate, createBooking);
router.patch('/:id/cancel', cancelBooking);

// QR Code routes
router.post('/verify-qr', verifyQR);
router.post('/check-in', checkIn);
router.patch('/:id/check-in', checkInById);
router.get('/:id/regenerate-qr', regenerateQR);

module.exports = router;
