const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {isLoggedIn} = require('../middlewares/isLoggedin')

router.post('/send-message',isLoggedIn, chatController.sendMessage);
router.get('/chatbox',isLoggedIn, chatController.showChatUserList); // List people to chat with
router.get('/chatbox/:otherUserId',isLoggedIn, chatController.chatDashboard);

module.exports = router;
