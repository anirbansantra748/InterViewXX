const pdfParse = require('pdf-parse');
const axios = require('axios');

/**
 * Resume Parser Service
 * Extracts raw text from PDF resumes
 */
class ResumeParser {
    /**
     * Parse PDF from URL (Cloudinary)
     * @param {string} pdfUrl - URL of the PDF file
     * @returns {Promise<{text: string, pages: number, info: object}>}
     */
    async parseFromUrl(pdfUrl) {
        try {
            // Download PDF as buffer
            const response = await axios.get(pdfUrl, {
                responseType: 'arraybuffer',
                timeout: 30000 // 30 second timeout
            });

            const buffer = Buffer.from(response.data);
            return await this.parseFromBuffer(buffer);
        } catch (error) {
            console.error('Error parsing PDF from URL:', error.message);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }

    /**
     * Parse PDF from buffer
     * @param {Buffer} buffer - PDF file buffer
     * @returns {Promise<{text: string, pages: number, info: object}>}
     */
    async parseFromBuffer(buffer) {
        try {
            const data = await pdfParse(buffer);

            return {
                text: this.cleanText(data.text),
                pages: data.numpages,
                info: data.info,
                metadata: {
                    parsedAt: new Date(),
                    wordCount: data.text.split(/\s+/).length
                }
            };
        } catch (error) {
            console.error('Error parsing PDF buffer:', error.message);
            throw new Error(`Failed to parse PDF buffer: ${error.message}`);
        }
    }

    /**
     * Clean extracted text
     * Remove extra whitespace, fix common OCR errors
     * @param {string} text - Raw extracted text
     * @returns {string} - Cleaned text
     */
    cleanText(text) {
        return text
            // Remove multiple spaces
            .replace(/\s+/g, ' ')
            // Remove multiple newlines
            .replace(/\n\s*\n/g, '\n')
            // Trim each line
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n')
            // Final trim
            .trim();
    }

    /**
     * Validate if text looks like a resume
     * @param {string} text - Extracted text
     * @returns {boolean}
     */
    validateResumeContent(text) {
        const lowerText = text.toLowerCase();

        // Check for common resume keywords
        const resumeKeywords = [
            'experience', 'education', 'skills', 'work',
            'university', 'college', 'project', 'email',
            'phone', 'linkedin', 'github'
        ];

        const keywordMatches = resumeKeywords.filter(keyword =>
            lowerText.includes(keyword)
        ).length;

        // Should have at least 3 resume keywords
        return keywordMatches >= 3;
    }
}

module.exports = new ResumeParser();
