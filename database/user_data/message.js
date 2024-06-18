const mongoose = require('mongoose');
const{v4: uuidv4 }= require('uuid');
// Define schema
const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  isMe: {
    type: Boolean,
    required: true
  },
  agentID: {
    type: String,
    ref:'Agent',
    required: true
  },
  uuid: {
    type: String,
    ref:'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  }
});

// Create model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
