const Job = require('../models/JobSchema');
const Recruiter = require('../models/RecruterSchema');
const Round = require('../models/RoundSchema');
const User = require('../models/UserSchema')

const McqRound = require('../models/MCQRound');
const DsaRound = require('../models/DSARound');
const GrammarRound = require('../models/GrammarRound');
const AptiRound = require('../models/AptitudeRound');
const isAdmin = require('../middlewares/isAdmin');

exports.allJobs = async (req, res) => {
  try {
    const { search = '', jobType = '', mode = '' } = req.query;
    const filterQuery = {};

    // Basic search filters
    if (search) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const safeSearch = escapeRegex(search);
      filterQuery.$or = [
        { title: new RegExp(safeSearch, 'i') },
        { company: new RegExp(safeSearch, 'i') },
        { location: new RegExp(safeSearch, 'i') }
      ];
    }

    if (jobType) filterQuery.jobType = jobType;
    if (mode) filterQuery.mode = mode;

    const jobs = await Job.find(filterQuery).sort({ createdAt: -1 });

    // Recommended Jobs by user skills
    const user = await User.findById(req.user?._id);
    let recommendedJobs = [];

    if (user?.resumeExtractedData?.skills?.length) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const skillRegexes = user.resumeExtractedData.skills.map(skill =>
        new RegExp(escapeRegex(skill), 'i')
      );

      recommendedJobs = await Job.find({
        $or: [
          { title: { $in: skillRegexes } },
          { description: { $in: skillRegexes } },
          { skills: { $in: skillRegexes } }
        ]
      }).limit(10);
    }

    res.render('jobs/jobs', {
      jobs,
      recommendedJobs,
      user,
      query: req.query
    });

  } catch (err) {
    console.error('❌ Error in job filtering:', err.message);
    res.status(500).send('Server Error');
  }
};

// Route to show job details
// exports.jobDtails = async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id)
//       .populate({
//         path: 'rounds',
//         populate: {
//           path: 'roundContent'
//         }
//       });

//     if (!job) return res.status(404).send('Job not found');

//     const currentUserId = req.user?._id?.toString();
//     const isOwner = req.user && job.createdBy.equals(req.user._id);

//     // Sort rounds by order
//     job.rounds.sort((a, b) => a.order - b.order);

//     // 🔐 Logic to lock/unlock rounds based on qualification
//     let unlockNext = true; // First round is always unlocked

//     job.rounds.forEach((round, index) => {
//       let isQualified = false;

//       // Check if current user has qualified this round
//       if (Array.isArray(round.isqualify)) {
//         isQualified = round.isqualify.some(q =>
//           q.user?.toString() === currentUserId && q.qualified === true
//         );
//       }

//       // Set `qualified` property on round for EJS
//       round.qualified = isQualified;

//       // Set lock/unlock based on previous round qualification
//       round.isLocked = !unlockNext;

//       // If this round was passed, allow the next to unlock
//       unlockNext = isQualified;
//     });

//     const recruiter = await Recruiter.findById(job.createdBy);

//     return res.render('jobs/jobdetails', {
//       job,
//       isOwner,
//       currentUserId // optional, if you want to use in EJS
//     });

//   } catch (err) {
//     console.error("❌ jobDetails error:", err);
//     return res.status(500).send("Internal Server Error");
//   }
// };

exports.jobDtails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'rounds',
        populate: {
          path: 'roundContent'
        }
      });

    if (!job) return res.status(404).send('Job not found');

    const currentUserId = req.user?._id?.toString();

    const isOwner = req.user && job.createdBy && job.createdBy.equals(req.user._id);

    // Sort rounds by order
    if (job.rounds?.length) {
      job.rounds.sort((a, b) => a.order - b.order);
    }

    // 🔐 Lock/unlock round logic
    let unlockNext = true;

    job.rounds.forEach((round) => {
      let isQualified = false;

      if (Array.isArray(round.isqualify)) {
        isQualified = round.isqualify.some(q =>
          q.user?.toString() === currentUserId && q.qualified === true
        );
      }

      round.qualified = isQualified;
      round.isLocked = !unlockNext;

      unlockNext = isQualified;
    });

    const recruiter = job.createdBy
      ? await Recruiter.findById(job.createdBy)
      : null;

    return res.render('jobs/jobdetails', {
      job,
      isOwner,
      currentUserId
    });

  } catch (err) {
    console.error("❌ jobDetails error:", err);
    return res.status(500).send("Internal Server Error");
  }
};


exports.createJobForm = (req, res) => {
  console.log("Rendering create job form");
    res.render('jobs/createJob');
};

exports.createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            company,
            location,
            salaryRange,
            jobType,
            mode,
            skillsRequired,
            experienceRequired,
            deadlineDate,
            responsibilitiesSkills,
            responsibilitiesTasks,
            requirements,
            totalRounds
        } = req.body;

        // Create job
        const job = new Job({
            title,
            description,
            company,
            location,
            salaryRange,
            jobType,
            totalRounds,
            mode,
            skillsRequired: skillsRequired?.split(',').map(s => s.trim()),
            experienceRequired,
            createdBy: req.user._id,
            deadlineDate,
            responsibilities: {
                skills: responsibilitiesSkills?.split(',').map(s => s.trim()),
                tasks: responsibilitiesTasks?.split(',').map(t => t.trim())
            },
            requirements: requirements?.split(',').map(r => r.trim())
        });

        await job.save();

        // ✅ Redirect to round selection (FIXED)
        res.redirect(`/rounds/select-round/${job._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating job");
    }
};

// GET: /jobs/edit/:id
exports.editJobForm = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).send("Job not found");
  res.render('jobs/edit', { job });
};

// POST: /jobs/edit/:id
exports.updateJob = async (req, res) => {
  try {
    const {
      title, description, company, location, salaryRange,
      jobType, mode, skillsRequired, experienceRequired,
      deadlineDate, responsibilitiesSkills, responsibilitiesTasks, requirements,
      totalRounds, status, rounds, createdBy
    } = req.body;

    const updatedJob = {
      title,
      description,
      company,
      location,
      salaryRange,
      jobType,
      mode,
      experienceRequired,
      deadlineDate,
      totalRounds: Number(totalRounds),
      status,
      createdBy,

      skillsRequired: skillsRequired?.split(',').map(s => s.trim()),

      responsibilities: {
        skills: responsibilitiesSkills?.split(',').map(s => s.trim()),
        tasks: responsibilitiesTasks?.split(',').map(t => t.trim())
      },

      requirements: requirements?.split(',').map(r => r.trim()),

      rounds: rounds?.split(',').map(r => r.trim())  // convert string to ObjectIds if needed
    };

    await Job.findByIdAndUpdate(req.params.id, updatedJob);
    res.redirect(`/jobs/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error updating job");
  }
};


// GET: /jobs/delete/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).send("Job not found");
    console.log(`Deleting job: ${job.title}`);
    // Remove associated rounds
    await Round.deleteMany({ job: job._id });

    // Remove job
    await Job.findByIdAndDelete(req.params.id);

    res.redirect('/jobs');
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error deleting job");
  }
};

exports.searchJobs = async (req, res) => {
  try {
    const { search = '', jobType = '', mode = '', skills = '' } = req.query;
    const filterQuery = {};
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 🔍 Basic search filters
    if (search) {
      const safeSearch = escapeRegex(search);
      filterQuery.$or = [
        { title: new RegExp(safeSearch, 'i') },
        { company: new RegExp(safeSearch, 'i') },
        { location: new RegExp(safeSearch, 'i') }
      ];
    }

    if (jobType) filterQuery.jobType = jobType;
    if (mode) filterQuery.mode = mode;

    // 🧠 Skills-based search (manual)
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const skillRegexes = skillArray.map(skill => new RegExp(escapeRegex(skill), 'i'));

      filterQuery.$or = [
        ...(filterQuery.$or || []),
        { title: { $in: skillRegexes } },
        { description: { $in: skillRegexes } },
        { skills: { $in: skillRegexes } }
      ];
    }

    const jobs = await Job.find(filterQuery).sort({ createdAt: -1 });

    // 👤 Auto recommendations from user's extracted resume skills
    const user = await User.findById(req.user?._id);
    let recommendedJobs = [];

    if (user?.resumeExtractedData?.skills?.length) {
      const skillRegexes = user.resumeExtractedData.skills.map(skill =>
        new RegExp(escapeRegex(skill), 'i')
      );

      recommendedJobs = await Job.find({
        $or: [
          { title: { $in: skillRegexes } },
          { description: { $in: skillRegexes } },
          { skills: { $in: skillRegexes } }
        ]
      }).limit(10);
    }

    return res.render('jobs/jobs', {
      jobs,
      recommendedJobs,
      user,
      query: req.query
    });

  } catch (err) {
    console.error("❌ Error in searchJobs:", err);
    return res.status(500).send("Something went wrong while searching jobs.");
  }
};
