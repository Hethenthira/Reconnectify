// routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authMiddleware, authorize } = require('../middleware/auth');

// ─── Post Job/Opportunity (Alumni or Admin only) ──────────────────────────────
router.post('/', authMiddleware, authorize('alumni', 'admin'), async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user.id
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get all Jobs (any logged-in user) ───────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get single job ───────────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Apply for Job (Students only) ───────────────────────────────────────────
router.post('/:id/apply', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = job.applicants.some(
      app => app.user.toString() === req.user.id
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    job.applicants.push({ user: req.user.id });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete Job (poster or admin) ────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isOwner = job.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;