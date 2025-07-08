const express = require('express');
const router = express.Router();
const dsaController = require('../controllers/dsaController');

router.get('/:jobId', dsaController.getDsaForm);
router.post('/:jobId', dsaController.postDsaForm);

module.exports = router;
