require('dotenv').config();
const pineconeService = require('./utils/pineconeService');
const embeddingService = require('./utils/embeddingService');

/**
 * Test Script: Initialize Pinecone and Test Services
 */

async function testPineconeSetup() {
    console.log('🧪 Testing Pinecone Setup...\n');

    try {
        // Step 1: Initialize Pinecone
        console.log('1️⃣ Initializing Pinecone client...');
        await pineconeService.initialize();
        console.log('✅ Pinecone client initialized\n');

        // Step 2: Create index if not exists
        console.log('2️⃣ Creating/checking Pinecone index...');
        await pineconeService.createIndexIfNotExists();
        console.log('✅ Index ready\n');

        // Step 3: Get index stats
        console.log('3️⃣ Getting index stats...');
        const stats = await pineconeService.getStats();
        console.log('📊 Index Stats:', JSON.stringify(stats, null, 2));
        console.log('');

        // Step 4: Test embedding generation
        console.log('4️⃣ Testing embedding generation...');
        const testText = 'Software Engineer with 3 years of experience in React, Node.js, and MongoDB';
        const embedding = await embeddingService.generateEmbedding(testText);
        console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
        console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        console.log('');

        // Step 5: Test resume embedding
        console.log('5️⃣ Testing resume embedding...');
        const mockResumeData = {
            personalInfo: {
                name: 'John Doe',
                email: 'john@example.com'
            },
            summary: 'Experienced software engineer specializing in full-stack development',
            skills: [
                { name: 'React', category: 'Technical', level: 'Advanced' },
                { name: 'Node.js', category: 'Technical', level: 'Advanced' },
                { name: 'MongoDB', category: 'Technical', level: 'Intermediate' }
            ],
            experience: [
                {
                    company: 'Tech Corp',
                    title: 'Senior Software Engineer',
                    responsibilities: ['Led development of microservices', 'Mentored junior developers'],
                    technologies: ['React', 'Node.js', 'AWS']
                }
            ],
            education: [
                {
                    institution: 'MIT',
                    degree: 'B.S.',
                    field: 'Computer Science'
                }
            ]
        };

        const resumeEmbedding = await embeddingService.generateResumeEmbedding(mockResumeData);
        console.log(`✅ Generated resume embedding with ${resumeEmbedding.length} dimensions`);
        console.log('');

        // Step 6: Test upsert
        console.log('6️⃣ Testing vector upsert...');
        const testUserId = 'test-user-123';
        await pineconeService.upsertResume(testUserId, resumeEmbedding, {
            skills: ['React', 'Node.js', 'MongoDB'],
            location: 'San Francisco',
            seniorityLevel: 'Senior'
        });
        console.log('✅ Test vector upserted successfully\n');

        // Step 7: Test search
        console.log('7️⃣ Testing vector search...');
        const searchResults = await pineconeService.searchResumes(resumeEmbedding, 5);
        console.log(`✅ Found ${searchResults.length} similar resumes`);
        if (searchResults.length > 0) {
            console.log('   Top result:', {
                id: searchResults[0].id,
                score: searchResults[0].score?.toFixed(4),
                metadata: searchResults[0].metadata
            });
        }
        console.log('');

        // Step 8: Cleanup test data
        console.log('8️⃣ Cleaning up test data...');
        await pineconeService.deleteResume(testUserId);
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 All tests passed! Pinecone is ready to use.\n');
        console.log('📝 Summary:');
        console.log(`   - Index: interviewxx`);
        console.log(`   - Dimension: 768 (Gemini embedding-001)`);
        console.log(`   - Metric: cosine`);
        console.log(`   - Namespaces: resumes, jobs`);
        console.log(`   - Total vectors: ${stats.totalRecordCount || 0}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run tests
testPineconeSetup()
    .then(() => {
        console.log('\n✅ Test script completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test script failed:', error);
        process.exit(1);
    });
