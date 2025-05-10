const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      assignedFarm: user.assignedFarm
    };

    // Update last login time
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
