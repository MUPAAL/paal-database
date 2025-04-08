const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

// Auth middleware
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all routes
router.use(limiter);

// Get all users (admin only)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-__v')
      .populate('assignedFarm', 'name location')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get current user
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v')
      .populate('assignedFarm', 'name location');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// Get single user by ID (admin only)
router.get('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-__v')
      .populate('assignedFarm', 'name location');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, assignedFarm } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate farm ID if provided
    if (assignedFarm) {
      if (!mongoose.Types.ObjectId.isValid(assignedFarm)) {
        return res.status(400).json({ error: 'Invalid farm ID' });
      }

      const farm = await Farm.findById(assignedFarm);
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }
    }

    const newUser = await User.create({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      role: role || 'farmer',
      assignedFarm: assignedFarm || null
    });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only, or user updating their own profile)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, assignedFarm, isActive, password } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only admins can update role, assignedFarm, and isActive
    if ((role || assignedFarm !== undefined || isActive !== undefined) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update these fields' });
    }

    // Users can only update their own profile unless they're an admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    // Validate farm ID if provided
    if (assignedFarm) {
      if (!mongoose.Types.ObjectId.isValid(assignedFarm)) {
        return res.status(400).json({ error: 'Invalid farm ID' });
      }

      const farm = await Farm.findById(assignedFarm);
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }
    }

    // Update user
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) updateData.password = password; // Will be hashed by pre-save hook
    if (role && req.user.role === 'admin') updateData.role = role;
    if (assignedFarm !== undefined && req.user.role === 'admin') {
      updateData.assignedFarm = assignedFarm || null;
    }
    if (isActive !== undefined && req.user.role === 'admin') {
      updateData.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('assignedFarm', 'name location');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
