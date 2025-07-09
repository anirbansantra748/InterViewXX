const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');
const {isLoggedIn} = require('../middlewares/isLoggedin')

// GET form
router.get('/:jobId',isLoggedIn, generalController.showGeneralForm);
// POST create round
router.post('/:jobId',isLoggedIn, generalController.createGeneralRound);

module.exports = router;
