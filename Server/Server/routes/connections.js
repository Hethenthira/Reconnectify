// routes/connections.js
const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const { authMiddleware } = require('../middleware/auth');

// ─── Send Connection Request ──────────────────────────────────────────────────
router.post('/request/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (req.user.id === targetUserId) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: targetUserId },
        { requester: targetUserId, recipient: req.user.id }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: 'Connection already exists or pending' });
    }

    const connection = new Connection({ requester: req.user.id, recipient: targetUserId });
    await connection.save();
    res.json(connection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get My Connections (accepted) ───────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: 'accepted'
    }).populate('requester recipient', 'name role department company position');

    // Return the OTHER person in each connection
    const friends = connections.map(c =>
      c.requester._id.toString() === req.user.id ? c.recipient : c.requester
    );
    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Pending Requests ─────────────────────────────────────────────────────
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user.id,
      status: 'pending'
    }).populate('requester', 'name role department');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Accept or Reject a Request ──────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Request not found' });

    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    connection.status = status;
    await connection.save();
    res.json(connection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to routes/connections.js (before module.exports)
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const requests = await Connection.find({
      requester: req.user.id,
      status: 'pending'
    }).populate('recipient', 'name role department');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;