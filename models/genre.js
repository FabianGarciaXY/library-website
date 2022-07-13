const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Schema
const Genre = new Schema({
    name: {type: String, required: true, minLength:3, maxLength: 100},
});

// Virtual
Genre
    .virtual('url')
    .get( function() {
        return '/catalog/genres/' + this._id;
});


// Export model
module.exports = mongoose.model('Genre', Genre);