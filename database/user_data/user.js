const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    index: { unique: true }
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  gender: String,
  phoneNumber: String,
  photoUrl: {
    type: Buffer,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    required: true
  }
});
const User = mongoose.model('User', userSchema);
module.exports = User;
