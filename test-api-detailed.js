require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPI() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        console.log('API Key (first 20 chars):', process.env.GEMINI_API_KEY?.substring(0, 20));
        console.log('\nTrying models/gemini-pro...\n');

        const model = genAI.getGenerativeModel({
            model: 'models/gemini-pro'
        });

        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        const text = response.text();

        console.log('✅ SUCCESS! Response:', text);
    } catch (error) {
        console.error('❌ Full Error:', error);
        console.error('\nError Message:', error.message);
        console.error('\nError Status:', error.status);
    }
}

testAPI();
