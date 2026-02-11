const User = require('../models/User');

/**
 * @route   GET /api/users
 * @access  Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? { name: new RegExp(req.query.search, 'i') } : {};
    const total = await User.countDocuments(search);
    const users = await User.find(search).select('-password').skip(skip).limit(limit).sort('-createdAt');
    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/:id
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'profile'];
    if (req.user.role === 'admin') allowed.push('role', 'isActive');
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowed.includes(key)) updates[key] = req.body[key];
    });
    if (req.body.password) {
      updates.password = req.body.password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @access  Admin or self
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (err) {
    next(err);
  }
};
