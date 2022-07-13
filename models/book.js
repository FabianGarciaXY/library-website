const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Book Schema
const BookSchema = new Schema({
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author'},
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
});

// Virtual book URL
BookSchema
    .virtual('url')
    .get( function() {
        return '/catalog/book/' + this._id;
});


// Exporting the model
module.exports = mongoose.model('Book', BookSchema);