const Review = require('../models/Review');
const Event = require('../models/Event');

/**
 * @route   GET /api/events/:eventId/reviews
 */
exports.getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('user', 'name profile.avatar')
      .sort('-createdAt');
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const stats = await Review.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      data: reviews,
      stats: stats[0] ? { average: stats[0].avg, count: stats[0].count } : { average: 0, count: 0 },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/events/:eventId/reviews
 * @access  Protected
 */
exports.createReview = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const existing = await Review.findOne({ user: req.user.id, event: req.params.eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this event' });
    }
    const review = await Review.create({
      user: req.user.id,
      event: req.params.eventId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    const populated = await Review.findById(review._id).populate('user', 'name profile.avatar');
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    next(err);
  }
};
