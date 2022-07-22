const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const async = require('async')
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookInstanceList = (req, res, next) => {
    BookInstance.find()
        .populate('book')
        .exec( (err, list_book_instance) => {
            if (err) return next(err);
            res.render('bookinstance_list', {title: 'Book Instance List', data:list_book_instance})
        });
};

// Display detail page for a specific BookInstance.
exports.bookInstanceDetail = (req, res, next) => {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) return next(err);
            if (bookinstance==null) { // No results.
                let err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance:  bookinstance});
        })
};

// Display BookInstance create form on GET.
exports.bookInstanceCreateGet = (req, res, next) => {
    Book.find({}, 'title')
        .exec( (err, books )=> {
            if (err) return next(err);
            res.render('book_instance_form', {title: 'Create Book Instance', book_list: books});
        });
};

// Handle BookInstance create on POST.
exports.bookInstanceCreatePost = [
    // Validate and sanitize data
    body('book', 'Book must be specified').trim().isLength({min: 1}).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({min: 1}).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601().toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);
        // Create book instance
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });
        // If there are errors. Render form again with sanitized values and error messages.
        if(!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec( (err, books) => {
                   if (err) return next(err);
                    res.render('book_instance_form', { title: 'Create Book Instance',
                        book_list: books,
                        selected_book: bookInstance.book._id,
                        errors: errors.array(),
                        bookInstance: bookInstance });
                });
            return
        }
        // Data from form is valid.
        else {
            bookInstance.save( err => {
                if (err) return next(err);
                res.redirect(bookInstance.url);
            })
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookInstanceDeleteGet = (req, res, next) => {
    // Get all info about book instances
    async.parallel({
        bookInstance(callback) {
            BookInstance.findById(req.params.id).exec(callback)
        }
    }, (err, result) => {
        if (err)  return next(err);
        if (result.bookInstance === null) res.redirect('/catalog/bookinstances');
        res.render('bookinstance_delete', {
            title: 'Delete Book Instance',
            bookInstance: result.bookInstance
        });
    });
};

// Handle BookInstance delete on POST.
exports.bookInstanceDeletePost = (req, res, next) => {
    //
    async.parallel({
        bookInstance(callback) {
            BookInstance.findById(req.params.id).exec(callback);
        }
    }, (err, result) => {
        if (err) return next(err);
        if (result.bookInstance === null) {
            res.redirect('/catalog/bookinstances');
        } else {
            BookInstance.findByIdAndRemove(req.body.bookInstanceId, (err) => {
               if (err) return next(err);
               res.redirect('/catalog/bookinstances');
            });
        }
    });
};

// Display BookInstance update form on GET.
exports.bookInstanceUpdateGet = (req, res, next) => {
    // Get data about book instance
    async.parallel({
        bookInstance(callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback);
        },
        book_list(callback) {
            Book.find({'book': req.params.id}).exec(callback);
        }
    }, 
    // If there are errors throw error 
    (err, results) => {
        if (err) return next(err);
        if (results.bookInstance == null) {
            let err = new Error('Book instance not found');
            err.status = 404;
            return next(err);
        };
        // On success, render the book instance update form.
        res.render('book_instance_form', {
            title: 'Update Book Instance',
            bookInstance: results.bookInstance,
            book_list: results.book_list
        });
    });
};

// Handle bookInstance update on POST.
exports.bookInstanceUpdatePost = [
    // Validate and sanitize data
    body('book', 'Book must be specified').trim().isLength({min: 1}).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({min: 1}).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601().toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {

        const errors = validationResult(req);
        const bookInstance = new BookInstance({
            _id: req.params.id,
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            // If there are errors get data from the database again.
            // and send them to the form again with the errors.
            async.parallel({
                bookInstance(callback) {
                    BookInstance.findById(req.params.id).populate('book').exec(callback);
                },
                book_list(callback) {
                    Book.find({'book': req.params.id}).exec(callback);
                }
            },  (err, result) => {
                if (err) return next(err);
                if (results.bookInstance == null) {
                    let err = new Error('Book instance not found');
                    err.status = 404;
                    return next(err);
                }
                res.render('book_instance_form', {
                    title: 'Update Book Instance',
                    bookInstance: result.bookInstance,
                    book_list: result.book_list,
                    errors: errors.array()
                });
            });
            return
        }
        else {
            BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {}, (err, theBookInstance) => {
                if (err) return next(err);
                res.redirect(theBookInstance.url);
            } )
        }
    }
];