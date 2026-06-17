require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try different model names
        const modelsToTry = [
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-2.0-flash-exp',
            'models/gemini-1.5-flash-latest',
            'models/gemini-1.5-flash',
            'models/gemini-pro'
        ];

        console.log('Testing available models...\n');

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say "Hello"');
                const response = await result.response;
                const text = response.text();
                console.log(`✅ ${modelName} - WORKS! Response: ${text.substring(0, 50)}`);
                break; // Found a working model
            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message.substring(0, 100)}`);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
