const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    uuid: {
        type: String,
        ref: 'User'
    }
    ,
    studio_id: {
        type: String,
        ref: 'Studio'
    }
})

const Favourites = mongoose.model('Favourite', favouriteSchema)

module.exports = Favourites;