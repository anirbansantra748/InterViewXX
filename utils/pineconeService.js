const { Pinecone } = require('@pinecone-database/pinecone');

/**
 * Pinecone Service
 * Manages vector database operations
 */
class PineconeService {
    constructor() {
        this.client = null;
        this.index = null;
        this.indexName = 'interviewxx';
        this.dimension = 768; // Gemini embedding-001 dimension
    }

    /**
     * Initialize Pinecone client
     */
    async initialize() {
        try {
            if (this.client) {
                return; // Already initialized
            }

            this.client = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY
            });

            console.log('✅ Pinecone client initialized');
        } catch (error) {
            console.error('Error initializing Pinecone:', error.message);
            throw new Error(`Failed to initialize Pinecone: ${error.message}`);
        }
    }

    /**
     * Create index if it doesn't exist
     */
    async createIndexIfNotExists() {
        try {
            await this.initialize();

            // Check if index exists
            const indexes = await this.client.listIndexes();
            const indexExists = indexes.indexes?.some(idx => idx.name === this.indexName);

            if (!indexExists) {
                console.log(`Creating Pinecone index: ${this.indexName}...`);

                await this.client.createIndex({
                    name: this.indexName,
                    dimension: this.dimension,
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                        }
                    }
                });

                console.log(`✅ Index "${this.indexName}" created successfully`);

                // Wait for index to be ready
                await this.waitForIndexReady();
            } else {
                console.log(`✅ Index "${this.indexName}" already exists`);
            }

            // Get index instance
            this.index = this.client.index(this.indexName);
        } catch (error) {
            console.error('Error creating index:', error.message);
            throw new Error(`Failed to create index: ${error.message}`);
        }
    }

    /**
     * Wait for index to be ready
     */
    async waitForIndexReady() {
        const maxAttempts = 30;
        const delayMs = 2000;

        for (let i = 0; i < maxAttempts; i++) {
            try {
                const description = await this.client.describeIndex(this.indexName);
                if (description.status?.ready) {
                    console.log('✅ Index is ready');
                    return;
                }
            } catch (error) {
                // Index might not be available yet
            }

            console.log(`Waiting for index to be ready... (${i + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        throw new Error('Index creation timeout');
    }

    /**
     * Get index instance
     */
    async getIndex() {
        if (!this.index) {
            await this.createIndexIfNotExists();
        }
        return this.index;
    }

    /**
     * Upsert resume vector
     * @param {string} userId - User ID
     * @param {number[]} embedding - Embedding vector
     * @param {object} metadata - Additional metadata
     */
    async upsertResume(userId, embedding, metadata = {}) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('resumes');

            await namespace.upsert([
                {
                    id: userId,
                    values: embedding,
                    metadata: {
                        userId,
                        type: 'resume',
                        ...metadata,
                        updatedAt: new Date().toISOString()
                    }
                }
            ]);

            console.log(`✅ Resume vector upserted for user: ${userId}`);
        } catch (error) {
            console.error('Error upserting resume:', error.message);
            throw new Error(`Failed to upsert resume: ${error.message}`);
        }
    }

    /**
     * Upsert job vector
     * @param {string} jobId - Job ID
     * @param {number[]} embedding - Embedding vector
     * @param {object} metadata - Additional metadata
     */
    async upsertJob(jobId, embedding, metadata = {}) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('jobs');

            await namespace.upsert([
                {
                    id: jobId,
                    values: embedding,
                    metadata: {
                        jobId,
                        type: 'job',
                        ...metadata,
                        updatedAt: new Date().toISOString()
                    }
                }
            ]);

            console.log(`✅ Job vector upserted for job: ${jobId}`);
        } catch (error) {
            console.error('Error upserting job:', error.message);
            throw new Error(`Failed to upsert job: ${error.message}`);
        }
    }

    /**
     * Search for similar resumes
     * @param {number[]} queryVector - Query embedding
     * @param {number} topK - Number of results
     * @param {object} filter - Metadata filter
     * @returns {Promise<Array>} - Search results
     */
    async searchResumes(queryVector, topK = 10, filter = {}) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('resumes');

            const results = await namespace.query({
                vector: queryVector,
                topK,
                filter,
                includeMetadata: true,
                includeValues: false
            });

            return results.matches || [];
        } catch (error) {
            console.error('Error searching resumes:', error.message);
            throw new Error(`Failed to search resumes: ${error.message}`);
        }
    }

    /**
     * Search for similar jobs
     * @param {number[]} queryVector - Query embedding
     * @param {number} topK - Number of results
     * @param {object} filter - Metadata filter
     * @returns {Promise<Array>} - Search results
     */
    async searchJobs(queryVector, topK = 10, filter = {}) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('jobs');

            const results = await namespace.query({
                vector: queryVector,
                topK,
                filter,
                includeMetadata: true,
                includeValues: false
            });

            return results.matches || [];
        } catch (error) {
            console.error('Error searching jobs:', error.message);
            throw new Error(`Failed to search jobs: ${error.message}`);
        }
    }

    /**
     * Delete resume vector
     * @param {string} userId - User ID
     */
    async deleteResume(userId) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('resumes');

            await namespace.deleteOne(userId);
            console.log(`✅ Resume vector deleted for user: ${userId}`);
        } catch (error) {
            console.error('Error deleting resume:', error.message);
            throw new Error(`Failed to delete resume: ${error.message}`);
        }
    }

    /**
     * Delete job vector
     * @param {string} jobId - Job ID
     */
    async deleteJob(jobId) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('jobs');

            await namespace.deleteOne(jobId);
            console.log(`✅ Job vector deleted for job: ${jobId}`);
        } catch (error) {
            console.error('Error deleting job:', error.message);
            throw new Error(`Failed to delete job: ${error.message}`);
        }
    }

    /**
     * Get index stats
     */
    async getStats() {
        try {
            const index = await this.getIndex();
            const stats = await index.describeIndexStats();
            return stats;
        } catch (error) {
            console.error('Error getting stats:', error.message);
            throw new Error(`Failed to get stats: ${error.message}`);
        }
    }
}

module.exports = new PineconeService();
