const express = require('express');
const router = express.Router();
const roundController = require('../controllers/roundController');

// Correct path
router.get('/select-round/:jobId', roundController.getSelectRound);
router.post('/select-round/:jobId', roundController.postSelectRound);
router.get('/next/:jobId', roundController.getNextRoundOrFinish);
router.get('/start-round/:roundId', roundController.startRound);
router.post('/submit-round/:roundId', roundController.submitRound);

// Edit form page
router.get('/mcq/edit/:id', roundController.showEditForm);

// Handle edit form submission
router.post('/mcq/edit/:id', roundController.updateMcqRound);

// Delete round
router.post('/mcq/delete/:id', roundController.deleteMCQRound);


// Edit form page
router.get('/grammar/edit/:id', roundController.showEditGrammarForm);

// Handle edit form submission
router.post('/grammar/edit/:id', roundController.updateGrammarRound);

// Delete round
router.post('/grammar/delete/:id', roundController.deleteGrammarRound);


// Edit form page
router.get('/dsa/edit/:id', roundController.showEditDSARoundForm);

// Handle edit form submission
router.post('/dsa/edit/:id', roundController.updateDSARound);

// Delete round
router.post('/dsa/delete/:id', roundController.deleteDSARound);


// Edit form page
router.get('/aptitude/edit/:id', roundController.showEditAptitudeForm);

// Handle edit form submission
router.post('/aptitude/edit/:id', roundController.updateAptitudeRound);

// Delete round
router.post('/aptitude/delete/:id', roundController.deleteAptitudeRound);

router.get('/:roundId/results', roundController.getRoundResults);


module.exports = router;
