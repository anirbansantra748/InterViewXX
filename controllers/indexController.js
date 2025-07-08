const Question = require("../models/questionSchema");

exports.homePage = async (req, res) => {
  try {
    const user = req.user || null;
    const searchQuery = req.query.search || "";

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegex(searchQuery), 'i');

    const allQuestions = await Question.find({
      $or: [
        { title: regex },
        { tags: regex },
        { difficulty: regex }
      ]
    }).sort({ createdAt: -1 });

    const hotQuestions = await Question.find({}).sort({ likes: -1 }).limit(5);

    res.render("listings/index.ejs", {
      user,
      allQuestions,
      hotQuestions,
      searchQuery
    });

  } catch (err) {
    console.error("🔥 Home page error:", err);
    res.status(500).send("Something went wrong loading questions.");
  }
};
module.exports.thirdRound = (req, res) => {
	res.render("listings/thirdRound.ejs");
};
