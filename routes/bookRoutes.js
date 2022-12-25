const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();




router.route('/')
        .get(bookController.getAllBooks);
      //.post();


router.route('/:isbn')
        .get(bookController.getBookByISBN);

module.exports = router;