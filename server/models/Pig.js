// models/Pig.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigSchema = new Schema({
  pigId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  tag: { type: String, required: true, unique: true },
  breed: { type: String },
  age: { type: Number, min: 0 },
  currentLocation: {
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    barnId: { type: Schema.Types.ObjectId, ref: 'Barn', required: true },
    stallId: { type: Schema.Types.ObjectId, ref: 'Stall', required: true }
  },
  active: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for latest health status
PigSchema.virtual('healthStatus', {
  ref: 'PigHealthStatus',
  localField: '_id',
  foreignField: 'pigId',
  justOne: true,
  options: { sort: { timestamp: -1 }, limit: 1 }
});

module.exports = mongoose.model('Pig', PigSchema);