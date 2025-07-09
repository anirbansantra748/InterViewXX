const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { isAdmin } = require('../middlewares/isAdmin');
const {isLoggedIn} = require('../middlewares/isLoggedin')

// 📝 View all questions (filter by tag/difficulty optionally)
router.get('/', questionController.listQuestions);

// ➕ New MCQ / SAQ choose page
router.get('/new',isLoggedIn,isAdmin,  questionController.chooseQuestionType);

// 🔍 View a single question
router.get('/:id',isLoggedIn, questionController.viewQuestion);

// ➕ New MCQ form
router.get('/new/mcq',isLoggedIn,isAdmin,  questionController.renderMCQForm);
router.post('/new/mcq',isLoggedIn,isAdmin,  questionController.createMCQ);

// ➕ New SAQ form
router.get('/new/saq',isLoggedIn,isAdmin,  questionController.renderSAQForm);
router.post('/new/saq',isLoggedIn,isAdmin,  questionController.createSAQ);

// 🖋️ Edit question
router.get('/:id/edit',isLoggedIn,isAdmin,  questionController.renderEditForm);
router.put('/:id',isLoggedIn,isAdmin,  questionController.updateQuestion);

// ❌ Delete
router.delete('/:id',isLoggedIn,isAdmin,  questionController.deleteQuestion);

// 👍 Like a question
router.post('/:id/like',isLoggedIn,  questionController.likeQuestion);

//submit answer
router.post('/:id/submit',isLoggedIn, questionController.submitAnswerAI)


module.exports = router;
