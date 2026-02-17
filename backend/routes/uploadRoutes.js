const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const path = require('path');

/**
 * @route   POST /api/upload/image
 * @access  Protected (organizer/admin)
 * Upload single image
 */
router.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Return the file URL (in production, this would be a cloud storage URL)
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

/**
 * @route   POST /api/upload/images
 * @access  Protected (organizer/admin)
 * Upload multiple images
 */
router.post('/images', protect, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({ success: true, urls, files: req.files.map((f) => ({ filename: f.filename, url: `/uploads/${f.filename}` })) });
});

module.exports = router;
