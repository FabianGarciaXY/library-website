const BookInstance = require('../models/bookinstance');

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
exports.bookInstanceCreateGet = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance create GET');
};

// Handle BookInstance create on POST.
exports.bookInstanceCreatePost = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance create POST');
};

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