const mongoose = require('mongoose');
const { Schema } = mongoose;

const FarmSchema = new Schema({
  name: { type: String, required: true, index: true },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Farm', FarmSchema);