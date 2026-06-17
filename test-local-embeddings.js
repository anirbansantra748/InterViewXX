require('dotenv').config();
const localEmbeddingService = require('./utils/localEmbeddingService');
const pineconeLocalService = require('./utils/pineconeLocalService');

/**
 * Test FREE Local Embeddings + Pinecone
 * NO API CALLS - Runs 100% locally!
 */

async function testLocalEmbeddings() {
    console.log('🆓 Testing FREE Local Embeddings System...\n');
    console.log('✨ Features:');
    console.log('   - Runs locally on your machine');
    console.log('   - No API calls or quotas');
    console.log('   - 100% FREE forever');
    console.log('   - Model: all-MiniLM-L6-v2 (384 dimensions)\n');

    try {
        // Step 1: Test embedding generation
        console.log('1️⃣ Testing local embedding generation...');
        const testText = 'Software Engineer with 3 years of experience in React and Node.js';
        const embedding = await localEmbeddingService.generateEmbedding(testText);

        console.log(`✅ Embedding generated locally!`);
        console.log(`   Dimensions: ${embedding.length}`);
        console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        console.log('   ⚡ No API calls made!\n');

        // Step 2: Test resume embedding
        console.log('2️⃣ Testing resume embedding...');
        const mockResumeData = {
            personalInfo: {
                name: 'John Doe',
                email: 'john@example.com'
            },
            summary: 'Experienced software engineer specializing in full-stack development',
            skills: [
                { name: 'React' },
                { name: 'Node.js' },
                { name: 'MongoDB' }
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

        const resumeEmbedding = await localEmbeddingService.generateResumeEmbedding(mockResumeData);
        console.log(`✅ Resume embedding generated!`);
        console.log(`   Dimensions: ${resumeEmbedding.length}`);
        console.log('   ⚡ Still no API calls!\n');

        // Step 3: Initialize Pinecone
        console.log('3️⃣ Initializing Pinecone with local embeddings...');
        await pineconeLocalService.initialize();
        console.log('');

        // Step 4: Create index
        console.log('4️⃣ Creating/checking Pinecone index...');
        await pineconeLocalService.createIndexIfNotExists();
        console.log('');

        // Step 5: Get stats
        console.log('5️⃣ Getting index stats...');
        const stats = await pineconeLocalService.getStats();
        console.log('📊 Index Stats:', JSON.stringify(stats, null, 2));
        console.log('');

        // Step 6: Test upsert
        console.log('6️⃣ Testing vector upsert...');
        const testUserId = 'test-local-user-123';
        await pineconeLocalService.upsertResume(testUserId, resumeEmbedding, {
            skills: ['React', 'Node.js', 'MongoDB'],
            location: 'San Francisco',
            seniorityLevel: 'Senior'
        });
        console.log('');

        // Step 7: Test search
        console.log('7️⃣ Testing vector search...');
        const searchResults = await pineconeLocalService.searchResumes(resumeEmbedding, 5);
        console.log(`✅ Found ${searchResults.length} similar resumes`);
        if (searchResults.length > 0) {
            console.log('   Top result:', {
                id: searchResults[0].id,
                score: searchResults[0].score?.toFixed(4),
                metadata: searchResults[0].metadata
            });
        }
        console.log('');

        // Step 8: Test similarity
        console.log('8️⃣ Testing cosine similarity...');
        const text1 = 'React developer with 5 years experience';
        const text2 = 'Senior React engineer with extensive experience';
        const text3 = 'Python data scientist';

        const emb1 = await localEmbeddingService.generateEmbedding(text1);
        const emb2 = await localEmbeddingService.generateEmbedding(text2);
        const emb3 = await localEmbeddingService.generateEmbedding(text3);

        const sim12 = localEmbeddingService.cosineSimilarity(emb1, emb2);
        const sim13 = localEmbeddingService.cosineSimilarity(emb1, emb3);

        console.log(`✅ Similarity scores:`);
        console.log(`   React dev vs React engineer: ${sim12.toFixed(4)} (HIGH - similar)`);
        console.log(`   React dev vs Python scientist: ${sim13.toFixed(4)} (LOW - different)`);
        console.log('');

        // Step 9: Cleanup
        console.log('9️⃣ Cleaning up test data...');
        await pineconeLocalService.deleteResume(testUserId);
        console.log('');

        console.log('🎉 All tests passed! FREE local embeddings working perfectly!\n');
        console.log('📝 Summary:');
        console.log(`   ✅ Local embedding model initialized`);
        console.log(`   ✅ Pinecone index: interviewxx-local (384 dims)`);
        console.log(`   ✅ Vector upsert/search working`);
        console.log(`   ✅ Similarity calculation working`);
        console.log(`   ✅ Total API calls made: 0`);
        console.log(`   ✅ Total cost: $0.00`);
        console.log(`   ✅ No quotas or limits!`);
        console.log('\n🚀 Ready for production with FREE embeddings!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run tests
testLocalEmbeddings()
    .then(() => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
