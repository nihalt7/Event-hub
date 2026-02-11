const Event = require('../models/Event');

/**
 * @route   GET /api/events
 * Public - list published events with pagination, search, filters
 */
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const query = { status: 'published' };
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { category: new RegExp(req.query.search, 'i') },
      ];
    }
    if (req.query.dateFrom || req.query.dateTo) {
      query.date = {};
      if (req.query.dateFrom) query.date.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.date.$lte = new Date(req.query.dateTo);
    }
    if (req.query.featured === 'true') query.featured = true;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email profile')
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort === 'date' ? 'date' : '-createdAt');

    res.json({
      success: true,
      data: events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/featured
 */
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', featured: true })
      .populate('organizer', 'name')
      .limit(6)
      .sort('date');
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/:id
 */
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email profile');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/events
 * @access  Organizer, Admin
 */
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/events/:id
 */
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'name email');
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event removed' });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/organizer/my
 * @access  Organizer
 */
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/admin/all
 * @access  Admin
 */
exports.getAllEventsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Event.countDocuments();
    const events = await Event.find()
      .populate('organizer', 'name email')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
    res.json({
      success: true,
      data: events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/events/:id/approve
 * @access  Admin
 */
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { approvedByAdmin: true, status: 'published' },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};
