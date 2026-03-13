const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Make io accessible in routes
app.set('io', io);

// Automated Flash Sale Cleanup (Runs every midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('--- Flash Sale Cleanup Task Started ---');
  try {
    const now = new Date();
    const expired = await Product.deleteMany({ dealExpiresAt: { $lt: now } });
    console.log(`Cleaned up ${expired.deletedCount} expired deals.`);
  } catch (err) {
    console.error('CRON ERROR:', err);
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/seed', require('./routes/seed'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/subscription', require('./routes/wallet'));
app.use('/api/rewards', require('./routes/wallet'));
app.use('/api/referral', require('./routes/wallet'));
app.use('/api/membership', require('./routes/wallet'));
app.use('/api/ai', require('./routes/ai'));

// Advanced Features Routes
app.use('/api/advanced/analytics', require('./routes/advanced-analytics'));
app.use('/api/vendors', require('./routes/advanced-vendors'));
app.use('/api/orders', require('./routes/advanced-orders'));
app.use('/api/warehouses', require('./routes/advanced-warehouses'));
app.use('/api/permissions', require('./routes/advanced-permissions'));

// Simple check
app.get('/', (req, res) => {
  res.send('Alexandria Last Chance API is running');
});

// Database Connection
mongoose.connect('mongodb://localhost:27017/alex-last-chance').then(() => {
  console.log('Connected to MongoDB: alex-last-chance');
  server.listen(port, () => {
    console.log(`Server with WebSockets is running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Database connection error:', err);
});

// Export io and app for use in other modules
module.exports = { app, server, io };
