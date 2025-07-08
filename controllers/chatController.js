const Chat = require("../models/ChatSchema");
const Message = require("../models/MessageSchema");
const User = require("../models/UserSchema");

exports.showChatUserList = async (req, res) => {
  const currentUser = req.user;
  console.log("Current User:", currentUser);

  // If user is recruiter, show all users (only _id + username)
  if (currentUser.role === 'recruiter') {
    // find all user without current user
    const users = await User.find({ _id: { $ne: currentUser._id } }, 'username _id');
    console.log("Users found:", users.length);
    return res.render('chats/selectUser', { users });
  }

  // If user is job seeker, show all recruiters
  const recruiters = await User.find({ role: 'recruiter' }, 'username _id');
  return res.render('chats/selectUser', { users: recruiters });
};

// 🚀 Create or get chat
exports.openChatRoom = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.otherUserId;
    const userRole = req.user.role;

    // 🟢 Find chat with both participants (regardless of order)
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    }).populate({
      path: 'messages',
      populate: {
        path: 'sender',
        select: 'username'
      }
    });

    // 🔵 If no chat exists, create one
    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, otherUserId],
        messages: []
      });
      await chat.save();
    }

    // 🟣 Fetch the other user’s username to display in chat UI
    const otherUser = await User.findById(otherUserId).select("username");

    // 🔥 Render the chat room
    res.render('chats/chatRoom', {
      chat,
      currentUser: req.user,
      otherUserId,
      otherUser,
      role: userRole
    });

  } catch (err) {
    console.error("💥 Error in openChatRoom:", err);
    res.status(500).send("Something went wrong while opening the chat room.");
  }
};

exports.sendMessage = async (req, res) => {
  const { chatId, senderId, content, receiverId } = req.body;

  const msg = new Message({ sender: senderId, content });
  await msg.save();

  await Chat.findByIdAndUpdate(chatId, {
    $push: { messages: msg._id },
    lastUpdated: Date.now()
  });

  res.redirect(`/chats/chatbox/${receiverId}`);
};

exports.chatDashboard = async (req, res) => {
  const currentUser = req.user;
  const selectedUserId = req.params.otherUserId;

  try {
    // All chats where currentUser is a participant
    const chats = await Chat.find({
      participants: currentUser._id
    })
    .populate('participants', 'username') // populate usernames
    .populate({
      path: 'messages',
      populate: { path: 'sender', select: 'username' }
    })
    .sort({ lastUpdated: -1 });

    let selectedChat = null;
    let otherUser = null;

    if (selectedUserId) {
      selectedChat = chats.find(chat =>
        chat.participants.some(p => p._id.toString() === selectedUserId)
      );

      if (!selectedChat) {
        selectedChat = new Chat({
          participants: [currentUser._id, selectedUserId],
          messages: []
        });
        await selectedChat.save();
      }

      otherUser = await User.findById(selectedUserId).select("username");
    }

    res.render("chats/chatDashboard", {
      currentUser,
      chats,
      chat: selectedChat,
      otherUser,
      otherUserId: selectedUserId || null,
    });
  } catch (err) {
    console.error("❌ Error in chatDashboard:", err);
    res.status(500).send("Server error");
  }
};
