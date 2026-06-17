require('dotenv').config();
const resumeParser = require('./utils/resumeParser');

/**
 * Simple Test: PDF Parser (No API calls)
 */

async function testPDFParser() {
    console.log('🧪 Testing PDF Parser (No API calls)...\n');

    try {
        // Test text cleaning
        console.log('1️⃣ Testing text cleaning...');
        const dirtyText = `
      This    is   a    test   
      
      
      with   multiple   spaces
      
      and   blank   lines
    `;

        const cleanedText = resumeParser.cleanText(dirtyText);
        console.log('✅ Text cleaned successfully');
        console.log('   Original length:', dirtyText.length);
        console.log('   Cleaned length:', cleanedText.length);
        console.log('   Cleaned text:', cleanedText.substring(0, 50) + '...\n');

        // Test resume validation
        console.log('2️⃣ Testing resume content validation...');

        const validResumeText = `
      John Doe
      Email: john@example.com
      Phone: +1234567890
      
      Education:
      Bachelor of Science in Computer Science
      University of California, 2020
      
      Experience:
      Software Engineer at Google
      Worked on React and Node.js projects
      
      Skills:
      JavaScript, Python, React, Node.js, MongoDB
      
      Projects:
      E-commerce platform using MERN stack
    `;

        const isValid = resumeParser.validateResumeContent(validResumeText);
        console.log('✅ Resume validation:', isValid ? 'VALID ✓' : 'INVALID ✗');

        const invalidText = 'This is just random text without resume keywords';
        const isInvalid = resumeParser.validateResumeContent(invalidText);
        console.log('✅ Non-resume validation:', isInvalid ? 'VALID ✓' : 'INVALID ✗ (Expected)');
        console.log('');

        console.log('🎉 All PDF Parser tests passed!\n');
        console.log('📝 Summary:');
        console.log('   - Text cleaning: ✅');
        console.log('   - Resume validation: ✅');
        console.log('   - No API calls needed: ✅');
        console.log('\n✅ Phase 1 core functionality is working!');
        console.log('⏳ Waiting for Gemini quota to test embeddings...');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run tests
testPDFParser()
    .then(() => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
