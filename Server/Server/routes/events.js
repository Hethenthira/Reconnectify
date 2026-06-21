// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authMiddleware, alumniMiddleware } = require('../middleware/auth');

// ─── Create Event (Alumni & Admin only) ──────────────────────────────────────
router.post('/', authMiddleware, alumniMiddleware, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Events (any logged-in user) ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get single event ─────────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Attend Event (any logged-in user) ───────────────────────────────────────
router.post('/:id/attend', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete Event (organizer or admin) ───────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOrganizer = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;