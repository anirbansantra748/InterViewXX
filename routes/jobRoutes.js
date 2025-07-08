const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const isAdmin = require('../middlewares/isAdmin');


router.get('/create',jobController.createJobForm);

// Read
router.get('/', jobController.allJobs);
router.get('/:id', jobController.jobDtails);

// Create
router.post('/create', jobController.createJob);

// Update
router.get('/edit/:id', jobController.editJobForm);
router.post('/edit/:id', jobController.updateJob);

// Delete
router.post('/delete/:id', jobController.deleteJob);

router.get('/search', jobController.searchJobs);


module.exports = router;
