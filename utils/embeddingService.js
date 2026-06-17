const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Embedding Service
 * Generates vector embeddings using Gemini embedding-001 (FREE)
 */
class EmbeddingService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = 'embedding-001';
    }

    /**
     * Generate embedding for text
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} - Embedding vector (768 dimensions)
     */
    async generateEmbedding(text) {
        try {
            const embeddingModel = this.genAI.getGenerativeModel({ model: this.model });
            const result = await embeddingModel.embedContent(text);

            return result.embedding.values;
        } catch (error) {
            console.error('Error generating embedding:', error.message);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    /**
     * Generate embedding for resume
     * Combines all relevant fields into a single embedding
     * @param {object} extractedData - Extracted resume data
     * @returns {Promise<number[]>} - Embedding vector
     */
    async generateResumeEmbedding(extractedData) {
        try {
            const resumeText = this.buildResumeText(extractedData);
            return await this.generateEmbedding(resumeText);
        } catch (error) {
            console.error('Error generating resume embedding:', error.message);
            throw new Error(`Failed to generate resume embedding: ${error.message}`);
        }
    }

    /**
     * Generate embedding for job description
     * @param {object} jobData - Job data
     * @returns {Promise<number[]>} - Embedding vector
     */
    async generateJobEmbedding(jobData) {
        try {
            const jobText = this.buildJobText(jobData);
            return await this.generateEmbedding(jobText);
        } catch (error) {
            console.error('Error generating job embedding:', error.message);
            throw new Error(`Failed to generate job embedding: ${error.message}`);
        }
    }

    /**
     * Build searchable text from resume data
     * @param {object} extractedData - Extracted resume data
     * @returns {string} - Concatenated resume text
     */
    buildResumeText(extractedData) {
        const parts = [];

        // Personal info
        if (extractedData.personalInfo?.name) {
            parts.push(`Name: ${extractedData.personalInfo.name}`);
        }

        // Summary
        if (extractedData.summary) {
            parts.push(`Summary: ${extractedData.summary}`);
        }

        // Skills
        if (extractedData.skills?.length > 0) {
            const skillsList = extractedData.skills.map(s => s.name).join(', ');
            parts.push(`Skills: ${skillsList}`);
        }

        // Experience
        if (extractedData.experience?.length > 0) {
            extractedData.experience.forEach(exp => {
                parts.push(`${exp.title} at ${exp.company}`);
                if (exp.responsibilities?.length > 0) {
                    parts.push(exp.responsibilities.join('. '));
                }
                if (exp.technologies?.length > 0) {
                    parts.push(`Technologies: ${exp.technologies.join(', ')}`);
                }
            });
        }

        // Education
        if (extractedData.education?.length > 0) {
            extractedData.education.forEach(edu => {
                parts.push(`${edu.degree} in ${edu.field} from ${edu.institution}`);
            });
        }

        // Projects
        if (extractedData.projects?.length > 0) {
            extractedData.projects.forEach(proj => {
                parts.push(`Project: ${proj.name} - ${proj.description}`);
                if (proj.technologies?.length > 0) {
                    parts.push(`Technologies: ${proj.technologies.join(', ')}`);
                }
            });
        }

        return parts.join('\n').trim();
    }

    /**
     * Build searchable text from job data
     * @param {object} jobData - Job data
     * @returns {string} - Concatenated job text
     */
    buildJobText(jobData) {
        const parts = [];

        // Job title and company
        parts.push(`${jobData.title} at ${jobData.company}`);

        // Description
        if (jobData.description) {
            parts.push(jobData.description);
        }

        // Required skills
        if (jobData.requiredSkills?.length > 0) {
            parts.push(`Required Skills: ${jobData.requiredSkills.join(', ')}`);
        }

        // Preferred skills
        if (jobData.preferredSkills?.length > 0) {
            parts.push(`Preferred Skills: ${jobData.preferredSkills.join(', ')}`);
        }

        // Responsibilities
        if (jobData.responsibilities?.length > 0) {
            parts.push(`Responsibilities: ${jobData.responsibilities.join('. ')}`);
        }

        // Requirements
        if (jobData.requirements?.length > 0) {
            parts.push(`Requirements: ${jobData.requirements.join('. ')}`);
        }

        return parts.join('\n').trim();
    }

    /**
     * Batch generate embeddings
     * @param {string[]} texts - Array of texts
     * @returns {Promise<number[][]>} - Array of embedding vectors
     */
    async batchGenerateEmbeddings(texts) {
        try {
            const embeddings = await Promise.all(
                texts.map(text => this.generateEmbedding(text))
            );
            return embeddings;
        } catch (error) {
            console.error('Error in batch embedding generation:', error.message);
            throw new Error(`Failed to generate batch embeddings: ${error.message}`);
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param {number[]} vecA - First vector
     * @param {number[]} vecB - Second vector
     * @returns {number} - Similarity score (0-1)
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have same dimensions');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }
}

module.exports = new EmbeddingService();
