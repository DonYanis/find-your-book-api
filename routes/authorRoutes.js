const express = require('express');
const authorController = require('../controllers/authorController');

const router = express.Router();

router.route('/')
        .get(authorController.getAllAuthors)
        .post(authorController.addAuthor)
        .delete(authorController.deleteAuthor);

router.route('/:key')
        .get(authorController.getAuthor);

router.route('/books/:key')
        .get(authorController.getAuthorBooks);

router.route('/fans/:key')
        .get(authorController.getAuthorFans);

module.exports = router;