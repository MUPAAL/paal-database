const mongoose = require('mongoose');
const { Schema } = mongoose;

const StallSchema = new Schema({
  name: { type: String, required: true },
  barnId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Barn', 
    required: true,
    index: true 
  },
  farmId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Farm', 
    required: true,
    index: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Stall', StallSchema);
