const mongoose = require('mongoose');
const { Schema } = mongoose;

const BarnSchema = new Schema({
  name: { type: String, required: true },
  farmId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Farm', 
    required: true,
    index: true 
  }
}, { timestamps: true });


module.exports = mongoose.model('Barn', BarnSchema);
