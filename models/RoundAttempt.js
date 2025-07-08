const mongoose = require('mongoose');

const roundAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true
  },

  score: {
    type: Number,
    required: true
  },

  total: {
    type: Number,
    required: true
  },

  submittedAt: {
    type: Date,
    default: Date.now
  },

  answers: {
    type: Map,
    of: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('RoundAttempt', roundAttemptSchema);
