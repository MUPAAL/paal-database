const mongoose = require('mongoose');
const { Schema } = mongoose;

const FarmSchema = new Schema({
  name: { type: String, required: true, index: true },
  location: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Farm', FarmSchema);