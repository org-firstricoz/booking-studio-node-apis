const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
// Define schema
const agentDetailsSchema = new mongoose.Schema({
  photoUrl: {
    type: Buffer,

  },
  agentId: {
    type: String,
    default: uuidv4,
    index: { unique: true }
  },
  name: {
    type: String,
    required: true,
  },
  number: { type: String, unique: true, length: 10, required: true, },
  description: {
    type: String,
    required: true,
  },
  media: {
    type: [Buffer],
    default: [],
  },
  qrData: {
    type: String,
    required: true,

  },
  email: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    default: "owner"
  },
  businessName: { type: String },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  services: {
    type: [String],
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },

  documentFront: { type: Buffer }, // Assuming image URLs are stored as strings
  documentBack: { type: Buffer }, // Assuming image URLs are stored as strings
  isVerified: { type: String, default: 'pending' },
  studioIds: { type: [String], default: [] },
  amount:{type:Number,default:0},
  contact_id:{type:String,}
});

// Create model
const AgentDetails = mongoose.model('Agent', agentDetailsSchema);

module.exports = AgentDetails;
