const { pipeline } = require('@xenova/transformers');

/**
 * FREE Local Embedding Service
 * Uses HuggingFace Transformers - runs locally, no API calls!
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 */
class LocalEmbeddingService {
    constructor() {
        this.extractor = null;
        this.dimension = 384; // all-MiniLM-L6-v2 dimension
        this.modelName = 'Xenova/all-MiniLM-L6-v2';
    }

    /**
     * Initialize the model (downloads once, then cached)
     */
    async initialize() {
        if (this.extractor) {
            return; // Already initialized
        }

        console.log('🔄 Initializing local embedding model...');
        console.log(`   Model: ${this.modelName}`);
        console.log('   (First run will download ~23MB, then cached)');

        this.extractor = await pipeline('feature-extraction', this.modelName);

        console.log('✅ Local embedding model ready!');
        console.log(`   Dimension: ${this.dimension}`);
    }

    /**
     * Generate embedding for text
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} - Embedding vector (384 dimensions)
     */
    async generateEmbedding(text) {
        try {
            await this.initialize();

            const output = await this.extractor(text, {
                pooling: 'mean',
                normalize: true
            });

            // Convert to regular array
            const embedding = Array.from(output.data);

            return embedding;
        } catch (error) {
            console.error('Error generating embedding:', error.message);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    /**
     * Generate embedding for resume
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
     */
    buildResumeText(extractedData) {
        const parts = [];

        if (extractedData.personalInfo?.name) {
            parts.push(`Name: ${extractedData.personalInfo.name}`);
        }

        if (extractedData.summary) {
            parts.push(`Summary: ${extractedData.summary}`);
        }

        if (extractedData.skills?.length > 0) {
            const skillsList = extractedData.skills.map(s => s.name || s).join(', ');
            parts.push(`Skills: ${skillsList}`);
        }

        if (extractedData.experience?.length > 0) {
            extractedData.experience.forEach(exp => {
                parts.push(`${exp.title || exp.position} at ${exp.company}`);
                if (exp.responsibilities?.length > 0) {
                    parts.push(exp.responsibilities.join('. '));
                }
                if (exp.technologies?.length > 0) {
                    parts.push(`Technologies: ${exp.technologies.join(', ')}`);
                }
            });
        }

        if (extractedData.education?.length > 0) {
            extractedData.education.forEach(edu => {
                parts.push(`${edu.degree} in ${edu.field} from ${edu.institution}`);
            });
        }

        if (extractedData.projects?.length > 0) {
            extractedData.projects.forEach(proj => {
                parts.push(`Project: ${proj.name || proj.title} - ${proj.description}`);
                if (proj.technologies?.length > 0) {
                    parts.push(`Technologies: ${proj.technologies.join(', ')}`);
                }
            });
        }

        return parts.join('\n').trim();
    }

    /**
     * Build searchable text from job data
     */
    buildJobText(jobData) {
        const parts = [];

        parts.push(`${jobData.title} at ${jobData.company}`);

        if (jobData.description) {
            parts.push(jobData.description);
        }

        if (jobData.requiredSkills?.length > 0) {
            parts.push(`Required Skills: ${jobData.requiredSkills.join(', ')}`);
        }

        if (jobData.preferredSkills?.length > 0) {
            parts.push(`Preferred Skills: ${jobData.preferredSkills.join(', ')}`);
        }

        if (jobData.responsibilities?.length > 0) {
            parts.push(`Responsibilities: ${jobData.responsibilities.join('. ')}`);
        }

        if (jobData.requirements?.length > 0) {
            parts.push(`Requirements: ${jobData.requirements.join('. ')}`);
        }

        return parts.join('\n').trim();
    }

    /**
     * Batch generate embeddings
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
     * Calculate cosine similarity
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

module.exports = new LocalEmbeddingService();
