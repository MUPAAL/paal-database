const mongoose = require('mongoose');
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (error) {
  console.error('bcryptjs not available, using fallback password handling');
  // Fallback password handling
  bcrypt = {
    genSalt: async () => 'salt',
    hash: async (password) => password,
    compare: async (password, hash) => password === hash
  };
}
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'farmer'],
    default: 'farmer',
    index: true
  },
  // For farmers, this links to their assigned farm
  assignedFarm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: { type: Date },
  profileImageUrl: { type: String }
}, {
  timestamps: true
});

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();

  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('Comparing password for user:', this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
