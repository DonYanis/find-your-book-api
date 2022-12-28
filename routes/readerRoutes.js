const express = require('express');
const readerController = require('../controllers/readerController');

const router = express.Router();




router.route('/')
        .get(readerController.getAllReaders);
        

router.route('/id/:id')
        .get(readerController.getreaderById)
        .patch(readerController.updateProfile);

router.route('/email/:email')
        .get(readerController.getreaderByEmail);

router.route('/readbooks/:id')
        .get(readerController.getreadBooks)
        .post(readerController.setreadBook)
        .delete(readerController.deletereadBook);

router.route('/wantbooks/:id')
        .get(readerController.getwantBooks)
        .post(readerController.setwantBook)
        .delete(readerController.deletewantBook);

router.route('/visitedbooks/:id')
        .get(readerController.getvisitedBooks)
        .post(readerController.setvisitedBook);

router.route('/likedbooks/:id')
        .get(readerController.getlikedBooks)
        .delete(readerController.deletelikedBook);

router.route('/genres/:id')
        .get(readerController.getreaderGenres);

router.route('/friends/:id')
        .get(readerController.getreaderFriends)
        .post(readerController.setreaderFriend)
        .delete(readerController.deletereaderFriend);        

router.route('/authors/:id')
        .get(readerController.getreaderAuthors)
        .post(readerController.setreaderAuthor)
        .delete(readerController.deletereaderAuthor); ;   

module.exports = router;