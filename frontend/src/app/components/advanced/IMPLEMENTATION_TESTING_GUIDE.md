# ✅ Advanced Features - Implementation & Testing Guide

## Implementation Checklist

### Backend Implementation (Completed ✅)

- [x] Create Vendor model with commission & permission tracking
- [x] Create Warehouse model with capacity management
- [x] Enhanced Order model with fulfillment tracking
- [x] RBAC middleware with permission checking
- [x] Advanced Analytics Routes
  - [x] GET /api/advanced/analytics/metrics
  - [x] GET /api/advanced/analytics/sales/trends
  - [x] GET /api/advanced/analytics/revenue/breakdown
  - [x] GET /api/advanced/analytics/products/top
  - [x] GET /api/advanced/analytics/search
- [x] Vendor Management Routes
  - [x] GET /api/vendors (list with pagination)
  - [x] GET /api/vendors/:id (detail view)
  - [x] POST /api/vendors (create)
  - [x] PATCH /api/vendors/:id (update)
  - [x] PATCH /api/vendors/:id/commission (commission tier)
  - [x] PATCH /api/vendors/:id/permissions (RBAC)
  - [x] PATCH /api/vendors/:id/suspend (suspension)
  - [x] GET /api/vendors/:id/performance (metrics)
- [x] Order Management Routes
  - [x] GET /api/orders (list)
  - [x] GET /api/orders/:id (detail)
  - [x] POST /api/orders (create)
  - [x] PATCH /api/orders/:id/status (update status)
  - [x] PATCH /api/orders/:id/shipping (update shipping)
  - [x] POST /api/orders/:id/refund (refund request)
  - [x] GET /api/orders/stats/fulfillment (statistics)
- [x] Warehouse Routes
  - [x] GET /api/warehouses (list)
  - [x] GET /api/warehouses/:id (detail)
  - [x] POST /api/warehouses (create)
  - [x] PATCH /api/warehouses/:id (update)
  - [x] PATCH /api/warehouses/:id/capacity (capacity management)
  - [x] GET /api/warehouses/:id/inventory (inventory status)
  - [x] GET /api/warehouses/stats/overview (network overview)
- [x] Permission Routes
  - [x] GET /api/permissions/current (current user permissions)
  - [x] GET /api/permissions/:role (role permissions)
  - [x] POST /api/permissions/check (check permission)
  - [x] PATCH /api/permissions/vendor/:vendorId (update permissions)
- [x] WebSocket Real-time Updates
  - [x] order:created event
  - [x] order:updated event
  - [x] order:shipping-updated event
  - [x] order:refund-updated event
- [x] RBAC Middleware
  - [x] Authentication (JWT verification)
  - [x] Authorization (role checking)
  - [x] Permission checking
  - [x] Resource ownership validation
  - [x] Rate limiting
  - [x] Audit logging

### Frontend Implementation (In Progress)

- [x] Create ApiService with all endpoints
- [x] Create error handling service
- [x] Create frontend integration guide
- [ ] Update components to use ApiService
- [ ] Setup authentication interceptor
- [ ] Configure WebSocket client
- [ ] Complete RBAC in frontend
- [ ] Test all components with real data

---

## API Testing Guide

### Prerequisites
```bash
# Install curl or use Postman
# Backend running on http://localhost:3000
# Frontend running on http://localhost:4200
```

### 1. Health Check
```bash
curl http://localhost:3000/
# Expected: "Alexandria Last Chance API is running"
```

### 2. Test Analytics Endpoints

#### Get Metrics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/advanced/analytics/metrics
```

**Expected Response:**
```json
[
  {
    "label": "Sales",
    "value": 12540,
    "change": 12.5,
    "trend": "up",
    "icon": "📊",
    "color": "cyan"
  },
  ...
]
```

#### Get Sales Trends
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/advanced/analytics/sales/trends?days=30"
```

#### Search Analytics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"q": "ORD-", "filters": {"status": "completed"}}' \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/advanced/analytics/search
```

### 3. Test Vendor Endpoints

#### Get All Vendors
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/vendors?page=1&limit=10"
```

**Expected Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "shopName": "Shop Name",
      "status": "active",
      "commissionTier": "Gold",
      "performance": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Get Vendor Performance
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/vendors/VENDOR_ID/performance
```

#### Update Commission Tier
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "Platinum"}' \
  http://localhost:3000/api/vendors/VENDOR_ID/commission
```

### 4. Test Order Endpoints

#### Get Orders
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders?page=1&limit=20&status=pending"
```

#### Create Order
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID",
        "vendor": "VENDOR_ID",
        "quantity": 2,
        "price": 100
      }
    ],
    "shippingAddress": {
      "city": "Cairo",
      "street": "Main St",
      "zipCode": "12345"
    }
  }' \
  http://localhost:3000/api/orders
```

#### Update Order Status
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}' \
  http://localhost:3000/api/orders/ORDER_ID/status
```

### 5. Test Warehouse Endpoints

#### Get Warehouses Overview
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/warehouses/stats/overview
```

**Expected Response:**
```json
{
  "totalWarehouses": 4,
  "totalCapacity": 10000,
  "totalUsed": 6500,
  "totalActive": 45,
  "warehouses": [
    {
      "id": "...",
      "name": "Cairo Hub",
      "city": "Cairo",
      "capacity": 2500,
      "used": 1800,
      "utilization": "72.00",
      "activeOrders": 12,
      "status": "yellow"
    }
  ]
}
```

### 6. Test Permission Endpoints

#### Get Current User Permissions
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/permissions/current
```

#### Check Specific Permission
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission": "view_analytics", "resource": "dashboard"}' \
  http://localhost:3000/api/permissions/check
```

---

## Frontend Testing Guide

### 1. Setup Test Environment

```typescript
// environment.test.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mockData: true,
  enableLogging: true
};
```

### 2. Test Components with Mock Data

```typescript
// Create mock API responses
const mockMetrics = [
  { label: 'Sales', value: 12540, change: 12.5, trend: 'up' }
];

// Create service spy
spyOn(apiService, 'getAnalyticsMetrics')
  .and.returnValue(of(mockMetrics));

// Test component logic
const fixture = TestBed.createComponent(AnalyticsDashboardComponent);
expect(fixture.componentInstance.metrics).toEqual(mockMetrics);
```

### 3. End-to-End Testing Scenarios

#### Scenario 1: Admin Views Analytics
```typescript
it('Admin can view analytics dashboard', () => {
  // Login as admin
  auth.login('admin@example.com', 'password');
  
  // Navigate to analytics
  router.navigate(['/admin/analytics']);
  
  // Verify data loads
  expect(apiService.getAnalyticsMetrics).toHaveBeenCalled();
});
```

#### Scenario 2: Vendor Manages Orders
```typescript
it('Vendor can update order status', () => {
  // Login as vendor
  auth.login('vendor@example.com', 'password');
  
  // Navigate to orders
  router.navigate(['/vendor/orders']);
  
  // Update order status
  apiService.updateOrderStatus('order-123', 'shipped');
  
  // Verify order updated
  expect(apiService.updateOrderStatus).toHaveBeenCalledWith('order-123', 'shipped');
});
```

#### Scenario 3: Real-Time Order Update
```typescript
it('Order updates appear in real-time', (done) => {
  // Subscribe to order updates
  realtime.orderUpdates$.subscribe(update => {
    expect(update.status).toBe('shipped');
    done();
  });
  
  // Simulate server update
  realtime.socket.emit('order:updated', { orderId: '123', status: 'shipped' });
});
```

---

## Validation Checklist

### Backend Validation

- [ ] All routes return correct status codes
  - [ ] 200 for successful GET
  - [ ] 201 for successful POST
  - [ ] 204 for successful DELETE
  - [ ] 400 for bad request
  - [ ] 401 for unauthorized
  - [ ] 403 for forbidden
  - [ ] 404 for not found
  - [ ] 500 for server error
  
- [ ] Data validation
  - [ ] Required fields enforced
  - [ ] Data types correct
  - [ ] Enum values validated
  - [ ] Relationships maintained

- [ ] Permission checks
  - [ ] Admin can access all resources
  - [ ] Vendor can only access own data
  - [ ] Customer restricted appropriately
  - [ ] Support role permissions correct

- [ ] Error handling
  - [ ] Meaningful error messages
  - [ ] Proper logging
  - [ ] No sensitive data leaked

### Frontend Validation

- [ ] Components display correctly
  - [ ] Mobile responsive (480px, 768px, 1024px)
  - [ ] Data renders properly
  - [ ] Animations smooth

- [ ] API integration
  - [ ] Correct endpoints called
  - [ ] Proper HTTP methods used
  - [ ] Headers sent correctly
  - [ ] Response data mapped correctly

- [ ] Real-time updates
  - [ ] WebSocket connects
  - [ ] Updates display immediately
  - [ ] No memory leaks
  - [ ] Subscribes cleaned up

- [ ] Permissions
  - [ ] UI shows/hides based on permissions
  - [ ] Routes protected correctly
  - [ ] Buttons disabled for unauthorized

- [ ] Error handling
  - [ ] Errors displayed to user
  - [ ] Network errors handled
  - [ ] Graceful degradation

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 200ms | - |
| Page Load Time | < 2s | - |
| Real-time Update Latency | < 100ms | - |
| Analytics Load | < 500ms | - |
| Vendor List Load | < 300ms | - |
| Order List Load | < 400ms | - |
| WebSocket Connect | < 100ms | - |

### Load Testing

```bash
# Test with Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/advanced/analytics/metrics

# Test with LoadRunner
loadrunner -vuser 50 -duration 60 http://localhost:3000
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All endpoints tested
- [ ] Error messages reviewed
- [ ] Logging configured
- [ ] CORS configured for production domain
- [ ] JWT secret changed
- [ ] Environment variables set
- [ ] Database backed up
- [ ] SSL/TLS configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup plan documented
- [ ] Rollback procedure ready

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: 401 Unauthorized
**Cause:** Missing or invalid JWT token

**Solution:**
```typescript
// Ensure token is included in all requests
const token = localStorage.getItem('auth_token');
headers: { 'Authorization': `Bearer ${token}` }
```

#### Issue: CORS Error
**Cause:** Frontend origin not allowed

**Solution:**
```javascript
// In backend/index.js - already configured
app.use(cors());  // Allow all origins (development only)
```

#### Issue: WebSocket Connection Failed
**Cause:** Socket.io not connected

**Solution:**
```typescript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
```

#### Issue: Vendors Not Loading
**Cause:** Query parameters incorrect

**Solution:**
```bash
# Correct format
GET /api/vendors?page=1&limit=10
# Wrong format
GET /api/vendors?page:1&limit:10
```

---

## Success Criteria

✅ All API endpoints responding correctly  
✅ Frontend components receiving data  
✅ Permissions enforced on backend and frontend  
✅ Real-time updates working via WebSocket  
✅ Mobile responsive across all breakpoints  
✅ Error handling graceful  
✅ Performance metrics met  
✅ Security best practices followed  
✅ Comprehensive logging in place  
✅ Documentation complete  

---

**Implementation Status:** 🚀 Ready for Testing & Deployment

**Last Updated:** March 2026
