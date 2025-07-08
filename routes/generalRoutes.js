const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');

// GET form
router.get('/:jobId', generalController.showGeneralForm);

// POST create round
router.post('/:jobId', generalController.createGeneralRound);

module.exports = router;
