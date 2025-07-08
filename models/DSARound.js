const mongoose = require('mongoose');

const dsaQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    problemStatement: { type: String, required: true },
    inputFormat: { type: String },
    outputFormat: { type: String },
    constraints: { type: String },
    sampleInput: { type: String },
    sampleOutput: { type: String },
    solution: { type: String, required: true }
});

const dsaRoundSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    title: { type: String, required: true },
    questions: [dsaQuestionSchema],
    passingMarks: Number,
    timeLimit: { type: Number, default: 30 } // in minutes
}, { timestamps: true });

module.exports = mongoose.model('DSARound', dsaRoundSchema);
