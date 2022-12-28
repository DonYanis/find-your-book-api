const express = require('express');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

router.route('/global/:id')
        .get(recommendationController.getGlobalRec);

router.route('/readertastes/:id')
        .get(recommendationController.getReaderTastes);

router.route('/friendtastes/:id')
        .get(recommendationController.getFriendTastes);

router.route('/readerauthors/:id')
        .get(recommendationController.getReaderAuthors);

router.route('/books/similar/:isbn')
        .get(recommendationController.getSimilarBooks);

router.route('/books/readers/:isbn')
        .get(recommendationController.getReadersBooks);

module.exports = router;