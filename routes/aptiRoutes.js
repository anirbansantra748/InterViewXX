const express = require('express');
const router = express.Router();
const aptiController = require('../controllers/aptiController');
const {isLoggedIn} = require('../middlewares/isLoggedin')

router.get('/:jobId',isLoggedIn, aptiController.getAptitudeForm);
router.post('/:jobId',isLoggedIn, aptiController.createAptitudeRound);

module.exports = router;
