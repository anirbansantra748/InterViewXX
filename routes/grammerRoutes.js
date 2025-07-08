const express = require('express');
const router = express.Router();
const grammarRoundController = require('../controllers/grammerController');


router.get('/:jobId', grammarRoundController.showAddGrammarRoundForm);
router.post('/:jobId', grammarRoundController.createGrammarRound);

module.exports = router;
