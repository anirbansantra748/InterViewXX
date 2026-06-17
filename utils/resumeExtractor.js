const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Resume Extractor Service
 * Uses Gemini AI to extract structured data from resume text
 */
class ResumeExtractor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Extract structured data from resume text
   * @param {string} resumeText - Raw resume text
   * @returns {Promise<object>} - Structured resume data
   */
  async extractData(resumeText) {
    try {
      const prompt = this.buildExtractionPrompt(resumeText);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const extractedData = this.parseAIResponse(text);

      return {
        ...extractedData,
        metadata: {
          extractedAt: new Date(),
          modelUsed: 'gemini-2.5-flash',
          confidence: this.calculateConfidence(extractedData)
        }
      };
    } catch (error) {
      console.error('Error extracting resume data:', error.message);
      throw new Error(`Failed to extract resume data: ${error.message}`);
    }
  }

  /**
   * Build extraction prompt for Gemini
   * @param {string} resumeText - Raw resume text
   * @returns {string} - Prompt for AI
   */
  buildExtractionPrompt(resumeText) {
    return `You are an expert resume parser. Extract structured information from the following resume text and return it as a valid JSON object.

RESUME TEXT:
${resumeText}

Extract the following information and return ONLY a valid JSON object (no markdown, no explanations):

{
  "personalInfo": {
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, State/Country",
    "linkedIn": "LinkedIn URL",
    "github": "GitHub URL",
    "portfolio": "Portfolio URL"
  },
  "education": [
    {
      "institution": "University/College name",
      "degree": "Degree type (e.g., B.Tech, M.S.)",
      "field": "Field of study",
      "year": 2023,
      "gpa": 3.8
    }
  ],
  "experience": [
    {
      "company": "Company name",
      "title": "Job title",
      "duration": "Jan 2020 - Dec 2022",
      "responsibilities": ["Responsibility 1", "Responsibility 2"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "skills": [
    {
      "name": "Skill name",
      "category": "Technical|Soft|Language",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "url": "Project URL (if available)"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "year": 2023
    }
  ],
  "summary": "A brief 2-3 sentence career summary"
}

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown code blocks
2. If information is not found, use null or empty array []
3. Infer skill levels based on experience context
4. Extract ALL technologies mentioned
5. Be precise with dates and numbers
6. Normalize company/university names (proper capitalization)

JSON OUTPUT:`;
  }

  /**
   * Parse AI response and clean JSON
   * @param {string} aiResponse - Raw AI response
   * @returns {object} - Parsed JSON object
   */
  parseAIResponse(aiResponse) {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate and normalize
      return this.normalizeExtractedData(parsed);
    } catch (error) {
      console.error('Error parsing AI response:', error.message);
      console.error('Raw response:', aiResponse);

      // Return empty structure if parsing fails
      return this.getEmptyStructure();
    }
  }

  /**
   * Normalize extracted data
   * @param {object} data - Raw extracted data
   * @returns {object} - Normalized data
   */
  normalizeExtractedData(data) {
    return {
      personalInfo: data.personalInfo || {},
      education: Array.isArray(data.education) ? data.education : [],
      experience: Array.isArray(data.experience) ? data.experience : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      summary: data.summary || ''
    };
  }

  /**
   * Calculate extraction confidence score
   * @param {object} data - Extracted data
   * @returns {number} - Confidence score (0-100)
   */
  calculateConfidence(data) {
    let score = 0;

    // Personal info (30 points)
    if (data.personalInfo?.name) score += 10;
    if (data.personalInfo?.email) score += 10;
    if (data.personalInfo?.phone) score += 10;

    // Education (20 points)
    if (data.education?.length > 0) score += 20;

    // Experience (20 points)
    if (data.experience?.length > 0) score += 20;

    // Skills (20 points)
    if (data.skills?.length >= 3) score += 10;
    if (data.skills?.length >= 5) score += 10;

    // Projects (10 points)
    if (data.projects?.length > 0) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Get empty data structure
   * @returns {object}
   */
  getEmptyStructure() {
    return {
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: [],
      summary: ''
    };
  }

  /**
   * Generate AI career summary
   * @param {object} extractedData - Extracted resume data
   * @returns {Promise<string>} - AI-generated summary
   */
  async generateCareerSummary(extractedData) {
    try {
      const prompt = `Based on this resume data, write a compelling 2-3 sentence professional summary:

Experience: ${extractedData.experience?.map(e => `${e.title} at ${e.company}`).join(', ')}
Skills: ${extractedData.skills?.map(s => s.name).join(', ')}
Education: ${extractedData.education?.map(e => `${e.degree} in ${e.field}`).join(', ')}

Write a professional summary that highlights key strengths and career trajectory. Return ONLY the summary text, no additional formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating summary:', error.message);
      return '';
    }
  }
}

module.exports = new ResumeExtractor();
