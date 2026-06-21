// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Event = require('../models/Event');
const { authMiddleware, authorize } = require('../middleware/auth');

// ─── Get System Stats (Admin only) ───────────────────────────────────────────
router.get('/stats', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const [users, posts, jobs, events] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Job.countDocuments(),
      Event.countDocuments()
    ]);
    res.json({ users, posts, jobs, events });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Approve User (Admin only) ────────────────────────────────────────────────
router.put('/users/:id/approve', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isApproved = true;
    await user.save();
    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete Content (Admin only) ─────────────────────────────────────────────
router.delete('/content/:type/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { type, id } = req.params;
    const models = { post: Post, job: Job, event: Event };
    const Model = models[type];

    if (!Model) {
      return res.status(400).json({ message: `Unknown content type: ${type}` });
    }

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Content not found' });

    res.json({ message: `${type} deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get all users with filters (Admin only) ─────────────────────────────────
router.get('/users', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { role, department, name } = req.query;
    let query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (name) query.name = { $regex: name, $options: 'i' };

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;