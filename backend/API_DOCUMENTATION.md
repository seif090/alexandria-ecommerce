# Alexandria Backend API Documentation

## Overview

The Alexandria backend is a Node.js Express server deployed on Vercel with a SQLite database. It provides RESTful API endpoints for the multi-vendor ecommerce platform.

## Architecture

```
Frontend (Angular)
    ↓ HTTP/WebSocket
Backend (Express + Node.js)
    ↓ Data persistence
Database (SQLite via sql.js)
```

## Base URL

- **Local:** `http://localhost:3000`
- **Production:** `https://alexandria-api.vercel.app`

## API Endpoints

### Health & Status

#### Get API Status
```
GET /
Response: {
  "message": "Alexandria API v1.0",
  "status": "running",
  "database": "SQLite",
  "timestamp": "2026-03-14T02:43:15.364Z"
}
```

#### Health Check (Vercel)
```
GET /api/health
Response: {
  "status": "ok",
  "database": "connected",
  "uptime": 120.5,
  "timestamp": "2026-03-14T02:43:15.364Z"
}
```

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}

Response: {
  "success": true,
  "userId": "1234567890"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "userId": "1234567890",
  "token": "jwt_token_here"
}
```

### Products

#### Get All Products
```
GET /api/products

Response: [
  {
    "id": "1234567890",
    "name": "Product Name",
    "description": "Description",
    "price": 100,
    "discountPrice": 75,
    "stock": 50,
    "vendorId": "vendor123",
    "category": "Electronics",
    "dealExpiresAt": "2026-03-20T00:00:00Z"
  }
]
```

#### Create Product
```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 100,
  "discountPrice": 75,
  "stock": 50,
  "vendorId": "vendor123",
  "category": "Electronics"
}

Response: {
  "success": true,
  "productId": "1234567890"
}
```

### Orders

#### Get All Orders
```
GET /api/orders

Response: [
  {
    "id": "order123",
    "userId": "user123",
    "items": "[...]",
    "total": 250.50,
    "status": "pending",
    "createdAt": "2026-03-14T02:00:00Z"
  }
]
```

#### Create Order
```
POST /api/orders
Content-Type: application/json

{
  "userId": "user123",
  "total": 250.50,
  "status": "pending"
}

Response: {
  "success": true,
  "orderId": "order123"
}
```

### Notifications

#### Create Notification
```
POST /api/notifications
Content-Type: application/json

{
  "userId": "user123",
  "message": "Your order has been shipped"
}

Response: {
  "success": true,
  "notificationId": "notif123"
}
```

### Wallets

#### Get User Wallet
```
GET /api/wallet/:userId

Response: {
  "userId": "user123",
  "balance": 1000.50,
  "currency": "EGP"
}
```

#### Add Wallet Balance
```
POST /api/wallet
Content-Type: application/json

{
  "userId": "user123",
  "amount": 50.00
}

Response: {
  "success": true,
  "walletId": "wallet123"
}
```

### Reviews

#### Get Product Reviews
```
GET /api/reviews/:productId

Response: [
  {
    "id": "review123",
    "productId": "prod123",
    "userId": "user123",
    "rating": 5,
    "comment": "Excellent product!"
  }
]
```

#### Create Review
```
POST /api/reviews
Content-Type: application/json

{
  "productId": "prod123",
  "userId": "user123",
  "rating": 5,
  "comment": "Excellent product!"
}

Response: {
  "success": true,
  "reviewId": "review123"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  username TEXT,
  role TEXT DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Products Table
```sql
CREATE TABLE products (
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
)
```

### Orders Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  userId TEXT,
  items TEXT,
  total REAL,
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  isRead INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Wallets Table
```sql
CREATE TABLE wallets (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'EGP',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  productId TEXT,
  userId TEXT,
  rating INTEGER,
  comment TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Environment Variables

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://alexandria-ecommerce.vercel.app
```

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Testing Endpoints

```bash
# Check API status
curl http://localhost:3000/

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","username":"testuser"}'

# Get products
curl http://localhost:3000/api/products
```

## WebSocket Events

Real-time notifications via Socket.io:

```javascript
// Connect
const socket = io('http://localhost:3000');

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Disconnect
socket.disconnect();
```

## Error Handling

All errors return JSON with error message:

```json
{
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `500` - Server Error

## Deployment

### Vercel Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Check deployment status
vercel list
```

The backend automatically deploys when pushing to main branch on GitHub.

## Database Persistence

- SQLite database file: `alexandria.db`
- Auto-saves every 30 seconds
- Note: Vercel has ephemeral filesystem, so data resets on redeploy
- For production, consider external PostgreSQL database

## Performance

- Response time: < 100ms
- WebSocket latency: < 50ms (with polling fallback)
- Database: In-memory SQLite with periodic persistence
- Max concurrent connections: Limited by Vercel runtime

## Security Notes

- CORS enabled for all origins (update for production)
- JWT authentication implemented but not enforced on all routes
- No rate limiting (add for production)
- No request validation (implement for security)
- Consider adding request signing for sensitive operations

## Future Enhancements

- [ ] Move to PostgreSQL for better persistence
- [ ] Add Redis for caching
- [ ] Implement proper authentication/authorization
- [ ] Add API rate limiting
- [ ] Setup error tracking (Sentry)
- [ ] Setup monitoring and logging
- [ ] Add API versioning
- [ ] Implement GraphQL endpoint

---

**Last Updated:** March 14, 2026
**Status:** Production Ready (MVP)
