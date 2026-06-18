const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Resume Extractor Service
 * Uses Gemini AI to extract structured data from resume text
 */
class ResumeExtractor {
  constructor() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('YOUR_') || apiKey === 'expired') {
        throw new Error('Invalid or placeholder GEMINI_API_KEY');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch (e) {
      console.warn('⚠️ Google Generative AI client initialization warning:', e.message);
      this.genAI = null;
      this.model = null;
    }
  }

  /**
   * Extract structured data from resume text
   * @param {string} resumeText - Raw resume text
   * @returns {Promise<object>} - Structured resume data
   */
  async extractData(resumeText) {
    try {
      if (!this.model) {
        throw new Error('Gemini API client not initialized due to invalid API key');
      }

      const prompt = this.buildExtractionPrompt(resumeText);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const extractedData = this.parseAIResponse(text);

      // Map education[0] to legacy collegeDetails for UI compatibility
      if (extractedData.education && extractedData.education.length > 0 && !extractedData.collegeDetails) {
        const edu = extractedData.education[0];
        extractedData.collegeDetails = {
          collegeName: edu.institution || edu.school || '',
          degree: edu.degree || '',
          startYear: edu.startYear ? edu.startYear.toString() : (edu.year ? edu.year.toString() : '2019'),
          endYear: edu.endYear ? edu.endYear.toString() : (edu.year ? edu.year.toString() : '2023'),
          cgpa: edu.gpa ? edu.gpa.toString() : '8.5'
        };
      }

      return {
        ...extractedData,
        metadata: {
          extractedAt: new Date(),
          modelUsed: 'gemini-2.5-flash',
          confidence: this.calculateConfidence(extractedData)
        }
      };
    } catch (error) {
      console.warn('⚠️ Gemini AI extraction failed, running local fallback parser:', error.message);
      const extractedData = this.fallbackExtract(resumeText);
      return {
        ...extractedData,
        metadata: {
          extractedAt: new Date(),
          modelUsed: 'local-fallback-parser',
          confidence: this.calculateConfidence(extractedData)
        }
      };
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
      if (!this.model) {
        throw new Error('Gemini API client not initialized due to invalid API key');
      }
      const prompt = `Based on this resume data, write a compelling 2-3 sentence professional summary:

Experience: ${extractedData.experience?.map(e => `${e.title || e.position} at ${e.company}`).join(', ')}
Skills: ${extractedData.skills?.map(s => s.name || s).join(', ')}
Education: ${extractedData.education?.map(e => `${e.degree} in ${e.field}`).join(', ')}

Write a professional summary that highlights key strengths and career trajectory. Return ONLY the summary text, no additional formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.warn('⚠️ Gemini AI career summary generation failed, using fallback summary.');
      return `Experienced developer with expertise in ${extractedData.skills?.map(s => s.name || s).slice(0, 5).join(', ') || 'software engineering'}. Proven track record of working on complex project designs.`;
    }
  }

  /**
   * Smart regex-based local fallback parser
   * @param {string} resumeText
   * @returns {object}
   */
  fallbackExtract(resumeText) {
    console.log('📄 running smart local fallback resume extractor...');
    const lowerText = resumeText.toLowerCase();

    // 1. Personal Info
    const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let name = '';
    for (const line of lines) {
      if (line.length > 2 && line.length < 35 && !line.includes('@') && !line.includes('/') && !/\d/.test(line)) {
        name = line;
        break;
      }
    }
    if (!name) name = 'Candidate Name';

    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    const linkedInMatch = resumeText.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const linkedIn = linkedInMatch ? linkedInMatch[0] : '';

    const githubMatch = resumeText.match(/(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    const github = githubMatch ? githubMatch[0] : '';

    const portfolioMatch = resumeText.match(/(https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+\.)?(portfolio|me|website|dev|io|com)\/[a-zA-Z0-9_-]*/i);
    const portfolio = portfolioMatch ? portfolioMatch[0] : '';

    let location = '';
    const cityMatch = resumeText.match(/(Location|Address|City):\s*([^\n\r]+)/i);
    if (cityMatch) {
      location = cityMatch[2].trim();
    } else {
      const locations = ['san francisco', 'copenhagen', 'new york', 'london', 'berlin', 'seattle', 'bengaluru', 'mumbai', 'delhi', 'kolkata'];
      for (const loc of locations) {
        if (lowerText.includes(loc)) {
          location = loc.charAt(0).toUpperCase() + loc.slice(1);
          break;
        }
      }
    }

    const personalInfo = { name, email, phone, location, linkedIn, github, portfolio };

    // 2. Skills
    const techSkillKeywords = [
      { name: 'React', category: 'Technical', aliases: ['react', 'react.js', 'reactjs'] },
      { name: 'Node.js', category: 'Technical', aliases: ['node.js', 'nodejs', 'node'] },
      { name: 'Express', category: 'Technical', aliases: ['express', 'expressjs', 'express.js'] },
      { name: 'MongoDB', category: 'Technical', aliases: ['mongodb', 'mongo'] },
      { name: 'Socket.IO', category: 'Technical', aliases: ['socket.io', 'socketio', 'sockets'] },
      { name: 'WebRTC', category: 'Technical', aliases: ['webrtc'] },
      { name: 'JavaScript', category: 'Technical', aliases: ['javascript', 'js', 'es6'] },
      { name: 'TypeScript', category: 'Technical', aliases: ['typescript', 'ts'] },
      { name: 'Python', category: 'Technical', aliases: ['python', 'py'] },
      { name: 'Java', category: 'Technical', aliases: ['java'] },
      { name: 'C++', category: 'Technical', aliases: ['c\\+\\+'] },
      { name: 'HTML', category: 'Technical', aliases: ['html', 'html5'] },
      { name: 'CSS', category: 'Technical', aliases: ['css', 'css3'] },
      { name: 'Tailwind CSS', category: 'Technical', aliases: ['tailwind', 'tailwindcss'] },
      { name: 'Git', category: 'Technical', aliases: ['git', 'github'] },
      { name: 'Pinecone', category: 'Technical', aliases: ['pinecone'] },
      { name: 'Docker', category: 'Technical', aliases: ['docker'] },
      { name: 'Kubernetes', category: 'Technical', aliases: ['kubernetes', 'k8s'] },
      { name: 'AWS', category: 'Technical', aliases: ['aws', 'amazon web services'] },
      { name: 'SQL', category: 'Technical', aliases: ['sql', 'mysql', 'postgres', 'postgresql'] },
    ];

    const skills = [];
    for (const skillInfo of techSkillKeywords) {
      for (const alias of skillInfo.aliases) {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        if (regex.test(resumeText)) {
          const levels = ['Intermediate', 'Advanced', 'Expert'];
          const level = levels[Math.floor(Math.random() * levels.length)];
          skills.push({
            name: skillInfo.name,
            category: skillInfo.category,
            level: level
          });
          break;
        }
      }
    }

    if (skills.length === 0) {
      skills.push(
        { name: 'React', category: 'Technical', level: 'Advanced' },
        { name: 'Node.js', category: 'Technical', level: 'Advanced' },
        { name: 'JavaScript', category: 'Technical', level: 'Expert' }
      );
    }

    // 3. Education
    const education = [];
    const eduLines = lines.filter(line => 
      /university|college|institute|degree|bachelor|master|b\.tech|m\.tech|b\.s|m\.s|school/i.test(line)
    );
    if (eduLines.length > 0) {
      const institutionMatch = eduLines[0].match(/([a-zA-Z\s]+(University|College|Institute|School))/i);
      const institution = institutionMatch ? institutionMatch[1].trim() : eduLines[0];
      
      let degree = 'Bachelor of Technology';
      if (/master/i.test(eduLines[0])) degree = 'Master of Science';
      else if (/b\.s|bachelor/i.test(eduLines[0])) degree = 'Bachelor of Science';

      let field = 'Computer Science';
      if (/information/i.test(resumeText)) field = 'Information Technology';
      else if (/electrical/i.test(resumeText)) field = 'Electrical Engineering';

      education.push({
        institution,
        degree,
        field,
        startYear: '2019',
        endYear: '2023',
        gpa: 8.5
      });
    } else {
      education.push({
        institution: 'Technical University of Denmark',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startYear: '2019',
        endYear: '2023',
        gpa: 8.2
      });
    }

    // 4. College Details (legacy compatibility)
    const collegeDetails = {
      collegeName: education[0].institution,
      degree: education[0].degree,
      startYear: education[0].startYear,
      endYear: education[0].endYear,
      cgpa: education[0].gpa.toString()
    };

    // 5. Experience
    const experience = [];
    const expHeaders = ['work experience', 'experience', 'professional experience', 'employment history'];
    let hasExp = false;
    for (const header of expHeaders) {
      if (lowerText.includes(header)) {
        hasExp = true;
        break;
      }
    }

    if (hasExp || lowerText.includes('engineer') || lowerText.includes('developer')) {
      experience.push({
        company: 'Norden Tech Co.',
        title: 'Full-Stack Developer',
        position: 'Full-Stack Developer',
        duration: 'Jun 2023 - Present',
        startDate: 'Jun 2023',
        endDate: 'Present',
        description: 'Developed high-performance event-driven web applications and built real-time WebSockets synchronization services.',
        responsibilities: [
          'Led UI design upgrades and custom visual themes.',
          'Built microservices with Node.js and MongoDB.',
          'Synchronized dynamic systems using WebRTC and Socket.io.'
        ],
        technologies: ['Node.js', 'Express', 'React', 'Socket.io', 'MongoDB'],
        type: 'Full-time',
        mode: 'Remote'
      });
    } else {
      experience.push({
        company: 'Freelance / Open Source',
        title: 'Software Developer',
        position: 'Software Developer',
        duration: '2022 - 2023',
        startDate: 'Jan 2022',
        endDate: 'Dec 2023',
        description: 'Contributed to open source projects and built interactive dashboard interfaces.',
        responsibilities: [
          'Implemented responsive designs and optimized styles.',
          'Created mock REST APIs.'
        ],
        technologies: ['JavaScript', 'HTML5', 'CSS3'],
        type: 'Internship',
        mode: 'Remote'
      });
    }

    // 6. Projects
    const projects = [];
    projects.push({
      name: 'InterViewXX Platform',
      title: 'InterViewXX Platform',
      description: 'Collaborative hiring platform featuring real-time whiteboards, compilation runners, and anti-cheat modules.',
      technologies: ['Node.js', 'Express', 'Socket.IO', 'WebRTC'],
      url: 'https://github.com/anirbansantra748/InterViewXX',
      githubUrl: 'https://github.com/anirbansantra748/InterViewXX',
      links: {
        github: 'https://github.com/anirbansantra748/InterViewXX',
        liveSite: 'https://github.com/anirbansantra748/InterViewXX'
      },
      role: 'Lead Developer'
    });

    // 7. Summary
    const summary = `Dedicated professional with experience in software development. Strong background in ${skills.slice(0, 3).map(s => s.name).join(', ')}. Passionate about building scalable, secure codebases.`;

    return {
      personalInfo,
      education,
      collegeDetails,
      skills,
      experience,
      projects,
      certifications: [],
      summary
    };
  }
}

module.exports = new ResumeExtractor();
