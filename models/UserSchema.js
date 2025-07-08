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
    collegeDetails: {
      collegeName: String,
      degree: String,
      startYear: String,
      endYear: String,
      cgpa: String,
    },
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
      startDate: String,
      endDate: String,
      type: { type: String, enum: ["Internship", "Full-time"], default: "Internship" },
      mode: { type: String, enum: ["Remote", "On-site"], default: "Remote" },
      role: String,
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      links: {
        github: String,
        liveSite: String,
      },
    }],
    certifications: [{
      title: String,
      link: String,
    }],
    awardsAndHobbies: [{
      title: String,
      description: String,
      link: String,
    }],
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
