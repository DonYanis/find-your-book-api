const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();




router.route('/')
        .get(bookController.getAllBooks)
        .post(bookController.addBook)
        .delete(bookController.deleteBook);
        
//search by name
router.route('/search')
        .get(bookController.searchBooks);

router.route('/:isbn')
        .get(bookController.getBookByISBN);



router.route('/reviews/:isbn')
        .get(bookController.getBookReviews);



module.exports = router;