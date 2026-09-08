const GrammarRound = require('../models/GrammarRound'); // adjust path if needed
const Job = require('../models/JobSchema'); // for validation if needed

const Round = require('../models/RoundSchema');
// Show form page
exports.showAddGrammarRoundForm = (req, res) => {
  const jobId = req.params.jobId;
  res.render('rounds/grammarForm', { jobId });
};

// Handle form submission
exports.createGrammarRound = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    const job = await Job.findById(jobId);
    const {
      title,
      timeLimit,
      totalMarks,
      passingMarks,
      order,
      instructions,
      questions
    } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).send('❌ No valid grammar questions submitted');
    }

    const questionList = questions.map(q => {
      const optionsArray = Array.isArray(q.options)
        ? q.options.map(opt => opt.trim()).filter(opt => opt !== '')
        : [];

      return {
        question: q.question?.trim() || '',
        options: optionsArray,
        correctAnswer: q.correctAnswer?.trim() || '',
        explanation: q.explanation?.trim() || '',
        difficulty: q.difficulty || 'Easy',
        category: q.category || 'Misc'
      };
    });

    // 1. Save GrammarRound
    const grammarRound = new GrammarRound({
      createdBy: req.user._id,
      job: jobId,
      title: title?.trim() || 'Grammar Round',
      questions: questionList,
      timeLimit,
      totalMarks,
      passingMarks
    });

    const savedGrammarRound = await grammarRound.save();

    // 2. Save generic Round
    const round = new Round({
      job: jobId,
      roundType: 'Grammar',
      title: title?.trim() || 'Grammar Round',
      instructions: instructions || '',
      duration: timeLimit,
      roundContentType: 'GrammarRound',
      roundContent: savedGrammarRound._id,
      order
    });

    await round.save();

    // 3. Update job
    job.rounds.push(round._id);
    job.roundsAdded = (job.roundsAdded || 0) + 1;
    await job.save();

    // 4. Redirect
    if (job.roundsAdded < job.totalRounds) {
      res.redirect(`/rounds/select-round/${jobId}`);
    } else {
      res.send('✅ All rounds added successfully!');
    }

  } catch (error) {
    console.error('❌ Error creating grammar round:', error);
    res.status(500).send('❌ Error creating grammar round');
  }
};

exports.editGrammarRoundForm = async (req, res) => {
  const roundId = req.params.roundId;

  const round = await Round.findById(roundId);
  const grammarRound = await GrammarRound.findById(round.roundContent);

  if (!grammarRound) return res.status(404).send('Round not found');

  res.render('rounds/editGrammarRound', { round, grammarRound });
};

exports.updateGrammarRound = async (req, res) => {
  const roundId = req.params.roundId;
  const grammarData = req.body;

  const round = await Round.findById(roundId);
  const grammarRound = await GrammarRound.findById(round.roundContent);

  grammarRound.title = grammarData.title;
  grammarRound.questions = grammarData.questions;
  grammarRound.timeLimit = grammarData.timeLimit;
  await grammarRound.save();

  round.title = grammarData.title;
  round.duration = grammarData.timeLimit;
  round.instructions = grammarData.instructions;
  await round.save();

  res.redirect(`/jobs/${round.job}`);
};
