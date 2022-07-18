const async = require('async');
const { body, validationResult } = require('express-validator');

// Models
const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const Author = require('../models/author');
const Genre = require('../models/genre');


exports.index = function(req, res) {
    // Database queries
    async.parallel({
        book_count: (callback) => {
            Book.countDocuments({}, callback)
        },
        book_instance_count: (callback) => {
            BookInstance.countDocuments({}, callback)
        },
        book_instance_available_count: (callback) => {
            BookInstance.countDocuments({status: 'Available'}, callback)
        },
        author_count: (callback) => {
            Author.countDocuments({}, callback)
        },
        genre_count: (callback) => {
            Genre.countDocuments({}, callback)
        }
    }, (err, results) => {
        res.render('index', {title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books.
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
        .sort({title: 1})
        .populate('author')
        .exec( (err, list_books) => {
            // On Error
            if (err) return next(err);
            // On Successful Response
            res.render('book_list', {title: 'Book List', list_books: list_books})
        });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {

    async.parallel({
        book: (callback) => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        bookInstance: (callback) => {
            BookInstance.find( {'book': req.params.id} )
                .exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.book == null) {
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // On success
        res.render('book_detail', {
            title: results.book.title,
            book: results.book,
            bookInstance: results.bookInstance
        });
    })
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors(callback) {
            Author.find(callback);
        },
        genres(callback) {
            Genre.find(callback);
        }
    }, (err, results) => {
            if (err) return next(err);
            res.render('book_form', {
                title: 'Create Book',
                authors: results.authors,
                genres: results.genres });
    });
};

// Handle book create on POST.
exports.book_create_post = [

    (req, res , next) => {
        // Convert the genre to an array.
        if (!(Array.isArray(req.body.genre)) ) {
            if ( typeof req.body.genre === 'undefined') {
                req.body.genre = [];
            }
            else {
                req.body.genre = [req.body.genre];
            }
        }
        next();
    },

    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    //  Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req)
        // Create a Book object with escaped and trimmed data.
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        // There are errors. Render form again with sanitized values/error messages.
        if (!errors.isEmpty()) {
            // Get all authors and genres for form.
            async.parallel({
                authors(callback) {
                    Author.find(callback);
                },
                genres(callback) {
                    Genre.find(callback);
                },
            }, (err, results) => {
                if (err) return next(err);
                for (let i=0; i < results.genres.length; i++) {
                    if(book.genre.indexOf(results.genres[i]) > -1   ){
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Create Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: book,
                    errors: errors.array()
                });
                return
            });
        }
        else {
            book.save( err => {
                if (err) return next(err);
                res.redirect(book.url);
            });
        }
    }
]

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};