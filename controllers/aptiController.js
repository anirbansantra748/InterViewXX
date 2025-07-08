const AptitudeRound = require('../models/AptitudeRound');
const Round = require('../models/RoundSchema');
const Job = require('../models/JobSchema'); // If you want to verify job ID

// POST: Create Aptitude Round
exports.createAptitudeRound = async (req, res) => {
  const { title, timeLimit, totalMarks, passingMarks, questions, order } = req.body;
  const jobId = req.params.jobId;
  const recruiterId = req.user._id; // Use `req.recruiter` if using recruiter session

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).send('Job not found');

    const formattedQuestions = questions.map(q => {
      const optionsArray = typeof q.options === 'string'
        ? q.options.split(',').map(opt => opt.trim()).filter(Boolean)
        : q.options;

      return {
        question: q.question.trim(),
        options: optionsArray,
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation?.trim() || '',
        difficulty: q.difficulty || 'Medium',
        category: q.category || 'Misc'
      };
    });

    const newAptitudeRound = new AptitudeRound({
      createdBy: recruiterId,
      job: jobId,
      title,
      timeLimit,
      totalMarks,
      passingMarks,
      questions: formattedQuestions
    });

    const savedAptitude = await newAptitudeRound.save();

    const newRound = new Round({
      job: jobId,
      roundType: 'Aptitude',
      title,
      duration: timeLimit,
      order: order || job.roundsAdded + 1,
      roundContentType: 'AptitudeRound',
      roundContent: savedAptitude._id
    });

    await newRound.save();

    job.rounds.push(newRound._id);
    job.roundsAdded += 1;
    await job.save();

    // Redirect to next round selection or finish
    if (job.roundsAdded < job.totalRounds) {
      res.redirect(`/rounds/select-round/${jobId}`);
    } else {
      res.send('✅ All rounds added successfully!');
    }
  } catch (error) {
    console.error('❌ Error creating aptitude round:', error);
    res.status(500).send('Internal Server Error');
  }
};

// GET: Form to create aptitude round
exports.getAptitudeForm = (req, res) => {
  const jobId = req.params.jobId;
  res.render('rounds/aptiForm', { jobId });
};
