# Alexandria Last Chance - Admin Dashboard Setup Guide

## Overview
The system now includes a fully functional **Admin Dashboard** that enables **one-click demo data generation** for client showcases. This guide explains how to access and use it.

---

## Quick Start

### 1. **Access the Admin Dashboard**
- **URL**: `http://localhost:3000/admin-dashboard` (after Angular app loads)
- **Navigation**: Click the **⚙️ Admin** button in the top navbar
- **No Login Required**: Admin panel is accessible for demo purposes

---

## Admin Dashboard Features

### **Quick Actions Bar**
Three primary buttons for managing the demo:

#### 🌱 **Seed Demo Data** (Primary CTA)
- **What it does**: Generates realistic Egyptian marketplace data in ONE click
- **Creates**:
  - ✅ 4 vendors (Sidi Gaber Fashion, Miami Electronics, Smouha Grocers, Victoria Shoes)
  - ✅ 4 customer accounts with realistic Egyptian names
  - ✅ 10+ products across Fashion, Electronics, Grocery, and Shoes categories
  - ✅ 4 orders with complete order history and payment data
  - ✅ 5+ bilingual reviews (Arabic + English) with sentiment analysis
- **Status Indicator**: Button shows "⏳ Seeding..." while processing
- **Response**: Alert confirms seeded items count

#### 🔄 **Refresh Stats**
- Reloads all dashboard metrics in real-time
- Use after placing orders or making changes

#### 📊 **Export Orders**
- Downloads all orders as **CSV file** for reporting
- Includes: Order ID, Customer, Vendor, Items, Amount, Status, Date

---

## Dashboard Metrics

### **System Status** (Top Section)
Real-time connectivity indicators:
- **Database**: Connection status (Connected/Disconnected)
- **Users**: Total user count in system
- **Products**: Total product catalog size
- **Status**: Overall system health

### **Overview Grid**
Quick glance statistics:
- **Vendors**: Total merchant count
- **Customers**: Total buyer count
- **Products**: Total merchandise items
- **Low Stock**: Alert for items < 10 units (RED highlight)

### **Orders Breakdown**
- **Total Orders**: All orders in system
- **Completed** (GREEN): Successfully delivered orders
- **Processing** (YELLOW): Orders being fulfilled
- **Pending** (ORANGE): New/unpaid orders

### **Revenue Analytics**
- **Total Revenue**: Cumulative sales in EGP (Egyptian Pounds)
- **Average Order Value**: Mean revenue per transaction

### **🏆 Top Vendors** Table
Top 5 performers by sales:
- Vendor name
- Order count
- Total sales in EGP

### **⭐ Quality Metrics**
- **Total Reviews**: Count of all customer reviews
- **Average Rating**: Mean rating (out of 5 stars)

### **📋 Recent Orders** Table
Latest 10 orders with:
- Order ID (truncated)
- Customer name
- Vendor name
- Transaction amount
- Status badge (color-coded)
- Order date

---

## Demo Credentials

After seeding, use these credentials to test the system:

### **Vendor Login** (For vendor dashboard)
```
Email: sidi-gaber-fashion@alexchance.com
Password: vendor123
```

### **Customer Login** (For user dashboard)
```
Email: mariam.elsayed@gmail.com
Password: customer123
```

### **Admin Access**
- **Admin Key** (for API calls): `alex-admin-2026-secret`
- **Required Header**: `x-admin-key: alex-admin-2026-secret`

---

## Client Walkthrough Script

### **Flow for Client Demonstration:**

1. **Home Page** (3 min)
   - Show marketplace with vendors & products
   - Highlight flash deals & inventory clearance concept

2. **Admin Dashboard** (2 min)
   - Navigate to admin dashboard via navbar
   - Click **"🌱 Seed Demo Data"**
   - Watch alert confirm data creation

3. **View Generated Data** (3 min)
   - Observe metrics update:
     - 4 vendors populated
     - 25+ products listed
     - 4 orders showing
     - ⭐ Average rating displayed
   - Mention realistic Alexandria districts (Sidi Gaber, Smouha, Miami, Victoria)

4. **Marketplace Browse** (3 min)
   - Go to home page
   - Show vendor shops with real inventory
   - Highlight pricing, discounts, stock levels

5. **Customer Purchase Flow** (5 min)
   - Login with customer credentials
   - Browse products
   - Add items to cart
   - Proceed to checkout
   - Demonstrate payment processing (mock Stripe gateway)

6. **Order Confirmation** (2 min)
   - Show order confirmation page
   - Highlight QR code for pickup verification
   - Show Alex-Chain blockchain hash (immutable record)

7. **Analytics Review** (2 min)
   - Return to admin dashboard
   - Show updated metrics
   - Export orders CSV to demonstrate reporting

**Total Demo Time**: ~20 minutes

---

## API Endpoints (Backend)

### **Authentication**
All admin endpoints require header: `x-admin-key: alex-admin-2026-secret`

### **Available Endpoints**

#### `POST /api/admin/seed-demo-data`
```bash
curl -X POST http://localhost:3000/api/admin/seed-demo-data \
  -H "x-admin-key: alex-admin-2026-secret"
```
**Response**:
```json
{
  "success": true,
  "stats": {
    "vendors": 4,
    "customers": 4,
    "products": 12,
    "orders": 4,
    "reviews": 5
  }
}
```

#### `GET /api/admin/admin-stats`
```bash
curl http://localhost:3000/api/admin/admin-stats \
  -H "x-admin-key: alex-admin-2026-secret"
```
**Returns**: Complete dashboard metrics (vendors, orders, revenue, top performers, etc.)

#### `GET /api/admin/health`
```bash
curl http://localhost:3000/api/admin/health \
  -H "x-admin-key: alex-admin-2026-secret"
```
**Returns**: Database connection status, user count, product count

#### `GET /api/admin/export-orders-csv`
```bash
curl http://localhost:3000/api/admin/export-orders-csv?adminKey=alex-admin-2026-secret
```
**Returns**: CSV file download

---

## Tech Stack Behind Admin Features

### **Frontend**
- **Angular 19** standalone component: `admin-dashboard.component.ts`
- **Real-time HTTP polling**: Fetches metrics every refresh
- **Responsive Design**: Dark slate theme with glass-morphism effects
- **Standalone**: No module dependencies

### **Backend**
- **Express Route**: `/api/admin` route handler
- **MongoDB Aggregations**: Real-time analytics queries
- **Admin Middleware**: Simple key-based authentication
- **CSV Generation**: Dynamic export functionality

### **Data Generation**
- **Script**: `backend/scripts/seed-demo-data.js`
- **Realistic Data**:
  - Egyptian vendor names & locations
  - Arabic/English bilingual content
  - Realistic pricing (EGP currency)
  - Historical order data with timestamps
  - Sentiment-analyzed reviews

---

## Troubleshooting

### **"Unauthorized" Error on Seed**
- Ensure header `x-admin-key: alex-admin-2026-secret` is sent
- Check backend is running on `localhost:3000`
- Verify MongoDB is connected

### **Metrics Not Updating**
- Click **"Refresh Stats"** button
- Check browser console for HTTP errors
- Verify backend API responses

### **Payment Processing Mock**
- Configuration: `backend/utils/payment-gateway.js`
- Success rate: 98% (2% failure for realistic scenarios)
- Mock credentials: Any card works (testing mode)

### **CSV Export Blank**
- Ensure data has been seeded first
- Verify orders exist in admin-stats display
- Check admin key parameter in export URL

---

## Production Considerations

⚠️ **Security Notes** (for production deployment):
- ✅ Replace simple key auth with OAuth2 / RBAC
- ✅ Implement role-based admin access control
- ✅ Add audit logging for all admin actions
- ✅ Secure payment gateway (replace mock Stripe)
- ✅ Implement rate limiting on seeding endpoint
- ✅ Encrypt admin credentials in environment variables

---

## Files Modified/Created

### **Frontend**
- `frontend/src/app/app.routes.ts` - Added admin route
- `frontend/src/app/app.html` - Added admin navbar button
- `frontend/src/app/components/admin/admin-dashboard.component.ts` - NEW (200+ lines)

### **Backend**
- `backend/routes/admin.js` - NEW (admin endpoints)
- `backend/routes/payment.js` - NEW (payment processing)
- `backend/utils/payment-gateway.js` - NEW (mock Stripe)
- `backend/scripts/seed-demo-data.js` - NEW (data generation)
- `backend/index.js` - Updated (route registration)

---

## Next Steps

1. **Test the Flow**: Seed data → Browse marketplace → Make purchase
2. **Customize Demo Data**: Edit `seed-demo-data.js` for your specific use case
3. **Add More Vendors**: Extend vendor array in seed script
4. **Customize Metrics**: Add industry-specific KPIs to admin-stats
5. **Integrate Real Payment**: Connect Stripe/PayPal for production

---

## Support

For issues or feature requests:
- Check backend console for errors
- Verify MongoDB connection: `mongodb://localhost:27017/alex-last-chance`
- Ensure Angular dev server is running on `http://localhost:4200`
- Backend must run on `http://localhost:3000`

---

**Version**: 2.0 | **Last Updated**: Phase 10 | **Status**: Ready for Client Demo ✅
