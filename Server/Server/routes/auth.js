// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = '54a2dced844b8176b0e18f571123f72454242d4cb4ad0b17dfbf12d48a21503bbb29c4a2344517578660507855a06b8389ff2ba5d098790d524df6f07a9adf5f';

const DEFAULT_ADMIN_EMAIL = "alumniadmin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@3212";

// ─── REGISTER ───────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, role, department, graduationYear, company, position, phone } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Prevent registering as admin via API
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot register as admin' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department,
      graduationYear,
      company,
      position,
      phone,
      isApproved: true
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        graduationYear: user.graduationYear,
        isApproved: user.isApproved
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });

    // ── Auto-create default admin if not in DB ────────────────────────────
    if (!user && email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      user = await User.create({
        name: 'Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isApproved: true
      });
      console.log('✅ Default admin auto-created');
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Build JWT with id + role so middleware can check both
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ── Role-based response payload ───────────────────────────────────────
    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,            // "student" | "alumni" | "admin"
      department: user.department || null,
      graduationYear: user.graduationYear || null,
      company: user.company || null,
      position: user.position || null,
      isApproved: user.isApproved
    };

    console.log(`✅ Login: ${user.email} [${user.role}]`);

    res.json({ token, user: userPayload });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ─── GET CURRENT USER (token refresh / verify) ───────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
});

module.exports = router;