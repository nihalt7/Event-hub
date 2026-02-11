const Booking = require('../models/Booking');
const Event = require('../models/Event');

/**
 * @route   GET /api/bookings
 * @access  Protected - user's bookings
 */
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title date venue images')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/bookings/:id
 */
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date venue organizer')
      .populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      const event = await Event.findById(booking.event._id);
      if (event.organizer.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/bookings
 */
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketTypeName, quantity } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Event is not available for booking' });
    }
    const ticketType = event.ticketTypes?.find((t) => t.name === ticketTypeName);
    if (!ticketType) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type' });
    }
    const available = ticketType.quantity - (ticketType.sold || 0);
    if (quantity > available) {
      return res.status(400).json({ success: false, message: 'Not enough tickets available' });
    }
    const totalAmount = ticketType.price * quantity;
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      ticketType: { name: ticketType.name, price: ticketType.price },
      quantity,
      totalAmount,
      status: 'confirmed',
    });
    ticketType.sold = (ticketType.sold || 0) + quantity;
    event.attendees.addToSet(req.user.id);
    await event.save();
    const populated = await Booking.findById(booking._id)
      .populate('event', 'title date venue')
      .populate('user', 'name email');
    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/bookings/:id/cancel
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    const event = await Event.findById(booking.event._id);
    const tt = event.ticketTypes.find((t) => t.name === booking.ticketType.name);
    if (tt) {
      tt.sold = Math.max(0, (tt.sold || 0) - booking.quantity);
      await event.save();
    }
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/:eventId/bookings
 * @access  Organizer or Admin
 */
exports.getEventBookings = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const bookings = await Booking.find({ event: req.params.eventId, status: { $ne: 'cancelled' } })
      .populate('user', 'name email')
      .sort('-createdAt');
    const revenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    res.json({ success: true, data: bookings, revenue });
  } catch (err) {
    next(err);
  }
};
