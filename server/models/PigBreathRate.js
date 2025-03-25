const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigBreathRateSchema = new Schema({
  pigId: { type: Number, ref: 'Pig', required: true },
  timestamp: { type: Date, default: Date.now },
  rate: { type: Number, required: true }
});

module.exports = mongoose.model('PigBreathRate', PigBreathRateSchema);
