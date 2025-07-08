const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqController');
const dsaController = require('../controllers/dsaController');


router.get('/:jobId', mcqController.getMcqForm);
router.post('/:jobId', mcqController.postMcqForm);

module.exports = router;
