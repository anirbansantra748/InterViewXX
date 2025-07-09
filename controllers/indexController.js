const Question = require("../models/questionSchema");
const User = require("../models/UserSchema")

exports.homePage = async (req, res) => {
  try {
    const user = req.user || null;
    console.log("✅ Logged in user:", user?.username || "Guest");

    const searchQuery = req.query.search || "";
    console.log("🔍 Search Query:", searchQuery);

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegex(searchQuery), 'i');
    console.log("📌 Regex created:", regex);

    console.log("📦 Fetching all matching questions...");
    const allQuestions = await Question.find({
      $or: [
        { title: regex },
        { tags: regex },
        { difficulty: regex }
      ]
    }).sort({ createdAt: -1 });
    console.log("✅ Found questions:", allQuestions.length);

    console.log("🔥 Fetching hot questions...");
    const hotQuestions = await Question.find({}).sort({ likes: -1 }).limit(5);
    console.log("✅ Found hot questions:", hotQuestions.length);

    res.render("listings/index.ejs", {
      user,
      allQuestions,
      hotQuestions,
      searchQuery
    });

  } catch (err) {
    console.error("🔥 Home page error:", err.stack || err.message || err);
    res.status(500).send("Something went wrong loading questions.");
  }
};

module.exports.thirdRound = (req, res) => {
	res.render("listings/thirdRound.ejs");
};

module.exports.addDummyQuestion = async (req, res) => {
  try {
    // 👤 Step 1: Create a new user
    const newUser = new User({
      username: 'anirban123',
      fullName: 'Anirban Santra',
      email: 'anirban@example.com',
      role: 'user',
      dob: new Date('2003-06-15'),
      gender: 'Male',
      phone: '9876543210',
      location: {
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'India'
      },
      portfolioLinks: {
        github: 'https://github.com/anirbansantra',
        linkedin: 'https://linkedin.com/in/anirban-santra',
        portfolio: 'https://anirban.dev'
      },
      totalPoints: 0
    });

    // 🔐 Register user with password using passport-local-mongoose
    const registeredUser = await User.register(newUser, 'test1234');

    console.log("✅ Dummy user created:", registeredUser._id);

    // 🧠 Step 2: Create dummy question with createdBy set to this user
    const dummy = new Question({
      title: "What is closure in JavaScript?",
      number: 1,
      type: "mcq",
      questionText: "Explain closure in simple words with an example.",
      options: ["A function with private scope", "A class", "An array", "None"],
      correctAnswer: "A function with private scope",
      difficulty: "easy",
      tags: ["JavaScript", "Function", "Closure"],
      points: 10,
      likes: 15,
      createdBy: registeredUser._id,
      isPublic: true,
      createdAt: new Date()
    });

    await dummy.save();

    console.log("✅ Dummy question added!");
    res.redirect('/home');
  } catch (err) {
    console.error("❌ Error inserting dummy data:", err);
    res.status(500).send("❌ Failed to insert dummy user/question.");
  }
};

module.exports.aboutpage = async(req,res) =>{
  res.render("listings/about.ejs");
}
