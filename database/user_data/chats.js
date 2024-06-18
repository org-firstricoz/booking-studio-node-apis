
const mongoose = require('mongoose');
const { CHAR } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
// Define schema
const chatSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        index: { unique: true }
    },
    agent_id: {
        type: String,
        ref: 'Agent',
        required: true
    },
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },
    unread: {
        type: Number,
        default: 0
    },
    time: {
        type: Date
        , default: Date.now()
    }
});

// Create model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
