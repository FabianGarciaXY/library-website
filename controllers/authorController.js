const Author = require('../models/author');
const Book = require('../models/book')
const async = require('async');
const { body, validationResult } = require('express-validator');


// Render All list of authors
exports.authorList = (req, res, next) => {
    Author.find({})
        .sort([['family_name', 'ascending']])
        .exec( (err, list_authors) => {
            if (err) return next(err);
            res.render('author_list', {title: 'Author List', list_authors: list_authors});
        });
};


// Render Information from a specific author
exports.authorDetail = (req, res, next) => {
    async.parallel({
        author: (callback) => {
            Author.findById(req.params.id)
                .exec(callback)
        },
        authorsBooks: (callback) => {
            Book.find({ 'author': req.params.id },'title summary')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author == null) { // No results.
            let err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // On success
        res.render('author_detail', {
            title: 'Author Detail',
            author: results.author,
            author_books: results.authorsBooks } );
    });
};


// Display Author create on GET
exports.authorCreateGet = (req, res) => {
    res.render('author_form', {title: 'Create Author'});
};


// Handle author create on POST
exports.authorCreatePost = [
    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape()
        .withMessage('First name must be specified')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape()
        .withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth')
        .optional({checkFalsy: true}).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death')
        .optional({checkFalsy: true}).isISO8601().toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return
        }
        else {
            const author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save( (err) => {
                if (err) return next(err);
                res.redirect(author.url);
            });
        }
    }
]


// Display Author delete form on GET.
exports.authorDeleteGet = (req, res, next) => {
    // Get a specific Author and its books
    async.parallel({
        author(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books(callback) {
            Book.find({ 'author': req.params.id }).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.author == null) { // No results
            res.redirect('catalog/authors');
        }
        // On success
        res.render('author_delete', { title: 'Delete Author',
                author: results.author,
                author_books: results.author_books
        });
    });
}


// Delete the author on POST
exports.authorDeletePost = (req, res, next) => {
    async.parallel({
        author(callback) {
            Author.findById(req.body.id).exec(callback);
        },
        author_books(callback) {
            Book.find({'author': req.body.id}).exec(callback);
        }
    }, (err, results) => {
        if(err) return next(err);
        if (results.author_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author',
                author: results.author,
                author_books: results.author_books
            });
            return
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, (err) => {
                if (err) return next(err);
                // Success - go to author list
                res.redirect('/catalog/authors');
            });
        }
    });
};


// Display Author update form on GET.
exports.authorUpdateGet = (req, res, next) => {
    // Get info about the author, its books
    async.parallel({
        author(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        books(callback) {
            Book.find({'author': req.params.id}).exec(callback);
        }
    }, (err, results) => {
        if (err) return next(err);
        if (results.author == null) {
            let err = new Error('Not found');
            err.status = 404;
            return next(err);
        }
        // On success mark genres as checked
        res.render('author_form', {
            title: 'Update Author',
            author: results.author,
            books: results.books
        });
    });
}


// Handle Author update on POST.
exports.authorUpdatePost = [
    // Validate and sanitize fields.
    body('first_name', 'first name must be specified').trim().isLength({ min: 1 }).escape(),
    body('family_name', 'family name must be specified').trim().isLength({ min: 1 }).escape(),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601().toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);
        const author = new Author({
            _id: req.params.id,
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        });

        if (!errors.isEmpty()) {
            // If there are errors get data from the database again.
            // and send them to the form again with the errors.
            async.parallel({
                author(callback) {
                    Author.findById(req.params.id).exec(callback);
                },
                books(callback) {
                    Book.find({'author': req.params.id}).exec(callback);
                },
            }, (err, results) => {
                if (err) return next(err)
                res.render('author_form', {
                    title: 'Update Author',
                    author: results.author,
                    books: author.books,
                    errors: errors.array()
                });
            })
            return
        }
        else {
            // There are no error, success: update the author.
            Author.findByIdAndUpdate(req.params.id, author, {}, (err, theAuthor) => {
                if (err) return next(err);
                // Success - redirect to the author's detail page.
                res.redirect(theAuthor.url);
            });
        }
    }
];