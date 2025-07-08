// controllers/helpers/roundEvaluator.js

exports.handleMCQSubmission = (round, answers) => {
  let correct = 0;

  round.roundContent.questions.forEach(q => {
    if (answers[q._id] && answers[q._id] === q.correctAnswer) {
      correct++;
    }
  });

  return {
    total: round.roundContent.questions.length,
    correct,
    score: correct * 1, // or any logic
  };
};

exports.handleGrammarSubmission = (grammarRound, answers) => {
  let correct = 0;

  grammarRound.questions.forEach(q => {
    if (answers[q._id] && answers[q._id] === q.correctAnswer) {
      correct++;
    }
  });

  return {
    total: grammarRound.questions.length,
    correct,
    score: correct * 1,
  };
};


exports.handleDSASubmission = (round, answers) => {
  // Just store the answers, no evaluation
  return {
    message: 'DSA submission stored. Will be manually reviewed.',
    answers,
  };
};
