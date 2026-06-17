const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { isLoggedIn } = require('../middlewares/isLoggedin');
const { upload } = require('../middlewares/multer.middleware');
const { uploadOnCloudinary } = require('../utils/cloudinary');

/**
 * Resume Routes
 * All routes require authentication
 */

// Upload resume (with Cloudinary middleware)
router.post('/upload', isLoggedIn, upload.single('resume'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

        if (!cloudinaryResponse) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload to Cloudinary'
            });
        }

        // Add Cloudinary data to request
        req.file.path = cloudinaryResponse.secure_url;
        req.file.filename = cloudinaryResponse.public_id;

        // Call the controller
        next();
    } catch (error) {
        console.error('Upload middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
}, resumeController.uploadResume);

// Parse and extract resume data
router.post('/parse/:userId', isLoggedIn, resumeController.parseResume);

// Get extracted resume data
router.get('/data/:userId', isLoggedIn, resumeController.getResumeData);

// Update extracted resume data
router.put('/data/:userId', isLoggedIn, resumeController.updateResumeData);

// Delete resume
router.delete('/:userId', isLoggedIn, resumeController.deleteResume);

// Reprocess resume
router.post('/reprocess/:userId', isLoggedIn, resumeController.reprocessResume);

module.exports = router;
