// models/PigHealthStatus.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigHealthStatusSchema = new Schema({
  pigId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Pig', 
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
  }
}, { timestamps: true });

// Compound index for efficient queries
PigHealthStatusSchema.index({ pigId: 1, timestamp: -1 });

module.exports = mongoose.model('PigHealthStatus', PigHealthStatusSchema);