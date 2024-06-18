const mongoose = require('mongoose');


const earningSchema = new mongoose.Schema({

   agentId: { type: String, required: true },


});

const Order = mongoose.model('Earnings', earningSchema);

module.exports = Order;
