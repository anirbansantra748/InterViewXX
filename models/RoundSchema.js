const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },

    roundType: {
        type: String,
        enum: ['MCQ', 'DSA', 'Grammar', 'Aptitude', 'Voice', 'Interview'],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    instructions: {
        type: String,
        default: ''
    },

    duration: {
        type: Number, // in minutes
        required: true
    },

    roundContentType: {
        type: String,
        enum: ['MCQRound', 'DSARound', 'GrammarRound', 'VoiceRound', 'InterviewRound', 'AptitudeRound'],
        required: true
    },

    roundContent: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'roundContentType'
    },

    order: {
        type: Number,
        required: true
    },
    //add qualify students also add object id of useers
    isqualify: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        qualified: { type: Boolean, default: false }
    }],
    data: { type: mongoose.Schema.Types.Mixed }

}, { timestamps: true });

// Optional: ensure each round order is unique per job
roundSchema.index({ job: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Round', roundSchema);
