// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ─── GET current user's profile ──────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── UPDATE current user's profile ───────────────────────────────────────────
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body };
    // Strip sensitive/immutable fields
    delete updates.password;
    delete updates.role;
    delete updates.email;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET user directory (all authenticated users can browse) ─────────────────
//     Admins see everyone. Students/Alumni see only approved users.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, department, name } = req.query;
    let query = {};

    // Non-admins only see approved users and cannot see admin accounts
    if (req.user.role !== 'admin') {
      query.isApproved = true;
      query.role = { $ne: 'admin' }; // hide admins from directory
    }

    if (role && role !== 'admin') query.role = role;           // filter by role
    if (department) query.department = department;
    if (name) query.name = { $regex: name, $options: 'i' };

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET specific user by ID ──────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Non-admins cannot view admin profiles
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN: Approve a user ────────────────────────────────────────────────────
router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN: Delete a user ─────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN: Update a user's role ──────────────────────────────────────────────
router.put('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'alumni', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;