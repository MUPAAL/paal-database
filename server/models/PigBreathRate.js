const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigBreathRateSchema = new Schema({
  pigId: { type: Number, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  rate: { type: Number, required: true }
});

PigBreathRateSchema.index({ pigId: 1 });

module.exports = mongoose.model('PigBreathRate', PigBreathRateSchema);
