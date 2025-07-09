const express = require('express');
const router = express.Router();
const roundController = require('../controllers/roundController');
const {isLoggedIn} = require('../middlewares/isLoggedin')

router.get('/select-round/:jobId',isLoggedIn, roundController.getSelectRound);
router.post('/select-round/:jobId',isLoggedIn, roundController.postSelectRound);
router.get('/next/:jobId',isLoggedIn, roundController.getNextRoundOrFinish);
router.get('/start-round/:roundId',isLoggedIn, roundController.startRound);
router.post('/submit-round/:roundId',isLoggedIn, roundController.submitRound);

// Edit form page
router.get('/mcq/edit/:id',isLoggedIn, roundController.showEditForm);

// Handle edit form submission
router.post('/mcq/edit/:id',isLoggedIn, roundController.updateMcqRound);

// Delete round
router.post('/mcq/delete/:id',isLoggedIn, roundController.deleteMCQRound);


// Edit form page
router.get('/grammar/edit/:id',isLoggedIn, roundController.showEditGrammarForm);

// Handle edit form submission
router.post('/grammar/edit/:id',isLoggedIn, roundController.updateGrammarRound);

// Delete round
router.post('/grammar/delete/:id',isLoggedIn, roundController.deleteGrammarRound);


// Edit form page
router.get('/dsa/edit/:id',isLoggedIn, roundController.showEditDSARoundForm);

// Handle edit form submission
router.post('/dsa/edit/:id',isLoggedIn, roundController.updateDSARound);

// Delete round
router.post('/dsa/delete/:id',isLoggedIn, roundController.deleteDSARound);


// Edit form page
router.get('/aptitude/edit/:id',isLoggedIn, roundController.showEditAptitudeForm);

// Handle edit form submission
router.post('/aptitude/edit/:id',isLoggedIn, roundController.updateAptitudeRound);

// Delete round
router.post('/aptitude/delete/:id',isLoggedIn, roundController.deleteAptitudeRound);

router.get('/:roundId/results',isLoggedIn, roundController.getRoundResults);


module.exports = router;
