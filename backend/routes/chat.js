const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Chat Message Model
const chatSchema = new mongoose.Schema({
  conversationId: String,
  senderId: mongoose.Schema.Types.ObjectId,
  senderName: String,
  senderRole: String, // user, vendor, support_agent
  message: String,
  attachments: [String],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Conversation Model
const conversationSchema = new mongoose.Schema({
  _id: String,
  participants: [mongoose.Schema.Types.ObjectId],
  type: String, // customer-vendor, customer-support, vendor-platform
  subject: String,
  lastMessage: String,
  lastMessageTime: Date,
  status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

// Middleware to get auth token
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: 'No auth token' });
  req.userId = token; // In real app, decode JWT here
  next();
};

// Get chat history
router.get('/history/:conversationId', authMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage
      .find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations for user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation
      .find({ participants: req.userId })
      .sort({ lastMessageTime: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start support conversation
router.post('/support/start', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = new Conversation({
      _id: conversationId,
      participants: [req.userId],
      type: 'customer-support',
      subject,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await conversation.save();

    const chatMessage = new ChatMessage({
      conversationId,
      senderId: req.userId,
      senderName: 'Customer',
      senderRole: 'user',
      message,
      createdAt: new Date()
    });
    await chatMessage.save();

    res.json({ conversationId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get support agents
router.get('/support/agents', async (req, res) => {
  try {
    // Mock data - in real app, fetch from User model
    const agents = [
      {
        id: '1',
        name: 'Ahmed Support',
        avatar: 'https://via.placeholder.com/40',
        status: 'online',
        rating: 4.8,
        activeChats: 2
      },
      {
        id: '2',
        name: 'Fatima Help',
        avatar: 'https://via.placeholder.com/40',
        status: 'online',
        rating: 4.9,
        activeChats: 1
      },
      {
        id: '3',
        name: 'Khalid Support',
        avatar: 'https://via.placeholder.com/40',
        status: 'away',
        rating: 4.7,
        activeChats: 0
      }
    ];
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate conversation
router.post('/rate/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { rating, feedback, status: 'resolved', updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.post('/mark-read/:messageId', authMiddleware, async (req, res) => {
  try {
    await ChatMessage.findByIdAndUpdate(req.params.messageId, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
