const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 3000;
let db = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
async function initializeDatabase() {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'alexandria.db');
    let data;
    
    if (fs.existsSync(dbPath)) {
      data = fs.readFileSync(dbPath);
    }
    
    db = new SQL.Database(data);
    
    // Create tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        username TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        discountPrice REAL,
        stock INTEGER DEFAULT 0,
        vendorId TEXT,
        category TEXT,
        images TEXT,
        dealExpiresAt DATETIME,
        isFeatured INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        items TEXT,
        total REAL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        message TEXT,
        type TEXT DEFAULT 'info',
        isRead INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'EGP',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        productId TEXT,
        userId TEXT,
        rating INTEGER,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    tables.forEach(sql => {
      try {
        db.run(sql);
      } catch (e) {
        // Table might already exist
      }
    });
    
    saveDatabase();
    console.log('✅ Database initialized');
    return db;
  } catch (err) {
    console.error('❌ Database error:', err.message);
    throw err;
  }
}

function saveDatabase() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      const dbPath = path.join(__dirname, 'alexandria.db');
      fs.writeFileSync(dbPath, buffer);
    } catch (err) {
      console.error('Save error:', err);
    }
  }
}

// Auto-save database
setInterval(saveDatabase, 30000);

// Make db accessible in routes
app.set('db', db);
app.set('io', io);

// WebSocket
io.on('connection', (socket) => {
  console.log('🔌 Client:', socket.id);
  socket.on('disconnect', () => console.log('❌ Disconnected:', socket.id));
});

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Alexandria API v1.0',
    status: 'running',
    database: 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Auth
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const id = Date.now().toString();
    db.run(
      'INSERT INTO users (id, email, password, username) VALUES (?, ?, ?, ?)',
      [id, email, password, username]
    );
    saveDatabase();
    
    res.json({ success: true, userId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const result = db.exec('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (result.length > 0) {
      res.json({ success: true, user: result[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB error' });
    res.json(db.exec('SELECT * FROM products LIMIT 50'));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, description, price, stock, vendorId } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const id = Date.now().toString();
    db.run(
      'INSERT INTO products (id, name, description, price, stock, vendorId) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, price, stock, vendorId]
    );
    saveDatabase();
    res.json({ success: true, productId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Orders
app.get('/api/orders', (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB error' });
    res.json(db.exec('SELECT * FROM orders LIMIT 50'));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { userId, total, status } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const id = Date.now().toString();
    db.run(
      'INSERT INTO orders (id, userId, total, status) VALUES (?, ?, ?, ?)',
      [id, userId, total, status || 'pending']
    );
    saveDatabase();
    res.json({ success: true, orderId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Notifications
app.post('/api/notifications', (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const id = Date.now().toString();
    db.run(
      'INSERT INTO notifications (id, userId, message) VALUES (?, ?, ?)',
      [id, userId, message]
    );
    saveDatabase();
    io.emit('notification', { userId, message });
    
    res.json({ success: true, notificationId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Wallets
app.get('/api/wallet/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const result = db.exec('SELECT * FROM wallets WHERE userId = ?', [userId]);
    if (result.length > 0) {
      res.json(result[0].values[0]);
    } else {
      res.json({ userId, balance: 0, currency: 'EGP' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/wallet', (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const id = Date.now().toString();
    db.run(
      'INSERT OR REPLACE INTO wallets (id, userId, balance) VALUES (?, ?, (SELECT COALESCE(balance, 0) + ? FROM wallets WHERE userId = ?))',
      [id, userId, amount, userId]
    );
    saveDatabase();
    
    res.json({ success: true, walletId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reviews
app.get('/api/reviews/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const result = db.exec('SELECT * FROM reviews WHERE productId = ? LIMIT 50', [productId]);
    res.json(result.length > 0 ? result[0].values : []);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    if (!db) return res.status(500).json({ error: 'DB error' });
    
    const id = Date.now().toString();
    db.run(
      'INSERT INTO reviews (id, productId, userId, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [id, productId, userId, rating, comment]
    );
    saveDatabase();
    
    res.json({ success: true, reviewId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start
async function start() {
  try {
    await initializeDatabase();
    server.listen(port, () => {
      console.log(`\n🚀 API running at http://localhost:${port}`);
      console.log(`📊 Database: SQLite\n`);
    });
  } catch (err) {
    console.error('Start error:', err);
    process.exit(1);
  }
}

start();
module.exports = { app, server, io };
