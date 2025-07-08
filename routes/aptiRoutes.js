const express = require('express');
const router = express.Router();
const aptiController = require('../controllers/aptiController');

router.get('/:jobId', aptiController.getAptitudeForm);
router.post('/:jobId', aptiController.createAptitudeRound);

module.exports = router;
