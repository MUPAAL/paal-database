// models/ActivityLog.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivityLogSchema = new Schema({
  // Type of activity (user, farm, system, pig, device, etc.)
  type: {
    type: String,
    enum: ['user', 'farm', 'system', 'pig', 'device', 'barn', 'stall'],
    required: true,
    index: true
  },
  
  // Action performed (created, updated, deleted, logged in, etc.)
  action: {
    type: String,
    required: true,
    index: true
  },
  
  // Description of the activity
  description: {
    type: String,
    required: true
  },
  
  // User who performed the action (if applicable)
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Related entity ID (if applicable)
  entityId: {
    type: Schema.Types.Mixed,
    index: true
  },
  
  // Additional metadata about the activity
  metadata: {
    type: Schema.Types.Mixed
  },
  
  // IP address of the user (if applicable)
  ipAddress: {
    type: String
  }
}, { 
  timestamps: true 
});

// Create compound indexes for efficient querying
ActivityLogSchema.index({ type: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
