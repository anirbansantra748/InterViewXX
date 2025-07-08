const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  number: { type: Number, required: true, unique: true },
  type: { type: String, required: true, enum: ["mcq", "saq"] },
  questionText: { type: String, required: true },
  options: [String], // Only for MCQ
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  tags: { type: [String], default: [] },
  points: { type: Number, default: 5 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ✅ Solved users
  solvedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      solvedAt: { type: Date, default: Date.now },
      isCorrect: Boolean,
    },
  ],

  // ✅ Optional explanation or reference
  explanation: {
    type: String,
    default: ""
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  version: { type: Number, default: 1 },
  isPublic: { type: Boolean, default: true }
});

module.exports = mongoose.model("Question", questionSchema);
