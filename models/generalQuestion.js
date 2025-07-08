const mongoose = require('mongoose');

const generalQuestionSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      },
      explanation: {
        type: String,
        default: ""
      },
      difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
      },
      category: {
        type: String,
        enum: ['HR', 'Behavioral', 'Technical', 'General'],
        default: 'General'
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('GeneralQuestion', generalQuestionSchema);
