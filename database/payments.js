const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    paymentId: { type: String, unique: true },
    agentId: { type: String, required: true },
    userId: { type: String, required: true },
    id: { type: String, required: true, },
    entity: { type: String, required: true },
    amount: { type: Number, required: true },
    amount_paid: { type: Number, required: true },
    amount_due: { type: Number, required: true },
    currency: { type: String, required: true, length: 3 },
    receipt: { type: String },
    offer_id: { type: String, unique: false },
    status: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    notes: [String],
    
},{timestamps:true});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
