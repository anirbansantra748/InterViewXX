const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send-message', chatController.sendMessage);
router.get('/chatbox', chatController.showChatUserList); // List people to chat with
router.get('/chatbox/:otherUserId', chatController.chatDashboard);
router.get('/chatbox/:otherUserId', chatController.openChatRoom); // Chat between two users// Send a message

module.exports = router;
