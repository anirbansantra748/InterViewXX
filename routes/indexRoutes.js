const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

//routes
router.get('/home',indexController.homePage)

router.get("/third",indexController.thirdRound)

router.get('/add-dummy', indexController.addDummyQuestion);

module.exports = router;
