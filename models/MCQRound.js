const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true }
    }
  ],
  explanation: { type: String },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  tags: [String]
});

const mcqRoundSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  title: { type: String, default: 'MCQ Round' },
  questions: [mcqQuestionSchema], // supports multiple questions
  timeLimit: { type: Number, default: 30 },
  totalMarks: { type: Number },
  passingMarks: { type: Number }
});

module.exports = mongoose.model('MCQRound', mcqRoundSchema);
