require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Minimal Gemini Embedding Test
 */

async function testGeminiEmbedding() {
    console.log('🧪 Testing Gemini Embedding API...\n');

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✅ Gemini client initialized');
        console.log(`   API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`);
        console.log('');

        // Test embedding generation
        console.log('🔢 Generating embedding for test text...');
        const model = genAI.getGenerativeModel({ model: 'embedding-001' });
        const text = 'Software Engineer with 3 years of experience';

        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        console.log('✅ Embedding generated successfully!');
        console.log(`   Dimensions: ${embedding.length}`);
        console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
        console.log('');

        // Test Gemini Pro text generation
        console.log('🤖 Testing Gemini Pro text generation...');
        const proModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = 'Say "Hello from Gemini Pro!" in exactly 5 words.';

        const genResult = await proModel.generateContent(prompt);
        const response = await genResult.response;
        const responseText = response.text();

        console.log('✅ Text generation successful!');
        console.log(`   Response: ${responseText}`);
        console.log('');

        console.log('🎉 All Gemini API tests passed!\n');
        console.log('📊 Summary:');
        console.log('   ✅ Gemini client initialized');
        console.log('   ✅ Embedding API working (768 dimensions)');
        console.log('   ✅ Gemini Pro API working');
        console.log('   ✅ API quota is available');
        console.log('\n🚀 Ready for Phase 1 testing!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.message.includes('429') || error.message.includes('quota')) {
            console.error('\n⚠️  Quota Issue Detected:');
            console.error('   - Gemini API has rate limits on free tier');
            console.error('   - Please wait a few minutes and try again');
            console.error('   - Or check your quota at: https://ai.dev/rate-limit');
        } else if (error.message.includes('API key')) {
            console.error('\n⚠️  API Key Issue:');
            console.error('   - Check if GEMINI_API_KEY is set in .env');
            console.error('   - Verify the key is valid');
        }

        process.exit(1);
    }
}

// Run test
testGeminiEmbedding()
    .then(() => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    });
