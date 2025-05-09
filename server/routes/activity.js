// routes/activity.js
const express = require('express');
const router = express.Router();
const { logActivity, getRecentActivities } = require('../services/activityLogger');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get recent activities
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { limit, type, userId } = req.query;
    const options = {
      limit: limit ? parseInt(limit) : 10,
      type,
      userId
    };

    const activities = await getRecentActivities(options);
    res.json(activities);
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// Log a new activity (mostly for testing, normally activities are logged internally)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { type, action, description, entityId, metadata } = req.body;

    if (!type || !action || !description) {
      return res.status(400).json({ error: 'Type, action, and description are required' });
    }

    const activityData = {
      type,
      action,
      description,
      userId: req.user.id,
      entityId,
      metadata,
      ipAddress: req.ip
    };

    const activity = await logActivity(activityData);

    // Emit the activity to all connected clients
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('activity', activity);
      }
    } catch (error) {
      console.warn('Failed to emit activity event:', error.message);
    }

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;
