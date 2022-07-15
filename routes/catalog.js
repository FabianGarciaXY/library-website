const Router = require('express').Router;
const router = Router();

// Require controller modules
const bookController = require('./../controllers/bookController');
const authorController = require('./../controllers/authorController');
const genreController = require('./../controllers/genreController');
const bookInstanceController = require('./../controllers/bookinstanceController');

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


// TODO!
//  Author Routes
//  etc


module.exports = router;