const express = require('express');
const initSqlJs = require('sql.js');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
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

// Initialize SQLite Database
let db = null;
const dbPath = path.join(__dirname, 'alexandria.db');

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  let data;
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
  }
  
  db = new SQL.Database(data);
  
  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      dealExpiresAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      total REAL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      message TEXT,
      read INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
  
  saveDatabase();
  console.log('SQLite Database initialized');
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Auto-save database every 30 seconds
setInterval(saveDatabase, 30000);

app.use(cors());
app.use(express.json());

// Make db and io accessible in routes
app.set('db', db);
app.set('io', io);

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Automated Cleanup (Runs every midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('--- Cleanup Task Started ---');
  try {
    if (db) {
      const now = new Date().toISOString();
      db.run('DELETE FROM products WHERE dealExpiresAt < ?', [now]);
      saveDatabase();
      console.log('Cleaned up expired deals.');
    }
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
  res.send('Alexandria Last Chance API is running (SQLite with sql.js)');
});

// Initialize database and start server
initDatabase().then(() => {
  server.listen(port, () => {
    console.log(`Server with WebSockets is running at http://localhost:${port}`);
    console.log('Database: SQLite (alexandria.db)');
  });
}).catch(err => {
  console.error('Database initialization error:', err);
});
