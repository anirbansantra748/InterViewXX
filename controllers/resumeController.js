const User = require('../models/UserSchema');
const resumeParser = require('../utils/resumeParser');
const resumeExtractor = require('../utils/resumeExtractor');
const localEmbeddingService = require('../utils/localEmbeddingService'); // FREE local embeddings
const pineconeLocalService = require('../utils/pineconeLocalService'); // 384 dims

/**
 * Resume Controller
 * Handles resume upload, parsing, and AI extraction
 */

/**
 * Upload and process resume
 * POST /api/resume/upload
 */
exports.uploadResume = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if resume file was uploaded (via Cloudinary middleware)
        if (!req.file || !req.file.path) {
            return res.status(400).json({
                success: false,
                message: 'No resume file uploaded'
            });
        }

        const resumeUrl = req.file.path; // Cloudinary URL
        const filename = req.file.filename;

        // Update user with resume file info
        const user = await User.findByIdAndUpdate(
            userId,
            {
                resumeFile: {
                    url: resumeUrl,
                    filename: filename
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                resumeUrl,
                filename,
                userId: user._id
            }
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload resume',
            error: error.message
        });
    }
};

/**
 * Parse and extract resume data
 * POST /api/resume/parse/:userId
 */
exports.parseResume = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if resume exists
        if (!user.resumeFile || !user.resumeFile.url) {
            return res.status(400).json({
                success: false,
                message: 'No resume file found for this user'
            });
        }

        // Step 1: Parse PDF
        console.log('📄 Parsing PDF...');
        const parsedData = await resumeParser.parseFromUrl(user.resumeFile.url);

        // Validate content
        if (!resumeParser.validateResumeContent(parsedData.text)) {
            return res.status(400).json({
                success: false,
                message: 'Uploaded file does not appear to be a valid resume'
            });
        }

        // Step 2: Extract structured data using AI
        console.log('🤖 Extracting data with AI...');
        const extractedData = await resumeExtractor.extractData(parsedData.text);

        // Step 3: Generate embedding (FREE local)
        console.log('🔢 Generating embedding (locally, no API calls)...');
        const embedding = await localEmbeddingService.generateResumeEmbedding(extractedData);

        // Step 4: Store in Pinecone
        console.log('💾 Storing in vector database...');
        await pineconeLocalService.upsertResume(userId, embedding, {
            skills: extractedData.skills?.map(s => s.name || s) || [],
            location: extractedData.personalInfo?.location || '',
            seniorityLevel: extractedData.metadata?.seniorityLevel || 'Junior'
        });

        // Step 5: Update user in MongoDB
        user.resumeExtractedData = {
            ...extractedData,
            aiMetadata: {
                ...extractedData.metadata,
                parseConfidence: extractedData.metadata?.confidence || 0,
                extractedAt: new Date(),
                modelUsed: 'gemini-2.5-flash + local-embeddings'
            }
        };

        user.vectorEmbedding = {
            id: userId,
            namespace: 'resumes',
            createdAt: new Date()
        };

        await user.save();

        console.log('✅ Resume processing complete!');

        res.json({
            success: true,
            message: 'Resume parsed and extracted successfully',
            data: {
                extractedData: user.resumeExtractedData,
                confidence: extractedData.metadata?.confidence || 0,
                wordCount: parsedData.metadata?.wordCount || 0,
                pages: parsedData.pages
            }
        });
    } catch (error) {
        console.error('Error parsing resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to parse resume',
            error: error.message
        });
    }
};

/**
 * Get extracted resume data
 * GET /api/resume/data/:userId
 */
exports.getResumeData = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('resumeExtractedData resumeFile vectorEmbedding');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                resumeFile: user.resumeFile,
                extractedData: user.resumeExtractedData,
                vectorEmbedding: user.vectorEmbedding
            }
        });
    } catch (error) {
        console.error('Error getting resume data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get resume data',
            error: error.message
        });
    }
};

/**
 * Update extracted resume data
 * PUT /api/resume/data/:userId
 */
exports.updateResumeData = async (req, res) => {
    try {
        const { userId } = req.params;
        const { extractedData } = req.body;

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update extracted data
        user.resumeExtractedData = {
            ...user.resumeExtractedData,
            ...extractedData
        };

        // Regenerate embedding if data changed significantly (FREE local)
        console.log('🔄 Regenerating embedding (locally)...');
        const embedding = await localEmbeddingService.generateResumeEmbedding(user.resumeExtractedData);

        await pineconeLocalService.upsertResume(userId, embedding, {
            skills: user.resumeExtractedData.skills?.map(s => s.name || s) || [],
            location: user.resumeExtractedData.personalInfo?.location || '',
            seniorityLevel: user.resumeExtractedData.aiMetadata?.seniorityLevel || 'Junior'
        });

        await user.save();

        res.json({
            success: true,
            message: 'Resume data updated successfully',
            data: {
                extractedData: user.resumeExtractedData
            }
        });
    } catch (error) {
        console.error('Error updating resume data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update resume data',
            error: error.message
        });
    }
};

/**
 * Delete resume and vector data
 * DELETE /api/resume/:userId
 */
exports.deleteResume = async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete from Pinecone
        await pineconeLocalService.deleteResume(userId);

        // Clear resume data from MongoDB
        await User.findByIdAndUpdate(userId, {
            $unset: {
                resumeFile: 1,
                resumeExtractedData: 1,
                vectorEmbedding: 1
            }
        });

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resume',
            error: error.message
        });
    }
};

/**
 * Reprocess resume (re-parse and re-extract)
 * POST /api/resume/reprocess/:userId
 */
exports.reprocessResume = async (req, res) => {
    try {
        const { userId } = req.params;

        // Simply call parseResume again
        req.params.userId = userId;
        await exports.parseResume(req, res);
    } catch (error) {
        console.error('Error reprocessing resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reprocess resume',
            error: error.message
        });
    }
};
