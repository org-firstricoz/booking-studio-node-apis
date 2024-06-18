const mongoose = require('mongoose')

const searchSchema =new mongoose.Schema({
    uuid: {
        type: String
        , ref: 'User'

    }, search: {
        type: [String],
        required: false
    }
})

const Search = mongoose.model('Search',searchSchema)

module.exports = Search