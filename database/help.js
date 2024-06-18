const mongoose = require('mongoose');


const help = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

help.index({title:'text',description:'text'}) 
const Help = mongoose.model('help', help);

module.exports = Help;
