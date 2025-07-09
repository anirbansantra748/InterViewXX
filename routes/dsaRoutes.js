const express = require('express');
const router = express.Router();
const dsaController = require('../controllers/dsaController');
const {isLoggedIn} = require('../middlewares/isLoggedin')

router.get('/:jobId',isLoggedIn, dsaController.getDsaForm);
router.post('/:jobId',isLoggedIn, dsaController.postDsaForm);

module.exports = router;
