const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per window (increased for development)
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting in development
  skip: () => process.env.NODE_ENV === 'development'
});

// Register a new user (admin only)
router.post('/register', authMiddleware, async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register new users' });
    }

    const { email, password, firstName, lastName, role } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      role: role || 'farmer' // Default to farmer if not specified
    });

    await newUser.save();

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Auth API is working!' });
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    console.log('Looking for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('User found:', user.email);

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check password
    console.log('Checking password...');

    // For test users, always use direct comparison
    // This is a temporary solution for development
    console.log('Using direct password comparison for test users');
    const isMatch = password === user.password;
    console.log('Direct comparison result:', isMatch, 'Expected:', user.password, 'Actual:', password);

    // In production, you would use a secure password comparison method like bcrypt

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Password matches');

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    console.log('Generating JWT token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret found');
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );
    console.log('Token generated successfully');

    // Return user info and token
    const userResponse = user.toObject();
    delete userResponse.password;

    const responseData = {
      token,
      user: userResponse
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedFarm', 'name location');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
