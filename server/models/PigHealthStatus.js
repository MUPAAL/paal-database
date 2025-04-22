// models/PigHealthStatus.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigHealthStatusSchema = new Schema({
  pigId: {
    type: Number,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['at risk', 'healthy', 'critical', 'no movement'],
    required: true,
    index: true
  },
  notes: {
    type: String,
    default: ''
  },
  metrics: {
    temperature: { type: Number },
    respiratoryRate: { type: Number },
    weight: { type: Number },
    // Add other metrics as needed
  }
}, { timestamps: true });

// Compound index for efficient queries
PigHealthStatusSchema.index({ pigId: 1, timestamp: -1 });

module.exports = mongoose.model('PigHealthStatus', PigHealthStatusSchema);