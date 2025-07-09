require('dotenv').config();
const Job = require('../models/JobSchema');
const User = require('../models/UserSchema')
const Round = require('../models/RoundSchema');
const DSARound = require('../models/DSARound')
const MCQRound = require('../models/MCQRound');
const GrammarRound = require('../models/GrammarRound');
const AptitudeRound = require('../models/AptitudeRound')
const axios = require("axios")
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

//submit round for all
// exports.submmitRound = async (req, res) => {
//   try {
//     const { roundId } = req.params;
//     const userId = req.user._id;
//     const { answers } = req.body;

//     console.log("▶️ Received roundId:", roundId);
//     console.log("▶️ User ID:", userId);

//     const round = await Round.findById(roundId).populate('roundContent');
//     if (!round) {
//       console.log("❌ Round not found in DB.");
//       return res.status(404).send('Round not found');
//     }

//     const roundContent = round.roundContent;
//     const roundType = round.roundContentType;
//     let score = 0;

//     if (!roundContent || !Array.isArray(roundContent.questions)) {
//       console.log("❌ Round content is malformed or missing questions.");
//       return res.status(500).send('Invalid round content');
//     }

//     // ✅ Scoring Logic
//     if (['MCQRound', 'GrammarRound', 'AptitudeRound'].includes(roundType)) {
//       for (const q of roundContent.questions) {
//         const userAns = answers[q._id];
//         const correctAns = q.correctAnswer || q.options?.find(opt => opt.isCorrect)?.text;

//         if (userAns && userAns.trim() === correctAns?.trim()) score++;
//       }
//     }

//     // ✅ DSA round logic using Gemini
//     if (roundType === 'DSARound') {
//       for (const q of roundContent.questions) {
//         const userCode = answers[q._id];

//         const prompt = `
// ### Problem:
// ${q.problemStatement}

// ### Input Format:
// ${q.inputFormat || 'N/A'}

// ### Output Format:
// ${q.outputFormat || 'N/A'}

// ### Constraints:
// ${q.constraints || 'N/A'}

// ### Sample Input:
// ${q.sampleInput || 'N/A'}

// ### Sample Output:
// ${q.sampleOutput || 'N/A'}

// ### User Code:
// ${userCode}

// ### Expected Output Logic:
// ${q.solution}

// ### Evaluation Prompt:
// Does the above code solve the given problem? Answer only 'Yes' or 'No' and a brief explanation.
//         `.trim();

//         const geminiRes = await axios.post(GEMINI_API_URL, {
//           contents: [{ role: 'user', parts: [{ text: prompt }] }]
//         }, {
//           headers: { 'Content-Type': 'application/json' }
//         });

//         const aiReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || '';
//         if (aiReply.includes('yes')) score++;
//       }
//     }

//     // ✅ Check if user passed
//     const passingMarks = roundContent.passingMarks || roundContent.totalMarks || 0;
//     const passed = score >= passingMarks;

//     // ✅ Filter out any invalid entries (no user)
//     round.isqualify = round.isqualify.filter(entry => entry.user);

//     // ✅ Update current round's isqualify
//     const existingIndex = round.isqualify.findIndex(entry => entry.user?.toString() === userId.toString());

//     if (existingIndex !== -1) {
//       round.isqualify[existingIndex].qualified = passed;
//     } else {
//       round.isqualify.push({ user: userId, qualified: passed });
//     }

//     await round.save();
//     console.log("✅ Current round qualification saved.");

//     // ✅ Unlock and initialize next round (if passed)
//     if (passed) {
//       const job = await Job.findById(round.job).populate('rounds');
//       if (job && job.rounds?.length > 0) {
//         const next = job.rounds.find(r => r.order === round.order + 1);

//         if (next) {
//           const nextRound = await Round.findById(next._id);

//           // Filter out invalid entries here as well
//           nextRound.isqualify = nextRound.isqualify.filter(entry => entry.user);

//           const alreadyAdded = nextRound.isqualify.some(entry => entry.user?.toString() === userId.toString());

//           if (!alreadyAdded) {
//             nextRound.isqualify.push({ user: userId, qualified: false }); // unlocked, not yet passed
//             await nextRound.save();
//             console.log("🔓 Next round unlocked.");
//           }
//         }
//       }
//     }

//     // ✅ Final render
//     return res.render('rounds/result', {
//       round,
//       score,
//       total: roundContent.questions.length,
//       passingMarks,
//       isPassed: passed,
//       jobId: round.job
//     });

//   } catch (err) {
//     console.error("❌ Submission error:", err.message);
//     return res.status(500).send("Internal Server Error");
//   }
// };

exports.submitRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const userId = req.user._id;
    const { answers } = req.body;

    console.log("▶️ Received roundId:", roundId);
    console.log("▶️ User ID:", userId);

    const round = await Round.findById(roundId).populate('roundContent');
    if (!round) {
      console.log("❌ Round not found in DB.");
      return res.status(404).send('Round not found');
    }

    const roundContent = round.roundContent;
    const roundType = round.roundContentType;
    let score = 0;

    if (!roundContent || !Array.isArray(roundContent.questions)) {
      console.log("❌ Round content is malformed or missing questions.");
      return res.status(500).send('Invalid round content');
    }

    const user = req.user

    // ✅ MCQ, Grammar, Aptitude Scoring
    if (['MCQRound', 'GrammarRound', 'AptitudeRound'].includes(roundType)) {
      for (const q of roundContent.questions) {
        const userAns = answers[q._id];
        const correctAns = q.correctAnswer || q.options?.find(opt => opt.isCorrect)?.text;
        if (userAns && userAns.trim() === correctAns?.trim()) score++;
      }
    }

    // ✅ DSA Round Scoring (via Gemini)
    if (roundType === 'DSARound') {
      for (const q of roundContent.questions) {
        const userCode = answers[q._id];
        if (!userCode?.trim()) continue;

        const prompt = `
### Problem:
${q.problemStatement}

### Input Format:
${q.inputFormat || 'N/A'}

### Output Format:
${q.outputFormat || 'N/A'}

### Constraints:
${q.constraints || 'N/A'}

### Sample Input:
${q.sampleInput || 'N/A'}

### Sample Output:
${q.sampleOutput || 'N/A'}

### User Code:
${userCode}

### Expected Output Logic:
${q.solution}

### Evaluation Prompt:
Does the above code solve the given problem? Answer only 'Yes' or 'No' and a brief explanation.
        `.trim();

        try {
          const geminiRes = await axios.post(GEMINI_API_URL, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          }, {
            headers: { 'Content-Type': 'application/json' }
          });

          const aiReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || '';
          console.log(`🧠 AI reply for question "${q.title}":`, aiReply);
          if (aiReply.includes('yes')) score++;
        } catch (err) {
          console.error("❌ Gemini API Error:", err.response?.status || err.code, err.response?.data || err.message);
        }
      }
    }

    // ✅ Pass or Fail
    const passingMarks = roundContent.passingMarks || roundContent.totalMarks || 0;
    const passed = score >= passingMarks;

    // ✅ Ensure isqualify is clean
    round.isqualify = round.isqualify.filter(entry => entry.user);
    const existingIndex = round.isqualify.findIndex(entry => entry.user?.toString() === userId.toString());

    if (existingIndex !== -1) {
      round.isqualify[existingIndex].qualified = passed;
    } else {
      round.isqualify.push({ user: userId, qualified: passed });
    }

    await round.save();
    console.log("✅ Current round qualification saved.");

    // ✅ Unlock next round
    if (passed) {
      const job = await Job.findById(round.job).populate('rounds');
      if (job?.rounds?.length > 0) {
        const next = job.rounds.find(r => r.order === round.order + 1);
        if (next) {
          const nextRound = await Round.findById(next._id);
          nextRound.isqualify = nextRound.isqualify.filter(entry => entry.user);
          const alreadyAdded = nextRound.isqualify.some(entry => entry.user?.toString() === userId.toString());
          if (!alreadyAdded) {
            nextRound.isqualify.push({ user: userId, qualified: false });
            await nextRound.save();
            console.log("🔓 Next round unlocked.");
          }
        }
      }
    }

    return res.render('rounds/result', {
      round,
      score,
      total: roundContent.questions.length,
      passingMarks,
      isPassed: passed,
      jobId: round.job
    });

  } catch (err) {
    console.error("❌ Submission error:", err.message);
    return res.status(500).send("Internal Server Error");
  }
};

// exports.submitRound = async (req, res) => {
//   try {
//     const { roundId } = req.params;
//     const userId = req.user._id;
//     const { answers } = req.body;

//     console.log("▶️ Received roundId:", roundId);
//     console.log("▶️ User ID:", userId);

//     const round = await Round.findById(roundId).populate('roundContent');
//     if (!round) {
//       console.log("❌ Round not found in DB.");
//       return res.status(404).send('Round not found');
//     }

//     const roundContent = round.roundContent;
//     const roundType = round.roundContentType;
//     let score = 0;

//     if (!roundContent || !Array.isArray(roundContent.questions)) {
//       console.log("❌ Round content is malformed or missing questions.");
//       return res.status(500).send('Invalid round content');
//     }

//     // ✅ Score MCQ/Grammar/Aptitude rounds
//     if (['MCQRound', 'GrammarRound', 'AptitudeRound'].includes(roundType)) {
//       for (const q of roundContent.questions) {
//         const userAns = answers[q._id];
//         const correctAns = q.correctAnswer || q.options?.find(opt => opt.isCorrect)?.text;
//         if (userAns && userAns.trim() === correctAns?.trim()) score++;
//       }
//     }

//     // ✅ Score DSA round using Gemini API
//     if (roundType === 'DSARound') {
//       for (const q of roundContent.questions) {
//         const userCode = answers[q._id];
//         if (!userCode?.trim()) continue;

//         const prompt = `
// ### Problem:
// ${q.problemStatement}

// ### Input Format:
// ${q.inputFormat || 'N/A'}

// ### Output Format:
// ${q.outputFormat || 'N/A'}

// ### Constraints:
// ${q.constraints || 'N/A'}

// ### Sample Input:
// ${q.sampleInput || 'N/A'}

// ### Sample Output:
// ${q.sampleOutput || 'N/A'}

// ### User Code:
// ${userCode}

// ### Expected Output Logic:
// ${q.solution}

// ### Evaluation Prompt:
// Does the above code solve the given problem? Answer only 'Yes' or 'No' and a brief explanation.
//         `.trim();

//         try {
//           const geminiRes = await axios.post(GEMINI_API_URL, {
//             contents: [{ role: 'user', parts: [{ text: prompt }] }]
//           }, {
//             headers: { 'Content-Type': 'application/json' }
//           });

//           const aiReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || '';
//           console.log(`🧠 AI reply for question "${q.title}":`, aiReply);
//           if (aiReply.includes('yes')) score++;
//         } catch (err) {
//           console.error("❌ Gemini API Error:", err.response?.status || err.code, err.response?.data || err.message);
//         }
//       }
//     }

//     // ✅ Check pass/fail
//     const passingMarks = roundContent.passingMarks || roundContent.totalMarks || 0;
//     const passed = score >= passingMarks;

//     // ✅ Clean and update isqualify array
//     round.isqualify = round.isqualify.filter(entry => entry.user);
//     const existingIndex = round.isqualify.findIndex(entry => entry.user?.toString() === userId.toString());

//     if (existingIndex !== -1) {
//       round.isqualify[existingIndex].qualified = passed;
//     } else {
//       round.isqualify.push({ user: userId, qualified: passed });
//     }

//     await round.save();
//     console.log("✅ Current round qualification saved.");

//     // ✅ Unlock next round (if passed)
//     if (passed) {
//       const job = await Job.findById(round.job).populate('rounds');
//       if (job?.rounds?.length > 0) {
//         const next = job.rounds.find(r => r.order === round.order + 1);
//         if (next) {
//           const nextRound = await Round.findById(next._id);
//           if (nextRound) {
//             nextRound.job = job._id; // ✅ Extra safety (in case somehow missing)
//             nextRound.isqualify = nextRound.isqualify.filter(entry => entry.user);
//             const alreadyAdded = nextRound.isqualify.some(entry => entry.user?.toString() === userId.toString());
//             if (!alreadyAdded) {
//               nextRound.isqualify.push({ user: userId, qualified: false });
//               await nextRound.save();
//               console.log("🔓 Next round unlocked.");
//             }
//           }
//         }
//       }
//     }

//     // ✅ Render result page
//     return res.render('rounds/result', {
//       round,
//       score,
//       total: roundContent.questions.length,
//       passingMarks,
//       isPassed: passed,
//       jobId: round.job
//     });

//   } catch (err) {
//     console.error("❌ Submission error:", err.message);
//     return res.status(500).send("Internal Server Error");
//   }
// };

exports.getSelectRound = async (req, res) => {
  const jobId = req.params.jobId;
  try {
    const job = await Job.findById(jobId);
    console.log(job);
    if (!job) return res.status(404).send('Job not found');

    res.render('rounds/selectRound', { job });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.postSelectRound = async (req, res) => {
  const jobId = req.params.jobId;
  const { roundType } = req.body;

  const roundTypeMap = {
    MCQ: 'mcqForm',
    DSA: 'dsaForm',
    Grammar: 'grammarForm',
    Aptitude: 'aptitudeForm',
    General: 'generalForm',
    Voice: 'voiceForm',
    Interview: 'interviewForm'
  };

  if (!roundTypeMap[roundType]) {
    return res.status(400).send('Invalid round type');
  }

  // Redirect to specific form page for round
  res.redirect(`/add-round/${roundType.toLowerCase()}/${jobId}`);
};

exports.getNextRoundOrFinish = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId).populate('rounds');

    if (!job) {
      return res.status(404).send('Job not found');
    }

    const roundsAdded = job.rounds.length;

    if (roundsAdded < job.totalRounds) {
      // ✅ Let user add another round
      return res.redirect(`/rounds/select-round/${jobId}`);
    } else {
      // ✅ All rounds added — redirect to job page or dashboard
      return res.send('✅ All rounds added successfully!');
      // Or optionally:
      // return res.redirect(`/jobs/${jobId}`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing next round step');
  }
};

exports.starttRound = async (req, res) => {
  try {
    const roundId = req.params.roundId;
    console.log('Starting round with ID:', roundId);

    // 1. Fetch the main Round entry
    const round = await Round.findById(roundId);
    if (!round) {
      return res.status(404).send('❌ Round not found lodu');
    }

    let roundContent;
    //time left
    let timeLeft = round.duration

    // 2. Fetch corresponding roundContent from the right model
    if (round.roundType === 'MCQ') {
      roundContent = await MCQRound.findById(round.roundContent);
      if (!roundContent) return res.status(404).send('MCQ Round not found');
      return res.render('rounds/mcqRoundStart', { round: { ...round.toObject(), ...{ questions: roundContent.questions } },type:round.roundType });

    } else if (round.roundType === 'DSA') {
      roundContent = await DSARound.findById(round.roundContent);
      if (!roundContent) return res.status(404).send('DSA Round not found');
      return res.render('rounds/dsaRoundStart', { round: { ...roundContent.toObject() },type:round.roundType  });

    } else if (round.roundType === 'Grammar') {
      roundContent = await GrammarRound.findById(round.roundContent);
      if (!roundContent) return res.status(404).send('Grammar Round not found');
      return res.render('rounds/grammarRoundStart', { round: { ...roundContent.toObject() },type:round.roundType  });

    }else if (round.roundType === 'Aptitude') {
      roundContent = await AptitudeRound.findById(round.roundContent);
      if (!roundContent) return res.status(404).send('Apti Round not found');
      return res.render('rounds/aptitudeRoundStart', { round: { ...roundContent.toObject() },type:round.roundType  });
    }else {
      return res.status(400).send('Invalid round type');
    }
  } catch (error) {
    console.error('Error starting round:', error);
    res.status(500).send('Internal Server Error');
  }
};

// exports.startRound = async (req, res) => {
//   try {
//     const roundId = req.params.roundId;
//     console.log('🎬 Starting round with ID:', roundId);

//     const round = await Round.findById(roundId);
//     if (!round) return res.status(404).send('❌ Round not found');

//     let roundContent;

//     if (round.roundType === 'MCQ') {
//       roundContent = await MCQRound.findById(round.roundContent);
//       if (!roundContent) return res.status(404).send('MCQ round content not found');
//       return res.render('rounds/mcqRoundStart', {
//         round: { ...round.toObject(), roundContent: roundContent.toObject() },
//         type: round.roundType
//       });

//     } else if (round.roundType === 'DSA') {
//       roundContent = await DSARound.findById(round.roundContent);
//       if (!roundContent) return res.status(404).send('DSA round content not found');
//       return res.render('rounds/dsaRoundStart', {
//         round: { ...round.toObject(), roundContent: roundContent.toObject() },
//         type: round.roundType
//       });

//     } else if (round.roundType === 'Grammar') {
//       roundContent = await GrammarRound.findById(round.roundContent);
//       if (!roundContent) return res.status(404).send('Grammar round content not found');
//       return res.render('rounds/grammarRoundStart', {
//         round: { ...round.toObject(), roundContent: roundContent.toObject() },
//         type: round.roundType
//       });

//     } else if (round.roundType === 'Aptitude') {
//       roundContent = await AptitudeRound.findById(round.roundContent);
//       if (!roundContent) return res.status(404).send('Aptitude round content not found');
//       return res.render('rounds/aptitudeRoundStart', {
//         round: { ...round.toObject(), roundContent: roundContent.toObject() },
//         type: round.roundType
//       });

//     } else {
//       return res.status(400).send('❌ Invalid round type');
//     }

//   } catch (error) {
//     console.error('💥 Error in startRound:', error);
//     return res.status(500).send('Internal Server Error');
//   }
// };

exports.startRound = async (req, res) => {
  try {
    const roundId = req.params.roundId;
    const userId = req.user?._id?.toString();

    console.log('🎬 Starting round with ID:', roundId);
    console.log('👤 User ID:', userId);

    const round = await Round.findById(roundId);
    if (!round) {
      console.error('❌ Round not found in database.');
      return res.status(404).send('❌ Round not found');
    }

    console.log('✅ Round fetched:', round._id);
    console.log('🔍 Round type:', round.roundType);
    console.log('🔗 roundContent ID:', round.roundContent);

    let roundContent;

    switch (round.roundType) {
      case 'MCQ':
        roundContent = await MCQRound.findById(round.roundContent);
        if (!roundContent) {
          console.error('❌ MCQ round content not found for:', round.roundContent);
          return res.status(404).send('MCQ round content not found');
        }
        console.log('✅ MCQ Round Content Loaded:', roundContent._id);
        return res.render('rounds/mcqRoundStart', {
          round: { ...round.toObject(), roundContent: roundContent.toObject() },
          type: round.roundType
        });

      case 'DSA':
        roundContent = await DSARound.findById(round.roundContent);
        if (!roundContent) {
          console.error('❌ DSA round content not found for:', round.roundContent);
          return res.status(404).send('DSA round content not found');
        }
        console.log('✅ DSA Round Content Loaded:', roundContent._id);
        return res.render('rounds/dsaRoundStart', {
          round: { ...round.toObject(), roundContent: roundContent.toObject() },
          type: round.roundType
        });

      case 'Grammar':
        roundContent = await GrammarRound.findById(round.roundContent);
        if (!roundContent) {
          console.error('❌ Grammar round content not found for:', round.roundContent);
          return res.status(404).send('Grammar round content not found');
        }
        console.log('✅ Grammar Round Content Loaded:', roundContent._id);
        return res.render('rounds/grammarRoundStart', {
          round: { ...round.toObject(), roundContent: roundContent.toObject() },
          type: round.roundType
        });

      case 'Aptitude':
        roundContent = await AptitudeRound.findById(round.roundContent);
        if (!roundContent) {
          console.error('❌ Aptitude round content not found for:', round.roundContent);
          return res.status(404).send('Aptitude round content not found');
        }
        console.log('✅ Aptitude Round Content Loaded:', roundContent._id);
        return res.render('rounds/aptitudeRoundStart', {
          round: { ...round.toObject(), roundContent: roundContent.toObject() },
          type: round.roundType
        });

      default:
        console.error('❌ Invalid round type provided:', round.roundType);
        return res.status(400).send('❌ Invalid round type');
    }

  } catch (error) {
    console.error('💥 Error in startRound:', error.message);
    console.error(error.stack); // optional: deeper trace
    return res.status(500).send('Internal Server Error');
  }
};


exports.showEditForm = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send("Round not found");

    const mcqRound = await MCQRound.findById(round.roundContent);
    if (!mcqRound) return res.status(404).send("MCQ Round content not found");

    res.render('rounds/editMCQRound', { round, mcqRound });
  } catch (err) {
    console.error("Error loading MCQ round for edit:", err);
    res.status(500).send("Server error");
  }
};

// Handle update
exports.updateMcqRound = async (req, res) => {
  try {
    const roundId = req.params.id;
    const round = await Round.findById(roundId);
    const mcqRound = await MCQRound.findById(round.roundContent);

    if (!round || !mcqRound) return res.status(404).send("Round not found");

    const { title, duration, instructions, totalMarks, passingMarks } = req.body;
    const rawQuestions = req.body.questions;

    const updatedQuestions = rawQuestions.map(q => {
      const optionsArr = q.options.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
      return {
        questionText: q.questionText.trim(),
        options: optionsArr.map(opt => ({
          text: opt,
          isCorrect: opt === q.correctAnswer.trim()
        })),
        explanation: q.explanation?.trim() || '',
        difficulty: q.difficulty || 'Medium',
        tags: q.category?.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };
    });

    mcqRound.title = title;
    mcqRound.questions = updatedQuestions;
    mcqRound.timeLimit = duration;
    mcqRound.totalMarks = totalMarks;
    mcqRound.passingMarks = passingMarks;
    await mcqRound.save();

    round.title = title;
    round.duration = duration;
    round.instructions = instructions;
    await round.save();

    res.redirect(`/jobs/${round.job}`);
  } catch (err) {
    console.error("Error updating MCQ Round:", err);
    res.status(500).send("Internal server error");
  }
};

// Handle delete
exports.deleteMCQRound = async (req, res) => {
  try {
    const roundId = req.params.id;
    const jobId = req.query.jobId;

    const round = await Round.findById(roundId);
    if (!round) return res.status(404).send("Round not found");

    const mcqId = round.roundContent;

    // Delete both documents
    await Round.findByIdAndDelete(roundId);
    await MCQRound.findByIdAndDelete(mcqId);

    // Remove round ref from job
    await Job.findByIdAndUpdate(jobId, {
      $pull: { rounds: roundId },
      $inc: { roundsAdded: -1 }
    });

    res.redirect(`/jobs/${jobId}`);
  } catch (err) {
    console.error("Error deleting MCQ round:", err);
    res.status(500).send("Delete failed");
  }
};

//grammar round
// Show edit form
exports.showEditGrammarForm = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send('Round not found');

    const grammarRound = await GrammarRound.findById(round.roundContent);
    if (!grammarRound) return res.status(404).send('Grammar round content not found');

    res.render('rounds/editGrammarRound', { round, grammarRound });
  } catch (err) {
    console.error('Error loading grammar round for edit:', err);
    res.status(500).send('Server error');
  }
};

// Update grammar round
exports.updateGrammarRound = async (req, res) => {
  try {
    const roundId = req.params.id;
    const round = await Round.findById(roundId);
    const grammarRound = await GrammarRound.findById(round.roundContent);

    if (!round || !grammarRound) return res.status(404).send('Round not found');

    const { title, timeLimit, totalMarks, passingMarks, instructions } = req.body;
    const rawQuestions = req.body.questions;

    const updatedQuestions = rawQuestions.map(q => {
      const optionsArr = q.options.split(',').map(opt => opt.trim()).filter(opt => opt);

      return {
        question: q.question.trim(),
        options: optionsArr,
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation?.trim() || '',
        difficulty: q.difficulty || 'Easy',
        category: q.category || 'Misc'
      };
    });

    grammarRound.title = title;
    grammarRound.questions = updatedQuestions;
    grammarRound.timeLimit = timeLimit;
    grammarRound.totalMarks = totalMarks;
    grammarRound.passingMarks = passingMarks;
    await grammarRound.save();

    round.title = title;
    round.duration = timeLimit;
    round.instructions = instructions;
    await round.save();

    res.redirect(`/jobs/${round.job}`);
  } catch (err) {
    console.error('Error updating grammar round:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Delete grammar round
exports.deleteGrammarRound = async (req, res) => {
  try {
    const { roundId, jobId } = req.params;

    // Check for missing roundId or jobId
    if (!roundId || !jobId) {
      return res.status(400).send('Missing roundId or jobId in parameters.');
    }

    const round = await Round.findById(roundId);
    if (!round) {
      console.warn(`⚠️ Round not found with ID: ${roundId}`);
      return res.status(404).send('Round not found');
    }

    // Remove associated GrammarRound if exists
    if (round.roundContent) {
      await GrammarRound.findByIdAndDelete(round.roundContent);
    }

    await Round.findByIdAndDelete(roundId);

    // Optional: Remove round from job.rounds[] and update roundsAdded
    await Job.findByIdAndUpdate(jobId, {
      $pull: { rounds: roundId },
    });

    res.redirect(`/jobs/${jobId}`);
  } catch (err) {
    console.error('❌ Error deleting grammar round:', err);
    res.status(500).send('Internal Server Error');
  }
};

// GET - Show Edit Form
exports.showEditDSARoundForm = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send('Round not found');

    const dsaRound = await DSARound.findById(round.roundContent);
    if (!dsaRound) return res.status(404).send('DSA round content not found');
    console.log('Editing DSA Round:', dsaRound);

    res.render('rounds/editDSARound', { round, dsaRound });
  } catch (err) {
    console.error('❌ Error loading DSA round for edit:', err);
    res.status(500).send('Server error');
  }
};

// POST - Update DSA Round
exports.updateDSARound = async (req, res) => {
  try {
    const roundId = req.params.id;
    const round = await Round.findById(roundId);
    if (!round) return res.status(404).send('Round not found');

    const dsaRound = await DSARound.findById(round.roundContent);
    if (!dsaRound) return res.status(404).send('DSA round content not found');

    // Update core fields
    dsaRound.title = req.body.title;
    dsaRound.timeLimit = req.body.timeLimit;

    dsaRound.questions = req.body.questions.map(q => ({
      title: q.title,
      problemStatement: q.problemStatement,
      inputFormat: q.inputFormat,
      outputFormat: q.outputFormat,
      constraints: q.constraints,
      sampleInput: q.sampleInput,
      sampleOutput: q.sampleOutput,
      solution: q.solution
    }));

    await dsaRound.save();

    // Also update main round title/duration if needed
    round.title = req.body.title;
    round.duration = req.body.timeLimit;
    await round.save();

    res.redirect(`/jobs/${round.job}`); // redirect to job detail
  } catch (err) {
    console.error('❌ Error updating DSA round:', err);
    res.status(500).send('Server error while updating DSA round');
  }
};

// POST - Delete DSA Round
exports.deleteDSARound = async (req, res) => {
  try {
    const roundId = req.params.id;
    const round = await Round.findById(roundId);
    if (!round) return res.status(404).send('Round not found');

    const dsaRoundId = round.roundContent;
    await DSARound.findByIdAndDelete(dsaRoundId);
    await Round.findByIdAndDelete(roundId);

    // Optionally update job (decrement round count)
    if (req.query.jobId) {
      const Job = require('../models/JobSchema');
      const job = await Job.findById(req.query.jobId);
      job.rounds = job.rounds.filter(r => r.toString() !== roundId);
      job.roundsAdded = Math.max(0, job.roundsAdded - 1);
      await job.save();
    }

    res.redirect(`/jobs/${round.job}`);
  } catch (err) {
    console.error('❌ Error deleting DSA round:', err);
    res.status(500).send('Server error while deleting DSA round');
  }
};

//apti
exports.showEditAptitudeForm = async (req, res) => {
  try {
    console.log("yo bro")
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send("Round not found");

    const aptitudeRound = await AptitudeRound.findById(round.roundContent);
    if (!aptitudeRound) return res.status(404).send("Aptitude round content not found");

    res.render('rounds/editAptiRound', { round, aptitudeRound });
  } catch (err) {
    console.error("❌ Error loading aptitude round for edit:", err);
    res.status(500).send("Server error");
  }
};

exports.updateAptitudeRound = async (req, res) => {
  const roundId = req.params.id;
  const { title, timeLimit, totalMarks, passingMarks, questions } = req.body;

  try {
    const round = await Round.findById(roundId);
    if (!round) return res.status(404).send("Round not found");

    const aptitudeRound = await AptitudeRound.findById(round.roundContent);
    if (!aptitudeRound) return res.status(404).send("Aptitude content not found");

    // Format questions
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

    // Update aptitude round
    aptitudeRound.title = title;
    aptitudeRound.timeLimit = timeLimit;
    aptitudeRound.totalMarks = totalMarks;
    aptitudeRound.passingMarks = passingMarks;
    aptitudeRound.questions = formattedQuestions;

    await aptitudeRound.save();

    // Update round title and duration too
    round.title = title;
    round.duration = timeLimit;
    await round.save();

    res.redirect(`/jobs/${round.job}`);
  } catch (err) {
    console.error("❌ Error updating aptitude round:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteAptitudeRound = async (req, res) => {
  const { id } = req.params;
  const { jobId } = req.query;

  try {
    const round = await Round.findById(id);
    if (!round) return res.status(404).send("Round not found");

    const aptitudeRoundId = round.roundContent;
    await AptitudeRound.findByIdAndDelete(aptitudeRoundId);
    await Round.findByIdAndDelete(id);

    // Update job reference
    const Job = require('../models/JobSchema');
    await Job.findByIdAndUpdate(jobId, {
      $pull: { rounds: id },
      $inc: { roundsAdded: -1 }
    });

    res.redirect(`/jobs/${jobId}`);
  } catch (err) {
    console.error("❌ Error deleting aptitude round:", err);
    res.status(500).send("Server error");
  }
};

exports.getRoundResults = async (req, res) => {
  try {
    const { roundId } = req.params;

    const round = await Round.findById(roundId)
      .populate('isqualify.user')  // Populate user info
      .populate('job');

    if (!round) return res.status(404).send("Round not found");

    const results = round.isqualify.map(entry => ({
      user: entry.user,
      qualified: entry.qualified
    }));

    res.render('rounds/roundResults', {
      round,
      results,
      jobTitle: round.job.title
    });

  } catch (err) {
    console.error("❌ Error fetching round results:", err.message);
    res.status(500).send("Internal Server Error");
  }
};
