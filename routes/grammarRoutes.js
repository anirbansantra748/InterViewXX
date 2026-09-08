const express = require('express');
const router = express.Router();
const grammarRoundController = require('../controllers/grammarController');
const {isLoggedIn} = require('../middlewares/isLoggedin')

router.get('/:jobId',isLoggedIn, grammarRoundController.showAddGrammarRoundForm);
router.post('/:jobId',isLoggedIn, grammarRoundController.createGrammarRound);

module.exports = router;
