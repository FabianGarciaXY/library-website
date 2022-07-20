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
exports.book_delete_get = (req, res, next) => {
    // Getting all info related to books
    async.parallel({
        book(callback) {
            Book.findById(req.params.id).populate('author').exec(callback);
        },
        bookInstance(callback) {
            BookInstance.find({'book': req.params.id}).exec(callback);
        }
    }, (err, result) => {
        if (err) return next(err);
        if (result.book === null) res.redirect('/catalog/books');
        // On success
        res.render('book_delete', {title: 'Delete Book',
            book:result.book,
            bookInstance:result.bookInstance
        });
    });
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    async.parallel({
        book(callback) {
            Book.findById(req.params.id).exec(callback);
        },
        bookInstances(callback) {
            BookInstance.find({'book': req.params.id}).exec(callback);
        }
    },
    // Results
    (err, results) => {
        if (err) return next(err);
        if (results.bookInstances.length > 0) {
            res.render('book_delete', {
                title: 'Delete Book',
                book: results.book,
                bookInstance: results.bookInstance
            });
            return
        }
        else {
            Book.findByIdAndRemove(req.body.bookId, (err) => {
                if (err) return next(err);
                res.redirect('/catalog/books');
            })
        }
    });
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {
    // Get book, authors and genres form
    async.parallel({
        book(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors(callback) {
            Author.find(callback);
        },
        genres(callback) {
            Genre.find(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.book == null) { // No results
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // On succes, Mark our selected genres as checked
        for (let all_genre_iter = 0; all_genre_iter < results.genres.length; all_genre_iter++) {
            for (let book_genre_iter = 0; book_genre_iter < results.book.genre.length; book_genre_iter++) {
                if(results.genres[all_genre_iter]._id.toString() === results.book.genre[book_genre_iter]._id.toString()) {
                    results.genres[all_genre_iter].checked = 'true';
                }
            }
        }
        res.render('book_form',  {title: 'Update Book',
            authors: results.authors,
            genres: results.genres,
            book: results.book
        });
    });
};

// Handle book update on POST.
exports.book_update_post = [
    (req, res, next) => {
        if (!(Array.isArray(req.body.genre))) {
            if(typeof req.body.genre === 'undefined') {
                req.body.genre = [];
            }
            else {
                req.body.genre = [req.body.genre];
            }
        }
        next();
    },
    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({min: 1}).escape(),
    body('author', 'Author must not be empty.').trim().isLength({min: 1}).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract errors if there are
        const errors = validationResult(req) 
        // Create a new book
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id: req.params._id
        });

        if (!errors.isEmpty()) { // If there are some errors
            async.parallel({
                authors(callback) {
                    Author.find(callback);
                },
                genres(callback) {
                    Genre.find(callback);
                },
            }, (err, results) => {
                if (err) return next(err);
                
                // Mark our selected genres as checked.
                for(let i = 0; i<results.genres.length; i++) {
                    if(book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genre[i].checked = 'true';
                    }
                }
                res.render('book_form', {title: 'Update Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: results.book,
                    errors: errors.array()
                });
            });
            return
        }
        else {
            Book.findByIdAndUpdate(req.params.id, book, {}, (err, updatedBook) => {
                if (err) return next(err);
                res.redirect(updatedBook.url);
            });
        }
    }
];
