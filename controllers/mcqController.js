const MCQRound = require('../models/MCQRound'); // import the schema
const Round = require('../models/RoundSchema');
const Job = require('../models/JobSchema');
const DSARound = require('../models/DSARound');


exports.getMcqForm = async (req, res) => {
    const { jobId } = req.params;
    try {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).send("Job not found");

        res.render('rounds/mcqForm', { job });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.postMcqForm = async (req, res) => {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    const { title, duration, order } = req.body;

    try {
        const rawQuestions = req.body.questions; // Array of questions

        const questionList = rawQuestions.map(q => {
            const optionsArray = q.options
                .split(',')
                .map(opt => opt.trim())
                .filter(opt => opt !== ''); // Remove empty options

            const options = optionsArray.map(opt => ({
                text: opt,
                isCorrect: opt === q.correctAnswer.trim()
            }));

            const tagsArray = typeof q.tags === 'string'
                ? q.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                : [];

            return {
                questionText: q.questionText.trim(),
                options: options,
                explanation: q.explanation?.trim() || '',
                difficulty: q.difficulty || 'Medium',
                tags: tagsArray
            };
        });

        const mcqRound = new MCQRound({
            createdBy: req.user._id,
            job: jobId,
            title,
            questions: questionList,
            timeLimit: duration
        });

        const savedMcqRound = await mcqRound.save();

        const round = new Round({
            job: jobId,
            roundType: 'MCQ',
            title,
            duration,
            order,
            roundContentType: 'MCQRound',
            roundContent: savedMcqRound._id
        });

        await round.save();

        job.rounds.push(round._id);
        job.roundsAdded = (job.roundsAdded || 0) + 1;
        await job.save();

        if (job.roundsAdded < job.totalRounds) {
            res.redirect(`/rounds/select-round/${jobId}`);
        } else {
            res.send('✅ All rounds added successfully!');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Error saving MCQ round');
    }
};
