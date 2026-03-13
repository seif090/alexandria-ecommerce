const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Notification Model
const notificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String, // deal_alert, order_update, system, promotion
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  isPushed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: Date
});

// User Notification Preferences
const preferenceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  dealCategories: [String],
  enableEmailNotifications: { type: Boolean, default: true },
  enablePushNotifications: { type: Boolean, default: true },
  enableSmsNotifications: { type: Boolean, default: false },
  quietHours: {
    enabled: Boolean,
    start: String, // "22:00"
    end: String    // "08:00"
  },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
const NotificationPreference = mongoose.model('NotificationPreference', preferenceSchema);

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: 'No auth token' });
  req.userId = token;
  next();
};

// Subscribe to deal notifications
router.post('/subscribe-deals', authMiddleware, async (req, res) => {
  try {
    const { categories } = req.body;
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: req.userId },
      { dealCategories: categories },
      { upsert: true, new: true }
    );
    res.json({ success: true, preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subscribe to order notifications
router.post('/subscribe-order/:orderId', authMiddleware, async (req, res) => {
  try {
    // Store subscription for this specific order
    res.json({ success: true, orderId: req.params.orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await Notification
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.post('/mark-read/:notificationId', authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notificationId, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      isRead: false
    });
    res.json(count);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:notificationId', authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const preferences = await NotificationPreference.findOne({ userId: req.userId });
    res.json(preferences || { dealCategories: [], enableEmailNotifications: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update preferences
router.post('/preferences', authMiddleware, async (req, res) => {
  try {
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { upsert: true, new: true }
    );
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification (internal use)
router.post('/create', async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await notification.save();
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
