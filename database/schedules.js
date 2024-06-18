const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  agentId:{
    type:String,
    required:true
  },
  studioId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: { type: String, default: "pending" }
});

const Schedule = mongoose.model('Schedules', scheduleSchema);

module.exports = Schedule;
