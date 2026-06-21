const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    default: 'student'
  },
  department: String,
  graduationYear: String,
  company: String,
  position: String,
  bio: String,
  linkedin: String, // LinkedIn profile URL
  github: String,   // GitHub profile URL
  phone: String,
  profilePicture: String,
  skills: [String], // Array of skills for mentorship matching
  isApproved: { type: Boolean, default: true }, // For admin approval if needed
  isAdmin: { type: Boolean, default: false }, // Added to match server.js
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
