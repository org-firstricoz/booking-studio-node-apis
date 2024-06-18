const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    // id:{type:String},
    agentId:{type:String,required:true},
    subject: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
    status: { type: String, enums: ['solved', 'unsolved', 'pending'], default: 'pending' },
})
const issue = mongoose.model("Issues", issueSchema)
module.exports = issue;