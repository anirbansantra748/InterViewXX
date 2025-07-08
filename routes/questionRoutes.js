const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { isAdmin } = require('../middlewares/isAdmin');

// 📝 View all questions (filter by tag/difficulty optionally)
router.get('/', questionController.listQuestions);

// ➕ New MCQ / SAQ choose page
router.get('/new',isAdmin,  questionController.chooseQuestionType);

// 🔍 View a single question
router.get('/:id', questionController.viewQuestion);

// ➕ New MCQ form
router.get('/new/mcq',isAdmin,  questionController.renderMCQForm);
router.post('/new/mcq',isAdmin,  questionController.createMCQ);

// ➕ New SAQ form
router.get('/new/saq',isAdmin,  questionController.renderSAQForm);
router.post('/new/saq',isAdmin,  questionController.createSAQ);

// 🖋️ Edit question
router.get('/:id/edit',isAdmin,  questionController.renderEditForm);
router.put('/:id',isAdmin,  questionController.updateQuestion);

// ❌ Delete
router.delete('/:id',isAdmin,  questionController.deleteQuestion);

// 👍 Like a question
router.post('/:id/like',  questionController.likeQuestion);

//submit answer
router.post('/:id/submit', questionController.submitAnswerAI)


module.exports = router;
