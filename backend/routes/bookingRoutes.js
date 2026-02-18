const express = require('express');
const router = express.Router();
const {
  getMyBookings,
  getBooking,
  createBooking,
  cancelBooking,
  getEventBookings,
<<<<<<< HEAD
  verifyQR,
  checkIn,
  checkInById,
  searchBookings,
  regenerateQR,
  getAllBookingsAdmin,
  getBookingStats,
=======
>>>>>>> c2611885a86f5d785e90f90ba272a6e7b4546637
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBookingValidator } = require('../validators/bookingValidator');

router.use(protect);
<<<<<<< HEAD

// Admin routes (must be before :id routes)
router.get('/admin/all', getAllBookingsAdmin);
router.get('/admin/stats', getBookingStats);

router.get('/', getMyBookings);
router.get('/event/:eventId', getEventBookings);
router.get('/search/:eventId', searchBookings);
=======
router.get('/', getMyBookings);
router.get('/event/:eventId', getEventBookings);
>>>>>>> c2611885a86f5d785e90f90ba272a6e7b4546637
router.get('/:id', getBooking);
router.post('/', createBookingValidator, validate, createBooking);
router.patch('/:id/cancel', cancelBooking);

<<<<<<< HEAD
// QR Code routes
router.post('/verify-qr', verifyQR);
router.post('/check-in', checkIn);
router.patch('/:id/check-in', checkInById);
router.get('/:id/regenerate-qr', regenerateQR);

=======
>>>>>>> c2611885a86f5d785e90f90ba272a6e7b4546637
module.exports = router;
