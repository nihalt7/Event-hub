const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for booking
 */
exports.createOrder = async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env',
      });
    }
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
    const amount = ticketType.price * quantity;
    // Razorpay amount is in paise (1 INR = 100 paise); minimum 100 paise (1 INR)
    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payment amount is ₹1. Please add a paid ticket or increase quantity.',
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bk_${String(eventId).slice(-12)}_${Date.now().toString().slice(-8)}`,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    // Razorpay SDK throws plain object { statusCode, error } on API failure
    if (err.statusCode != null && err.error != null) {
      const msg =
        (err.error && (err.error.description || err.error.reason)) ||
        (typeof err.error === 'string' ? err.error : null) ||
        err.message ||
        'Payment gateway error. Please check your Razorpay keys and try again.';
      const code = err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 502;
      return res.status(code).json({ success: false, message: msg });
    }
    next(err);
  }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment and create booking
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, eventId, ticketTypeName, quantity } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !eventId || !ticketTypeName || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
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
      paymentId: razorpay_payment_id,
      paymentMethod: 'razorpay',
    });

    ticketType.sold = (ticketType.sold || 0) + quantity;
    event.attendees.addToSet(req.user.id);
    await event.save();

    const populated = await Booking.findById(booking._id)
      .populate('event', 'title date venue')
      .populate('user', 'name email');

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    // Razorpay SDK or API errors
    if (err.statusCode != null && err.error != null) {
      const msg =
        (err.error && (err.error.description || err.error.reason)) ||
        (typeof err.error === 'string' ? err.error : null) ||
        err.message ||
        'Payment verification failed. Please try again.';
      const code = err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 502;
      return res.status(code).json({ success: false, message: msg });
    }
    next(err);
  }
};
