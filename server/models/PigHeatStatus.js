const mongoose = require('mongoose');
const { Schema } = mongoose;

const PigHeatStatusSchema = new Schema({
  pigId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['open', 'bred', 'pregnant', 'farrowing', 'weaning'], 
    required: true 
  }
});

PigHeatStatusSchema.index({ pigId: 1 }); 

module.exports = mongoose.model('PigHeatStatus', PigHeatStatusSchema);
