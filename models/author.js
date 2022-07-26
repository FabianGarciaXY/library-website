const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  });

// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function () {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case
    let fullname = '';
    if (this.first_name && this.family_name) {
        fullname = this.family_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.family_name) {
        fullname = '';
    }
    return fullname;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
    let lifetime_string = '';
    if (this.date_of_birth) {
        lifetime_string = this.date_of_birth.getYear().toString();
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
        lifetime_string += this.date_of_death.getYear()
    }
    return lifetime_string;
});

// Virtual for author date of birth formatted
AuthorSchema
    .virtual('date_of_birth_formatted')
    .get( function() {
        return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
    })

// Virtual for author date of dead formatted
AuthorSchema
    .virtual('date_of_dead_formatted')
    .get( function() {
        return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
})

// Virtual for date of birth in format yyyy-dd-mm to fill in form
AuthorSchema
    .virtual('date_of_birth_yyyy_dd_mm')
    .get( function() {
        return this.date_of_birth ? this.date_of_birth.toISOString().substring(0, 10) : '';
});

// Virtual for date of death in format yyyy-dd-mm to fill in form
AuthorSchema
    .virtual('date_of_death_yyyy_dd_mm')
    .get( function() {
        return this.date_of_death ? this.date_of_death.toISOString().substring(0, 10) : '';
});

// Virtual for author's URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
});


//Export model
module.exports = mongoose.model('Author', AuthorSchema);