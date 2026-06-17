require('dotenv').config();

// List available models
async function listModels() {
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

    console.log('Listing available Gemini models...\n');

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Available Models:\n');
            data.models.forEach(model => {
                if (model.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`- ${model.name}`);
                    console.log(`  Display Name: ${model.displayName}`);
                    console.log(`  Description: ${model.description}`);
                    console.log('');
                }
            });
        } else {
            console.log('❌ ERROR');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listModels();
