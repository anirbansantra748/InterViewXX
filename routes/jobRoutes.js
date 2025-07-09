const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const {isAdmin} = require('../middlewares/isAdmin');
const {isLoggedIn} = require('../middlewares/isLoggedin')

router.get('/create',isLoggedIn,jobController.createJobForm);
router.get('/my-jobs', isLoggedIn, jobController.myJobs);

// Read
router.get('/', jobController.allJobs);
router.get('/:id',isLoggedIn, jobController.jobDtails);

// Create
router.post('/create',isLoggedIn, jobController.createJob);

// Update
router.get('/edit/:id',isLoggedIn,isAdmin, jobController.editJobForm);
router.post('/edit/:id',isLoggedIn,isAdmin, jobController.updateJob);

// Delete
router.post('/delete/:id',isLoggedIn,isAdmin, jobController.deleteJob);

router.get('/search', jobController.searchJobs);


module.exports = router;
