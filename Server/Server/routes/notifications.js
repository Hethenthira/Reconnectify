// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// ─── Get My Notifications ─────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Mark as Read ─────────────────────────────────────────────────────────────
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Mark All as Read ─────────────────────────────────────────────────────────
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Create Notification (internal / testing) ────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, message, type, relatedId } = req.body;
    const notification = new Notification({ user: userId, message, type, relatedId });
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;