const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketType: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    paymentMethod: { type: String },
    qrCode: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1 });
bookingSchema.index({ event: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
