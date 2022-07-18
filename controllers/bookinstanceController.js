const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
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
exports.bookInstanceDeleteGet = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookInstanceDeletePost = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookInstanceUpdateGet = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookInstance update on POST.
exports.bookInstanceUpdatePost = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};