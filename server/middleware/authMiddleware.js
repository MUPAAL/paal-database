const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID or email
    const user = await User.findOne({ $or: [{ _id: decoded.id }, { email: decoded.email }] });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Add user and token to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      assignedFarm: user.assignedFarm
    };

    // Store the token for potential reuse
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized as admin' });
  }

  next();
};

// Check if user is farmer
const isFarmer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Not authorized as farmer' });
  }

  next();
};

module.exports = {
  authenticateJWT,
  isAdmin,
  isFarmer
};
