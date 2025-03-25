// const mongoose = require('mongoose')

// const schema = new mongoose.Schema({
//   recordId: { type: Number, required: true, unique: true, auto: true },
//   pigId: { type: Number, required: true },
//   posture: { type: Number, required: true },
//   timestamp: { type: Date, default: Date.now }
// })

// module.exports = mongoose.model('PostureData', schema)

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigPostureSchema = new Schema({
  pigId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  score: { type: Number, min: 0, max: 5, required: true }
});

PigPostureSchema.index({ pigId: 1 });

module.exports = mongoose.model('PigPosture', PigPostureSchema);
