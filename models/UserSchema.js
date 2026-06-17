const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ["user", "recruiter"], default: "user" },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date },
  gender: { type: String },
  phone: { type: String },
  location: {
    city: String,
    state: String,
    country: String,
  },
  profileImage: { url: String, filename: String },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  resumeFile: { url: String, filename: String },
  resumeExtractedData: {
    // Personal Info (AI-extracted)
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedIn: String,
      github: String,
      portfolio: String,
    },

    // Education (Enhanced)
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: String,
      endYear: String,
      gpa: Number,
      achievements: [String],
    }],

    // Legacy college details (keep for backward compatibility)
    collegeDetails: {
      collegeName: String,
      degree: String,
      startYear: String,
      endYear: String,
      cgpa: String,
    },

    // Skills (Enhanced with categories and levels)
    skills: [{
      name: String,
      category: String, // Flexible: Technical, Soft, Language, Domain, DevOps, Cloud, Database, etc.
      level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    }],

    // Experience (Enhanced)
    experience: [{
      company: String,
      title: String,
      position: String, // Legacy field
      duration: String,
      description: String,
      responsibilities: [String],
      technologies: [String],
      startDate: String,
      endDate: String,
      type: { type: String, enum: ["Internship", "Full-time", "Part-time", "Contract"], default: "Internship" },
      mode: { type: String, enum: ["Remote", "On-site", "Hybrid"], default: "Remote" },
      role: String,
    }],

    // Projects (Enhanced)
    projects: [{
      name: String,
      title: String, // Legacy field
      description: String,
      technologies: [String],
      url: String,
      githubUrl: String,
      links: {
        github: String,
        liveSite: String,
      },
      role: String,
      impact: String,
    }],

    // Certifications (Enhanced)
    certifications: [{
      name: String,
      title: String, // Legacy field
      issuer: String,
      dateIssued: String,
      expiryDate: String,
      credentialUrl: String,
      credentialId: String,
      link: String, // Legacy field
    }],

    // Languages
    languages: [{
      name: String,
      proficiency: { type: String, enum: ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'] },
    }],

    // Awards and Hobbies (Legacy)
    awardsAndHobbies: [{
      title: String,
      description: String,
      link: String,
    }],

    // AI-Generated Summary
    summary: String,

    // AI Metadata
    aiMetadata: {
      parseConfidence: Number, // 0-100
      extractedAt: Date,
      modelUsed: String,
      seniorityLevel: String, // Junior/Mid/Senior/Lead/Executive
      industryFit: [String],
      roleMatches: [String],
    },
  },

  // Vector Embedding Reference
  vectorEmbedding: {
    id: String, // Pinecone vector ID
    namespace: String,
    createdAt: Date,
  },
  portfolioLinks: {
    github: String,
    linkedin: String,
    portfolio: String,
  },
  appliedJobs: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    status: { type: String, enum: ["Applied", "Shortlisted", "Rejected", "Selected"], default: "Applied" },
    appliedAt: { type: Date, default: Date.now },
  }],

  // ✅ Question solving system
  solvedQuestions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    solvedAt: { type: Date, default: Date.now },
    timeTakenInSeconds: Number,
    isCorrect: Boolean,
  }],

  // ✅ For green-dot heatmap
  solvedDates: {
    type: Map,
    of: Number,
    default: {},
  },

  // ✅ Stats
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastSolvedDate: Date,

  // 🧠 Optional logs
  activityLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed,
  }],

  isAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
