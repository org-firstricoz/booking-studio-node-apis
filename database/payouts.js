const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const payoutSchema = new Schema({
 
  id: { type: String, required: true, unique: true },
  entity: { type: String, required: true },
  fund_account_id: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  notes: {
    notes_key_1: { type: String },
    notes_key_2: { type: String }
  },
  fees: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  status: { type: String, required: true },
  utr: { type: String, default: null },
  mode: { type: String, required: true },
  purpose: { type: String, required: true },
  reference_id: { type: String, required: true },
  narration: { type: String, required: true },
  batch_id: { type: String, default: null },
  status_details: {
    description: { type: String, },
    source: { type: String, },
    reason: { type: String, }
  },
  created_at: { type: Number, required: true }
}, { timestamps: true });
const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout