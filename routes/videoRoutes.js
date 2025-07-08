const express = require('express');
const router = express.Router();

// Render video room for recruiter (with known roomId)
router.get('/create', (req, res) => {
    console.log("Creating video room for recruiter");
  const roomId = req.query.roomId;
  if (!roomId) return res.status(400).send("Missing roomId");

  const isInitiator = req.user.role === 'recruiter'; // 💡 Calculate here
    console.log("Is Initiator:", isInitiator);
  res.render('chats/room', {
    roomId,
    currentUser: req.user,
    isInitiator
  });
});

// Render video room for user (based on input)
router.get('/join', (req, res) => {
  const roomId = req.query.roomId;
  if (!roomId) return res.status(400).send("Please provide Room ID to join.");

  const isInitiator = false; // 💡 User is never initiator
  res.render('chats/room', {
    roomId,
    currentUser: req.user,
    isInitiator
  });
});

module.exports = router;
