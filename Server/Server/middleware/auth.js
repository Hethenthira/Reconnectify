// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '54a2dced844b8176b0e18f571123f72454242d4cb4ad0b17dfbf12d48a21503bbb29c4a2344517578660507855a06b8389ff2ba5d098790d524df6f07a9adf5f';

// ─── Verify JWT and attach user to req ───────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

// ─── authorize(...roles) — role-based access guard ───────────────────────────
// Usage:  authorize('admin')
//         authorize('alumni', 'admin')
//         authorize('student')
// Always call authMiddleware BEFORE this in the route.
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// ─── Shorthand guards (convenience wrappers) ─────────────────────────────────
const adminMiddleware   = authorize('admin');
const alumniMiddleware  = authorize('alumni', 'admin');
const studentMiddleware = authorize('student');

module.exports = {
  authMiddleware,
  authorize,
  adminMiddleware,
  alumniMiddleware,
  studentMiddleware
};