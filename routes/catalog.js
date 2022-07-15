const Router = require('express').Router;
const router = Router();

// Require controller modules
const bookController = require('./../controllers/bookController');
const authorController = require('./../controllers/authorController');
const genreController = require('./../controllers/genreController');
const bookInstanceController = require('./../controllers/bookinstanceController');
const {authorDeletePost, author} = require("../controllers/authorController");


// === BOOK ROUTES === //
// GET Catalog Home Page
router.get('/', bookController.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/book/create', bookController.book_create_get);

// POST request for creating Book.
router.post('/book/create', bookController.book_create_post);

// GET request to delete Book.
router.get('/book/:id/delete', bookController.book_delete_get);

// POST request to delete Book.
router.post('/book/:id/delete', bookController.book_delete_post);

// GET request to update Book.
router.get('/book/:id/update', bookController.book_update_get);

// POST request to update Book.
router.post('/book/:id/update', bookController.book_update_post);

// GET request for one Book
router.get('/book/:id', bookController.book_detail);

// GET request for list of all Book items.
router.get('/books', bookController.book_list);


// === AUTHOR ROUTES === //
// GET request for creating Author. This must come before route for id (i.e. display author)
router.get('/author/create', authorController.authorCreateGet);

// POST request for creating Author.
router.post('/author/create', authorController.authorCreatePost);

// GET request to delete Author.
router.get('/author/:id/delete', authorController.authorDeleteGet);

// POST request to delete Author.
router.post('/author/:id/delete', authorController.authorDeletePost);

// GET request to update Author.
router.get('/author/:id/update', authorController.authorUpdateGet);

// POST request to update Author.
router.post('/author/:id/update', authorController.authorUpdatePost);

// GET request for one Author.
router.get('/author/:id', authorController.authorDetail);

// GET request for list of all Authors.
router.get('/authors', authorController.authorList);


// Export Router
module.exports = router;