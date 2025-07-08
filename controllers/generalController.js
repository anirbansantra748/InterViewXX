const GeneralRound = require('../models/generalQuestion');
const Job = require('../models/JobSchema'); // if you want to verify job exists

// Show the form to add general round
exports.showGeneralForm = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    res.render('rounds/generalForm', { jobId });
  } catch (err) {
    console.error('Error rendering general form:', err);
    res.status(500).send('Server Error');
  }
};

// Handle POST request to create a general round
exports.createGeneralRound = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { title, questions, totalMarks, passingMarks, timeLimit } = req.body;

    const newRound = new GeneralRound({
      job: jobId,
      createdBy: req.user._id, // assuming authentication middleware sets req.user
      title,
      questions,
      totalMarks,
      passingMarks,
      timeLimit
    });

    await newRound.save();

    res.redirect(`/job/${jobId}`); // Redirect back to job or dashboard
  } catch (err) {
    console.error('Error creating General Round:', err);
    res.status(500).send('Failed to create general round.');
  }
};
