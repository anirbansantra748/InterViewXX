const DSARound = require('../models/DSARound');
const Round = require('../models/RoundSchema');
const Job = require('../models/JobSchema');

exports.getDsaForm = async (req, res) => {
    const { jobId } = req.params;
    try {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).send("Job not found");
        console.log("dsa round rendered:", job);
        res.render('rounds/dsaForm', { job,jobId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.postDsaForm = async (req, res) => {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    const { title, duration, order } = req.body;
    const questions = req.body.questions; // This is an array of question objects

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).send('No questions provided');
    }

    try {
        // Store each question in a subdocument
        const dsaRound = new DSARound({
            createdBy: req.user._id,
            job: jobId,
            title,
            timeLimit: duration,
            questions: questions.map(q => ({
                title: q.title,
                problemStatement: q.problemStatement,
                inputFormat: q.inputFormat,
                outputFormat: q.outputFormat,
                constraints: q.constraints,
                sampleInput: q.sampleInput,
                sampleOutput: q.sampleOutput,
                solution: q.solution
            }))
        });

        const savedDsaRound = await dsaRound.save();

        // Create round wrapper
        const round = new Round({
            job: jobId,
            roundType: 'DSA',
            title,
            duration,
            order,
            roundContentType: 'DSARound',
            roundContent: savedDsaRound._id
        });

        await round.save();

        // Push round into job
        job.rounds.push(round._id);
        job.roundsAdded = (job.roundsAdded || 0) + 1;
        await job.save();

        // Redirect based on totalRounds
        if (job.roundsAdded < job.totalRounds) {
            res.redirect(`/rounds/select-round/${jobId}`);
        } else {
            res.send('✅ All rounds added successfully!');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Error saving DSA round');
    }
};
