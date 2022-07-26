const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Schema = mongoose.Schema;

// BookInstance Schema
const BookInstanceSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true},
    imprint: { type: String, required: true },
    status: { type: String, required: true,
        enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'
        },  
    due_back: { type: Date, default: Date.now },
});

// Virtual for book instance URL.
BookInstanceSchema
    .virtual('url')
    .get( function() {
        return '/catalog/bookinstance/' + this._id;
});

// Virtual for due date
BookInstanceSchema
    .virtual('due_back_formatted')
    .get( function() {
        return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

// Virtual for due date in forma yyyy-dd-mm
BookInstanceSchema
    .virtual('due_back_formatted_yyyy_dd_mm')
    .get( function() {
        return this.due_back ? this.due_back.toISOString().substring(0, 10) : '';
});

// Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);