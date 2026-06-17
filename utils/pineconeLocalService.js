const { Pinecone } = require('@pinecone-database/pinecone');

/**
 * Pinecone Service for Local Embeddings
 * Uses 384 dimensions (HuggingFace all-MiniLM-L6-v2)
 */
class PineconeLocalService {
    constructor() {
        this.client = null;
        this.index = null;
        this.indexName = 'interviewxx-local';
        this.dimension = 384; // HuggingFace model dimension
    }

    async initialize() {
        try {
            if (this.client) {
                return;
            }

            this.client = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY
            });

            console.log('✅ Pinecone client initialized (Local Embeddings)');
        } catch (error) {
            console.error('Error initializing Pinecone:', error.message);
            throw new Error(`Failed to initialize Pinecone: ${error.message}`);
        }
    }

    async createIndexIfNotExists() {
        try {
            await this.initialize();

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
                await this.waitForIndexReady();
            } else {
                console.log(`✅ Index "${this.indexName}" already exists`);
            }

            this.index = this.client.index(this.indexName);
        } catch (error) {
            console.error('Error creating index:', error.message);
            throw new Error(`Failed to create index: ${error.message}`);
        }
    }

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

    async getIndex() {
        if (!this.index) {
            await this.createIndexIfNotExists();
        }
        return this.index;
    }

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

    async searchResumes(queryVector, topK = 10, filter = {}) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('resumes');

            const queryParams = {
                vector: queryVector,
                topK,
                includeMetadata: true,
                includeValues: false
            };

            // Only add filter if it has properties
            if (Object.keys(filter).length > 0) {
                queryParams.filter = filter;
            }

            const results = await namespace.query(queryParams);

            return results.matches || [];
        } catch (error) {
            console.error('Error searching resumes:', error.message);
            throw new Error(`Failed to search resumes: ${error.message}`);
        }
    }

    async searchJobs(queryVector, topK = 10, filter = {}) {
        try {
            const index = await this.getIndex();
            const namespace = index.namespace('jobs');

            const queryParams = {
                vector: queryVector,
                topK,
                includeMetadata: true,
                includeValues: false
            };

            // Only add filter if it has properties
            if (Object.keys(filter).length > 0) {
                queryParams.filter = filter;
            }

            const results = await namespace.query(queryParams);

            return results.matches || [];
        } catch (error) {
            console.error('Error searching jobs:', error.message);
            throw new Error(`Failed to search jobs: ${error.message}`);
        }
    }

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

module.exports = new PineconeLocalService();
