require('dotenv').config();

// Simple test using fetch
async function testGeminiAPI() {
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    console.log('Testing Gemini API with v1 endpoint...\n');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Say hello'
                    }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ ERROR');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
    }
}

testGeminiAPI();
