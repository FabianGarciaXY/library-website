const Author = require('../models/author');

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
exports.authorDetail = (req, res) => {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
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