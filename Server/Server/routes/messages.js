// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

// ─── Send Message ─────────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'recipientId and content are required' });
    }
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Conversation with a specific user ────────────────────────────────────
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;