// services/activityLogger.js
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity
 * @param {Object} activityData - Activity data to log
 * @param {string} activityData.type - Type of activity (user, farm, system, pig, device, etc.)
 * @param {string} activityData.action - Action performed (created, updated, deleted, logged in, etc.)
 * @param {string} activityData.description - Description of the activity
 * @param {string} [activityData.userId] - User ID who performed the action (if applicable)
 * @param {string|number} [activityData.entityId] - Related entity ID (if applicable)
 * @param {Object} [activityData.metadata] - Additional metadata about the activity
 * @param {string} [activityData.ipAddress] - IP address of the user (if applicable)
 * @returns {Promise<Object>} - Created activity log
 */
const logActivity = async (activityData) => {
  try {
    const activityLog = new ActivityLog(activityData);
    await activityLog.save();
    return activityLog;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Still return something even if logging fails
    return { error: 'Failed to log activity', details: error.message };
  }
};

/**
 * Get recent activities
 * @param {Object} options - Query options
 * @param {number} [options.limit=10] - Number of activities to return
 * @param {string} [options.type] - Filter by activity type
 * @param {string} [options.userId] - Filter by user ID
 * @returns {Promise<Array>} - Array of activity logs
 */
const getRecentActivities = async (options = {}) => {
  const { limit = 10, type, userId } = options;
  
  try {
    const query = {};
    
    if (type) query.type = type;
    if (userId) query.userId = userId;
    
    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .lean();
    
    return activities;
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
};

module.exports = {
  logActivity,
  getRecentActivities
};
