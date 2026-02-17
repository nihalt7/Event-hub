const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0 },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
    },
    category: {
      type: String,
      required: true,
      enum: ['conference', 'workshop', 'concert', 'meetup', 'sports', 'webinar', 'festival', 'other'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date'],
    },
    endDate: { type: Date },
    venue: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineLink: { type: String },
    ticketTypes: [ticketTypeSchema],
    capacity: {
      type: Number,
      min: 0,
    },
    images: [{ type: String }],
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', category: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
