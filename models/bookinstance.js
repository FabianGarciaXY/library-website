const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// BookInstance Schema
const BookInstanceSchema = new Schema({
    book: {type: String, required:true},
    imprint: {type: String, required:true},
    status: {type: String, required: true, 
        enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'
        },  
    due_back: {type: Date, default: Date.now},
});

// Virtual for book instance URL.
BookInstanceSchema
    .virtual('url')
    .get( function() {
        return '/catalog/bookinstance/' + this._id;
});


// Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);