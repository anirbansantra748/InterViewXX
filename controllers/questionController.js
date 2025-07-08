const Question = require("../models/questionSchema");
const User = require("../models/UserSchema");
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// 🔁 Retry wrapper
async function sendGeminiPromptWithRetry(prompt, maxRetries = 3) {
  let attempt = 0;
  let delay = 2000;

  while (attempt < maxRetries) {
    try {
      const aiResponse = await axios.post(GEMINI_API_URL, {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      return aiResponse;
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn(`🔁 Retry ${attempt + 1} due to 429... waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }

  throw new Error("Too many requests. Gemini API rate limit exceeded. Try again later.");
}

exports.submitAnswerAI = async (req, res) => {
  try {
    const { id } = req.params;
    const { userAnswer } = req.body;

    const question = await Question.findById(id);
    const user = await User.findById(req.user._id);

    if (!question) {
      return res.status(404).render("questions/result", {
        isCorrect: false,
        question: null,
        errorMessage: "❌ Question not found.",
      });
    }

    let isCorrect = false;

    if (question.type === "mcq") {
      // ✅ No AI call, just compare directly
      isCorrect = userAnswer.trim() === question.correctAnswer.trim();

    } else if (question.type === "saq") {
      const prompt = `
### Question:
${question.questionText}

### Expected Answer:
${question.correctAnswer}

### User's Answer:
${userAnswer}

### Instruction:
Return only "TRUE" if the user's answer is semantically correct (even if not exact), otherwise return "FALSE".
      `.trim();

      const aiResponse = await sendGeminiPromptWithRetry(prompt);
      const aiText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiText) throw new Error("AI did not return a usable response.");

      isCorrect = aiText.toUpperCase().includes("TRUE");
    }

    // ✅ If correct, reward user
    if (isCorrect) {
      user.totalPoints += question.points;

      const today = new Date().toISOString().slice(0, 10);
      const prev = user.solvedDates.get(today) || 0;
      user.solvedDates.set(today, prev + 1);

      user.streak = (user.lastSolvedDate?.toISOString().slice(0, 10) === today)
        ? user.streak + 1
        : 1;

      user.lastSolvedDate = new Date();
    }

    user.solvedQuestions.push({
      questionId: question._id,
      solvedAt: new Date(),
      timeTakenInSeconds: 60,
      isCorrect
    });

    await user.save();

    return res.render("questions/result", {
      isCorrect,
      question,
      errorMessage: null
    });

  } catch (error) {
    console.error("❌ Final Error:", error.message);
    return res.status(500).render("questions/result", {
      isCorrect: false,
      question: null,
      errorMessage: error.message || "Internal Server Error."
    });
  }
};

// List all questions (can be extended with filters)
exports.listQuestions = async (req, res) => {
  const questions = await Question.find({}).sort({ createdAt: -1 });
  res.render('questions/list', { questions });
};

// Choose question type page
exports.chooseQuestionType = (req, res) => {
  console.log("Rendering choose question type page");
  res.render('questions/choose');
};

// Render MCQ form
exports.renderMCQForm = (req, res) => {
  res.render('questions/mcqForm');
};

// Render SAQ form
exports.renderSAQForm = (req, res) => {
  res.render('questions/saqForm');
};

// Create MCQ
exports.createMCQ = async (req, res) => {
  try {
    const { question,title, options, correctIndex, tags, difficulty, explanation,number } = req.body;

    // Parse tags if sent as comma-separated string
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const newQ = new Question({
      number: parseInt(number, 10) || 0,
      type: 'mcq',
      title: title || "Untitled Question",
      questionText: question,
      options,
      correctAnswer: options[correctIndex - 1], // convert index (1-based) to value
      tags: parsedTags,
      difficulty: difficulty || 'medium',
      createdBy: req.user._id,
      explanation: explanation || ""
    });

    await newQ.save();
    res.redirect('/questions/');
  } catch (err) {
    console.error("Error creating MCQ:", err);
    res.status(500).send("Server Error");
  }
};

// Create SAQ
exports.createSAQ = async (req, res) => {
  try {
    const { question, answer, tags, difficulty, explanation } = req.body;
    console.log("Creating SAQ with data:", req.body);

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const newQ = new Question({
      type: 'saq',
      questionText: question,
      correctAnswer: answer,
      tags: parsedTags,
      difficulty: difficulty || 'medium',
      createdBy: req.user._id,
      explanation: explanation || ""
    });

    await newQ.save();
    res.redirect('/questions');
  } catch (err) {
    console.error("Error creating SAQ:", err);
    res.status(500).send("Server Error");
  }
};

// View single question
exports.viewQuestion = async (req, res) => {
  const question = await Question.findById(req.params.id).populate('createdBy');
  const user = req.user;
  const isAdmin = user && user.isAdmin;
  console.log("Viewing question:", question + " by admin:", isAdmin);
  res.render('questions/view', { question , user, isAdmin});
};

// Edit form
exports.renderEditForm = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).send("Question not found");
    }

    res.render('questions/edit', { question });
  } catch (error) {
    console.error("Error rendering edit form:", error);
    res.status(500).send("Server Error");
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  const { questionText, correctAnswer, options, tags, difficulty } = req.body;
  console.log("Updating question with data:", req.body);
  const updateData = {
    questionText,
    correctAnswer,
    options,
    tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags,
    difficulty,
    updatedAt: new Date()
  };

  await Question.findByIdAndUpdate(req.params.id, updateData);
  res.redirect(`/questions/${req.params.id}`);
};

// Delete
exports.deleteQuestion = async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.redirect('/questions');
};

// Like a question
exports.likeQuestion = async (req, res) => {
  const question = await Question.findById(req.params.id);
  //likedBy
  if (!question) {
    return res.status(404).send("Question not found");
  }
  const user = req.user;
  if (!user) {
    return res.status(401).send("You must be logged in to like a question");
  }
  if (question.likedBy.includes(user._id)) {
    // Already liked, remove like
    question.likes -= 1;
    question.likedBy.pull(user._id);
  } else {
    // Not liked, add like
    question.likes += 1;
    question.likedBy.push(user._id);
  }
  await question.save();
  console.log("like count:", question.likes);
  res.redirect(`/questions/${req.params.id}`);
};
