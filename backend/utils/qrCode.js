const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a secure token for the booking
 * @param {string} bookingId - The booking ID
 * @param {string} eventId - The event ID
 * @param {string} userId - The user ID
 * @returns {string} - Secure hash token
 */
const generateSecureToken = (bookingId, eventId, userId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const data = `${bookingId}-${eventId}-${userId}-${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 16);
};

/**
 * Generate QR code payload (minimal data)
 * @param {Object} booking - The booking document
 * @returns {Object} - QR payload object
 */
const generateQRPayload = (booking) => {
  return {
    bid: booking._id.toString(), // Booking ID
    eid: booking.event.toString(), // Event ID
    uid: booking.user.toString(), // User ID
    tok: booking.secureToken, // Secure token for verification
  };
};

/**
 * Generate QR code as Data URL
 * @param {Object} booking - The booking document with secureToken
 * @returns {Promise<string>} - QR code as base64 data URL
 */
const generateQRCode = async (booking) => {
  const payload = generateQRPayload(booking);
  const payloadString = JSON.stringify(payload);

  const options = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 2,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  try {
    const qrDataUrl = await QRCode.toDataURL(payloadString, options);
    return qrDataUrl;
  } catch (err) {
    console.error('QR Code generation error:', err);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify QR code payload
 * @param {Object} payload - The scanned QR payload
 * @param {Object} booking - The booking from database
 * @returns {Object} - Verification result
 */
const verifyQRPayload = (payload, booking) => {
  const errors = [];

  if (payload.bid !== booking._id.toString()) {
    errors.push('Booking ID mismatch');
  }

  if (payload.eid !== booking.event.toString()) {
    errors.push('Event ID mismatch');
  }

  if (payload.tok !== booking.secureToken) {
    errors.push('Invalid security token');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  generateSecureToken,
  generateQRCode,
  generateQRPayload,
  verifyQRPayload,
};
