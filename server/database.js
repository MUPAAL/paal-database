// db.js or database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
    
    // Require all models after connection is established
    require('./models/Pig');
    require('./models/PigBCS');
    require('./models/PostureData');
    require('./models/PigFertility');
    require('./models/PigHeatStatus');
    require('./models/PigHealthStatus');
    require('./models/PigVulvaSwelling');
    require('./models/PigBreathRate');
    require('./models/Device'); 
    require('./models/TemperatureData'); 
    require('./models/Farm');
    require('./models/Barn');
    require('./models/Stall');
    
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;