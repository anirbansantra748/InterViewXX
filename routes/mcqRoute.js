const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqController');
const dsaController = require('../controllers/dsaController');
const {isLoggedIn} = require('../middlewares/isLoggedin')


router.get('/:jobId',isLoggedIn, mcqController.getMcqForm);
router.post('/:jobId',isLoggedIn, mcqController.postMcqForm);

module.exports = router;
