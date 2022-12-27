const express = require('express');
const genreController = require('../controllers/statisticController');

const router = express.Router();

router.route('/global')
        .get(genreController.getGlobalStats);

router.route('/personal/:id')
        .get(genreController.getPersonalStats);

router.route('/bookvisits/:isbn')
        .get(genreController.getBookVisitStats);
  

module.exports = router;