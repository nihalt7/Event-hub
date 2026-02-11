const express = require('express');
const router = express.Router();
const {
  getEvents,
  getFeaturedEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getAllEventsAdmin,
  approveEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createEventValidator, updateEventValidator } = require('../validators/eventValidator');

// Public (specific paths before :id)
router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/:id', getEvent);

// Protected
router.use(protect);
router.get('/organizer/my', authorize('organizer', 'admin'), getMyEvents);
router.get('/admin/all', authorize('admin'), getAllEventsAdmin);
router.post('/', authorize('organizer', 'admin'), createEventValidator, validate, createEvent);
router.put('/:id', updateEventValidator, validate, updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/approve', authorize('admin'), approveEvent);

module.exports = router;
