const express = require('express');
const genreController = require('../controllers/genreController');

const router = express.Router();

router.route('/')
        .get(genreController.getAllGenres)
        .post(genreController.addGenre)
        .delete(genreController.deleteGenre);

router.route('/books/:name')
        .get(genreController.getGenreBooks);

router.route('/readers/:name')
        .get(genreController.getGenreReaders);

router.route('/authors/:name')
        .get(genreController.getGenreAuthors);

module.exports = router;