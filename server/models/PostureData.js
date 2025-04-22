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
}, {
  // This ensures that when documents are retrieved, they include virtuals
  // and are transformed to plain objects with proper date handling
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// Add a virtual property for formatted date
PigPostureSchema.virtual('formattedDate').get(function() {
  return this.timestamp ? this.timestamp.toISOString().split('T')[0] : '';
});

PigPostureSchema.index({ pigId: 1 });

module.exports = mongoose.model('PigPosture', PigPostureSchema);
