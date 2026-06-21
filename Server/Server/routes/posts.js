// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/auth');

// ─── Create Post (any logged-in user) ────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      content: req.body.content,
      type: req.body.type || 'update',
      image: req.body.image
    });
    const savedPost = await newPost.save();
    const populated = await Post.findById(savedPost._id)
      .populate('userId', 'name role profilePicture');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Feed ─────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name role profilePicture')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Like / Unlike Post ───────────────────────────────────────────────────────
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.findIndex(id => id.toString() === req.user.id);
    if (idx === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Comment on Post ──────────────────────────────────────────────────────────
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ userId: req.user.id, text: req.body.text });
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('userId', 'name role')
      .populate('comments.userId', 'name');
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete Post (owner or admin) ────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;