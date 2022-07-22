const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {

    Genre.find({})
        .sort({'name':1})
        .exec(function (err, list_genres) {
            if (err) return next(err);
            res.render('genre_list', {title: 'Genre List', list_genres: list_genres});
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: (callback) => { Genre.findById(req.params.id).exec(callback);},
        genreBooks: (callback) => { Book.find({'genre': req.params.id}).exec(callback);}
        },

        function (err, results) {
            if (err) return next(err);
            if (results.genre == null) { // No results?
                const err = new Error('Genre not found')
                err.status = 404
                return next(err)
            }
            // On success
        res.render('genre_detail', {
            title: 'Genre Detail',
            genre: results.genre,
            genreBooks: results.genreBooks})
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and Sanitize the name field
    body('name', 'Genre name required').trim().isLength({min: 1}). escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data.
        const genre = new Genre({ name: req.body.name });
        // If errors exists return the errors in the form
        if (!errors.isEmpty()) {
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        }
        else {
            // Data is valid
            // Validate if the genre with the same name already exists.
            Genre.findOne({'name': { $regex: req.body.name, $options: 'i'}})
                .exec( (err, genre_found) => {
                    if (err) return next(err);
                    if (genre_found) {
                        res.redirect(genre_found.url);
                    } else {
                        // genre is saved and then redirects to the genre detail page
                        genre.save( (err) => {
                            if (err) return next(err);
                            res.redirect(genre.url);
                      });
                    }
                })
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    // get all info about genres
    async.parallel({
        genre(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        books(callback) {
            Book.find({'genre': req.params.id}).populate('genre').exec(callback);
        }
    },
    (err, results) => {
        if (err) return next(err);
        if (results.books === null) res.redirect('/catalog/genres');
        res.render('genre_delete', {
            title: 'Delete Genre',
            genre: results.genre,
            books: results.books
        });
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    // Get all genre and books info
    async.parallel({
        genre(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        books(callback) {
            Book.find({'genre': req.params.id}).populate('genre').exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.genre === null) res.redirect('/catalog/genres');
        if (results.books.length > 0) {
            res.render('genre_delete', {
                title: 'Delete Genre',
                genre: results.genre,
                books: results.books });
            return
        }
        else {
            Genre.findByIdAndRemove(req.body.genreId, (err) => {
                if (err) return next(err);
                res.redirect('/catalog/genre')
            })
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    async.parallel({
        genre(callback) {
            Genre.findById(req.params.id).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.genre == null) {
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // On success return the form to update the genre
        res.render('genre_form', {
            title: 'Update Genre', 
            genre: results.genre
        });
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    // Validate and sanitize field name
    body('name', 'Name field must not be empty').trim().isLength({min: 1}).escape(),
    // Process request after sanitization
    (req, res, next) => {
        
        const errors = validationResult(req);
        const genre = new Genre({
            name: req.body.name,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            async.parallel({
                genre(callback) {
                    Genre.findById(req.params.id).exec(callback);
                }
            }, (err, results) => {
                if (err) return next(err);
                res.render('genre_form', {
                    title: 'Update Genre',
                    genre: results.genre,
                    errors: errors.array()
                });
            });
            return
        }
        else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, theGenre) => {
                if (err) return next(err);
                res.redirect(theGenre.url);
            });
        }
    }
];