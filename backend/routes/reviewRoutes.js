const express = require('express');
const router = express.Router();
const { getEventReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createReviewValidator } = require('../validators/reviewValidator');

router.get('/event/:eventId', getEventReviews);
router.post('/event/:eventId', protect, createReviewValidator, validate, createReview);

module.exports = router;
