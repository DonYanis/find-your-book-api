const express = require('express');
const readerController = require('../controllers/readerController');

const router = express.Router();




router.route('/')
        .get(readerController.getAllReaders);
      //.post();

router.route('/id/:id')
        .get(readerController.getreaderById);

router.route('/email/:email')
        .get(readerController.getreaderByEmail);

router.route('/readbooks/:id')
        .get(readerController.getreadBooks);

router.route('/wantbooks/:id')
        .get(readerController.getwantBooks);

router.route('/visitedbooks/:id')
        .get(readerController.getvisitedBooks);

router.route('/likedbooks/:id')
        .get(readerController.getlikedBooks);

router.route('/genres/:id')
        .get(readerController.getreaderGenres);

router.route('/friends/:id')
        .get(readerController.getreaderFriends);        

router.route('/authors/:id')
        .get(readerController.getreaderAuthors);   

module.exports = router;