const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    companyDetails: {
        name: String,
        website: String,
        description: String,
        location: String,
        industry: String,
        size: String,
    },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    
    designation: String,

    jobsPosted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],

    Rounds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    }]
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
