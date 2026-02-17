const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { generateSecureToken, generateQRCode, verifyQRPayload } = require('../utils/qrCode');

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
    
    // Create booking first to get the ID
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      ticketType: { name: ticketType.name, price: ticketType.price },
      quantity,
      totalAmount,
      status: 'confirmed',
    });

    // Generate secure token and QR code
    const secureToken = generateSecureToken(booking._id, eventId, req.user.id);
    booking.secureToken = secureToken;
    const qrCode = await generateQRCode(booking);
    booking.qrCode = qrCode;
    await booking.save();

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

/**
 * @route   POST /api/bookings/verify-qr
 * @desc    Verify QR code and get booking details
 * @access  Organizer or Admin
 */
exports.verifyQR = async (req, res, next) => {
  try {
    const { payload } = req.body; // QR payload object: { bid, eid, uid, tok }

    if (!payload || !payload.bid || !payload.tok) {
      return res.status(400).json({ success: false, message: 'Invalid QR code data' });
    }

    const booking = await Booking.findById(payload.bid)
      .populate('event', 'title date venue organizer')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is organizer or admin
    const event = await Event.findById(booking.event._id);
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only organizers can verify tickets.' });
    }

    // Verify the QR payload
    const verification = verifyQRPayload(payload, booking);
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR verification failed', 
        errors: verification.errors 
      });
    }

    // Check booking status
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'This booking has been cancelled',
        booking: {
          id: booking._id,
          status: booking.status,
        }
      });
    }

    res.json({
      success: true,
      message: 'QR code verified successfully',
      booking: {
        id: booking._id,
        user: booking.user,
        event: booking.event,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        status: booking.status,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/bookings/check-in
 * @desc    Check in attendee using QR code
 * @access  Organizer or Admin
 */
exports.checkIn = async (req, res, next) => {
  try {
    const { payload } = req.body;

    if (!payload || !payload.bid || !payload.tok) {
      return res.status(400).json({ success: false, message: 'Invalid QR code data' });
    }

    const booking = await Booking.findById(payload.bid)
      .populate('event', 'title date venue organizer')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is organizer or admin
    const event = await Event.findById(booking.event._id);
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only organizers can check in attendees.' });
    }

    // Verify the QR payload
    const verification = verifyQRPayload(payload, booking);
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR verification failed', 
        errors: verification.errors 
      });
    }

    // Check booking status
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has been cancelled' });
    }

    // Check event date validity (allow check-in from 24 hours before to 24 hours after event)
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursBefore = 24;
    const hoursAfter = 24;
    const earliestCheckIn = new Date(eventDate.getTime() - hoursBefore * 60 * 60 * 1000);
    const latestCheckIn = new Date(eventDate.getTime() + hoursAfter * 60 * 60 * 1000);
    
    if (now < earliestCheckIn) {
      return res.status(400).json({ 
        success: false, 
        message: `Check-in not yet available. Event starts on ${eventDate.toLocaleDateString()}`,
        eventDate: event.date,
      });
    }
    
    if (now > latestCheckIn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-in period has ended for this event',
        eventDate: event.date,
      });
    }

    // Check if already checked in (PREVENT DUPLICATE USE)
    if (booking.checkedIn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket already used! This attendee has already checked in.',
        checkedInAt: booking.checkedInAt,
        isUsed: true,
      });
    }

    // Perform check-in - Mark ticket as USED
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      booking: {
        id: booking._id,
        user: booking.user,
        event: booking.event,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/bookings/:id/regenerate-qr
 * @desc    Regenerate QR code for a booking
 * @access  Protected - booking owner
 */
exports.regenerateQR = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot regenerate QR for cancelled booking' });
    }

    // Generate new secure token and QR code
    const secureToken = generateSecureToken(booking._id, booking.event, booking.user);
    booking.secureToken = secureToken;
    const qrCode = await generateQRCode(booking);
    booking.qrCode = qrCode;
    await booking.save();

    res.json({
      success: true,
      message: 'QR code regenerated successfully',
      qrCode: booking.qrCode,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/bookings/search/:eventId
 * @desc    Search bookings by partial ID, name, or email for an event
 * @access  Organizer or Admin
 */
exports.searchBookings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { q } = req.query; // search query

    if (!q || q.length < 3) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 3 characters' });
    }

    // Verify event and access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Search by partial booking ID (case-insensitive)
    const searchQuery = q.trim().toLowerCase();
    
    // Get all bookings for this event
    const allBookings = await Booking.find({ event: eventId })
      .populate('user', 'name email')
      .populate('event', 'title date venue');

    // Filter by partial ID, name, or email
    const matchedBookings = allBookings.filter(booking => {
      const bookingId = booking._id.toString().toLowerCase();
      const userName = (booking.user?.name || '').toLowerCase();
      const userEmail = (booking.user?.email || '').toLowerCase();
      
      return bookingId.includes(searchQuery) || 
             bookingId.endsWith(searchQuery) ||
             userName.includes(searchQuery) ||
             userEmail.includes(searchQuery);
    });

    if (matchedBookings.length === 0) {
      return res.status(404).json({ success: false, message: 'No booking found matching this ID' });
    }

    // If exact match or only one result, return it directly
    if (matchedBookings.length === 1) {
      const booking = matchedBookings[0];
      return res.json({
        success: true,
        booking: {
          id: booking._id,
          user: booking.user,
          event: booking.event,
          ticketType: booking.ticketType,
          quantity: booking.quantity,
          status: booking.status,
          checkedIn: booking.checkedIn,
          checkedInAt: booking.checkedInAt,
        },
      });
    }

    // Multiple matches - return list
    res.json({
      success: true,
      multiple: true,
      count: matchedBookings.length,
      bookings: matchedBookings.map(b => ({
        id: b._id,
        user: b.user,
        ticketType: b.ticketType,
        quantity: b.quantity,
        status: b.status,
        checkedIn: b.checkedIn,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/bookings/:id/check-in
 * @desc    Check in attendee by booking ID (for manual entry)
 * @access  Organizer or Admin
 */
exports.checkInById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date venue organizer')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is organizer or admin
    const event = await Event.findById(booking.event._id);
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only organizers can check in attendees.' });
    }

    // Check booking status
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has been cancelled' });
    }

    // Check event date validity
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursBefore = 24;
    const hoursAfter = 24;
    const earliestCheckIn = new Date(eventDate.getTime() - hoursBefore * 60 * 60 * 1000);
    const latestCheckIn = new Date(eventDate.getTime() + hoursAfter * 60 * 60 * 1000);
    
    if (now < earliestCheckIn) {
      return res.status(400).json({ 
        success: false, 
        message: `Check-in not yet available. Event starts on ${eventDate.toLocaleDateString()}`,
      });
    }
    
    if (now > latestCheckIn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-in period has ended for this event',
      });
    }

    // Check if already checked in
    if (booking.checkedIn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket already used! This attendee has already checked in.',
        checkedInAt: booking.checkedInAt,
        isUsed: true,
      });
    }

    // Perform check-in
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      booking: {
        id: booking._id,
        user: booking.user,
        event: booking.event,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/bookings/admin/all
 * @desc    Get all bookings with full details and stats (Admin only)
 * @access  Admin
 */
exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.eventId) query.event = req.query.eventId;

    // Get total count
    const total = await Booking.countDocuments(query);

    // Get bookings with full details
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('event', 'title date venue category organizer')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Calculate stats
    const allBookings = await Booking.find();
    const stats = {
      totalBookings: allBookings.length,
      confirmedBookings: allBookings.filter(b => b.status === 'confirmed').length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
      pendingBookings: allBookings.filter(b => b.status === 'pending').length,
      totalTicketsSold: allBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.quantity, 0),
      totalRevenue: allBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      checkedInCount: allBookings.filter(b => b.checkedIn).length,
    };

    res.json({
      success: true,
      data: bookings,
      stats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/bookings/admin/stats
 * @desc    Get booking statistics by event (Admin only)
 * @access  Admin
 */
exports.getBookingStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // Aggregate stats by event
    const eventStats = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$event',
          totalTickets: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
          checkedInCount: { $sum: { $cond: ['$checkedIn', 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails',
        },
      },
      { $unwind: '$eventDetails' },
      {
        $project: {
          eventId: '$_id',
          eventTitle: '$eventDetails.title',
          eventDate: '$eventDetails.date',
          totalTickets: 1,
          totalRevenue: 1,
          bookingCount: 1,
          checkedInCount: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Overall stats
    const overallStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          tickets: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.json({
      success: true,
      eventStats,
      overallStats,
    });
  } catch (err) {
    next(err);
  }
};
