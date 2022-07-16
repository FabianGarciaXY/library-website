const Author = require('../models/author');
const Book = require('../models/book')
const async = require('async');

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
    res.send('NOT IMPLEMENTED: Author create GET', );
};

// Handle author create on POST
exports.authorCreatePost = (req, res) => {
    res.send('NOT IMPLEMENTED: Author create POST');
};


// Display Author delete form on GET.
exports.authorDeleteGet = (req, res) => {
    res.send('NOT IMPLEMENTED: Author delete GET')
}

// Display Author delete form on GET.
exports.authorDeletePost = (req, res) => {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.authorUpdateGet = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update GET');
}

// Handle Author update on POST.
exports.authorUpdatePost = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update POST');
};