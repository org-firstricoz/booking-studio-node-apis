const mongoose = require('mongoose');
const {v4:uuidv4} = require('uuid');
// Define schema
const citySchema = new mongoose.Schema({
  uid: {
    type: String,
    default:uuidv4,
    index: { unique: true }
  },
  name: {
    type: String,
    required: true
  }
});

// Create model
const City = mongoose.model('City', citySchema);

module.exports = City;
