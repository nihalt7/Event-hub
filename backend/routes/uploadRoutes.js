const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Determine if Cloudinary is properly configured
const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

/**
 * Upload a single file from disk to Cloudinary and return the result.
 */
const uploadToCloudinary = (filePath) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'event-hub/events',
        resource_type: 'image',
      },
      (error, result) => {
        // Best‑effort cleanup of the local file
        fs.unlink(filePath, () => {});
        if (error) return reject(error);
        resolve(result);
      }
    );
  });

/**
 * @route   POST /api/upload/image
 * @access  Protected (organizer/admin)
 * Upload single image (Cloudinary in production, local disk fallback)
 */
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // If Cloudinary is not configured, fall back to local /uploads URL (useful in local dev)
    if (!isCloudinaryConfigured) {
      return res.json({
        success: true,
        url: `/uploads/${req.file.filename}`,
      });
    }

    const result = await uploadToCloudinary(req.file.path);

    return res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   POST /api/upload/images
 * @access  Protected (organizer/admin)
 * Upload multiple images (Cloudinary in production, local disk fallback)
 */
router.post('/images', protect, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // If Cloudinary is not configured, fall back to local /uploads URLs
    if (!isCloudinaryConfigured) {
      const urls = req.files.map((file) => `/uploads/${file.filename}`);
      return res.json({
        success: true,
        urls,
        files: req.files.map((file) => ({
          url: `/uploads/${file.filename}`,
        })),
      });
    }

    const uploads = await Promise.all(req.files.map((file) => uploadToCloudinary(file.path)));

    const urls = uploads.map((u) => u.secure_url);

    return res.json({
      success: true,
      urls,
      files: uploads.map((u) => ({
        public_id: u.public_id,
        url: u.secure_url,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
