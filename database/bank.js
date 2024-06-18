const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: false,
  },
  agentId: {
    type: String,
    required: true,
  },
  accountNo: {
    type: String,
    required: true,
    unique:true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  holderName: {
    type: String,
    required: true,
  },
  contact_id:{
    type:String
  },
  fund_id:{
    type:String,
  }
});

module.exports = mongoose.model("Bank", bankSchema);
