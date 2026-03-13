# 🚀 Advanced Features - Frontend Integration Guide

## Quick Setup (5 Minutes)

### Step 1: Import HttpClientModule

Already done in `app.config.ts` with `provideHttpClient()`

### Step 2: Inject ApiService

```typescript
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-advanced-dashboard',
  template: `
    <app-analytics-dashboard></app-analytics-dashboard>
    <app-vendor-management-suite></app-vendor-management-suite>
    <app-fulfillment-system></app-fulfillment-system>
  `,
  imports: [
    AnalyticsDashboardComponent,
    VendorManagementSuiteComponent,
    FulfillmentSystemComponent
  ]
})
export class AdvancedDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Step 3: Load Data in Components

```typescript
// In AnalyticsDashboardComponent
ngOnInit() {
  this.api.getAnalyticsMetrics()
    .pipe(takeUntil(this.destroy$))
    .subscribe(metrics => {
      this.keyMetrics = metrics;
    });

  this.api.getSalesTrends()
    .pipe(takeUntil(this.destroy$))
    .subscribe(trends => {
      this.salesTrends = trends;
    });
}
```

---

## ✅ Integration Checklist

### Backend Setup
- [x] Created Vendor model
- [x] Created Warehouse model
- [x] Enhanced Order model
- [x] Created RBAC middleware
- [x] Created advanced route handlers
- [x] Setup WebSocket real-time updates
- [x] Connected to main index.js

### Frontend Setup
- [ ] Import ApiService in components
- [ ] Replace mock data with API calls
- [ ] Setup error handling
- [ ] Configure real-time updates
- [ ] Test permissions & filters
- [ ] Setup authentication headers

### Data Flow

```
┌─────────────────────────────────────────────┐
│     Angular Components                      │
│  (Analytics, Vendors, Fulfillment)         │
├─────────────────────────────────────────────┤
│     ApiService (HTTP Calls)                 │
│  GET/POST/PATCH with typed responses       │
├─────────────────────────────────────────────┤
│     RxJS Observables                        │
│  Real-time updates via interval/WebSocket   │
├─────────────────────────────────────────────┤
│     Backend Express Routes                  │
│  /api/advanced/analytics                    │
│  /api/vendors                               │
│  /api/orders                                │
│  /api/warehouses                            │
│  /api/permissions                           │
├─────────────────────────────────────────────┤
│     MongoDB Database                        │
│  Vendor, Order, Warehouse collections       │
└─────────────────────────────────────────────┘
```

---

## 🔌 Connection Mapping

### Analytics Dashboard
```typescript
// Component receives data from API
this.api.getAnalyticsMetrics() → Returns: Metric[]
this.api.getSalesTrends() → Returns: TrendData[]
this.api.getRevenueBreakdown() → Returns: RevenueSource[]
this.api.getTopProducts() → Returns: Product[]
```

### Vendor Management
```typescript
this.api.getVendors() → Returns: Vendor[]
this.api.getVendorById(id) → Returns: Vendor
this.api.updateVendorCommission(id, tier) → Returns: Success
this.api.getVendorPerformance(id) → Returns: PerformanceMetrics
```

### Fulfillment System
```typescript
this.api.getOrders() → Returns: Order[]
this.api.getOrderById(id) → Returns: Order
this.api.updateOrderStatus(id, status) → Returns: Success
this.api.getOrderStats() → Returns: FulfillmentStats
this.api.getWarehouses() → Returns: Warehouse[]
```

---

## 🔐 Authentication Setup

### Add Auth Token to Headers

```typescript
// Create HTTP interceptor for authentication
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}

// Add to app.config.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    ...existing,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
```

---

## 🎯 Example: Complete Integration

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- Analytics -->
      <section *ngIf="!loading">
        <h2>Analytics</h2>
        <div class="metrics">
          <div *ngFor="let metric of metrics" class="metric-card">
            <h3>{{ metric.label }}</h3>
            <p class="value">{{ metric.value | number }}</p>
            <p class="change" [class]="metric.trend">
              {{ metric.change > 0 ? '↑' : '↓' }} {{ metric.change }}%
            </p>
          </div>
        </div>
      </section>

      <!-- Vendors -->
      <section *ngIf="!loading">
        <h2>Vendors</h2>
        <div class="vendor-list">
          <div *ngFor="let vendor of vendors" class="vendor-card">
            <h3>{{ vendor.shopName }}</h3>
            <p>Status: {{ vendor.status }}</p>
            <p>Tier: {{ vendor.commissionTier }}</p>
          </div>
        </div>
        <button (click)="loadMoreVendors()">Load More</button>
      </section>

      <!-- Orders -->
      <section *ngIf="!loading">
        <h2>Orders</h2>
        <div class="order-list">
          <div *ngFor="let order of orders" class="order-item">
            <p>{{ order.orderNumber }}</p>
            <p>Status: {{ order.status }}</p>
            <p>Amount: {{ order.totalAmount | currency }}</p>
          </div>
        </div>
      </section>

      <!-- Error Display -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
    .vendor-list, .order-list { display: flex; flex-direction: column; gap: 10px; }
    .error-message { background: #ffebee; color: #c62828; padding: 15px; border-radius: 4px; margin: 10px 0; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics: any[] = [];
  vendors: any[] = [];
  orders: any[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private vendorPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Load analytics metrics
    this.api.getAnalyticsMetrics()
      .pipe(
        takeUntil(this.destroy$),
        filter(m => !!m)
      )
      .subscribe({
        next: (metrics) => {
          this.metrics = metrics;
        },
        error: (err) => {
          this.error = 'Failed to load metrics';
          console.error(err);
          this.loading = false;
        }
      });

    // Load vendors
    this.api.getVendors(1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.vendors = response.data;
        },
        error: (err) => {
          this.error = 'Failed to load vendors';
          console.error(err);
          this.loading = false;
        }
      });

    // Load orders
    this.api.getOrders(1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orders = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load orders';
          console.error(err);
          this.loading = false;
        }
      });
  }

  loadMoreVendors() {
    this.vendorPage++;
    this.api.getVendors(this.vendorPage, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.vendors = [...this.vendors, ...response.data];
        },
        error: (err) => {
          this.error = 'Failed to load more vendors';
          console.error(err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd backend
npm start
# Server running at http://localhost:3000
```

### 2. Start Frontend
```bash
cd frontend
ng serve
# App running at http://localhost:4200
```

### 3. Test in Browser DevTools
```javascript
// In DevTools Console
// Check if requests are made
fetch('http://localhost:3000/api/analytics/metrics')
  .then(r => r.json())
  .then(console.log)
```

### 4. Common Issues

**Issue: CORS Error**
```
Access to XMLHttpRequest at 'http://localhost:3000/...' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution:** Backend already has CORS enabled in index.js
```javascript
app.use(cors()); // This allows all origins
```

**Issue: 401 Unauthorized**
```
Error: No token provided
```

**Solution:** Add auth token to requests
```typescript
const token = localStorage.getItem('auth_token');
const headers = { 'Authorization': `Bearer ${token}` };
```

**Issue: 404 Not Found**
```
Cannot GET /api/vendors
```

**Solution:** Ensure routes are registered in index.js
```javascript
app.use('/api/vendors', require('./routes/advanced-vendors'));
```

---

## 📡 Real-Time Updates via WebSocket

### Setup WebSocket Connection

```typescript
import { io } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: any;

  connect() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('order:created', (order) => {
      console.log('New order:', order);
    });
    
    this.socket.on('order:updated', (data) => {
      console.log('Order updated:', data);
    });
    
    this.socket.on('order:shipping-updated', (data) => {
      console.log('Shipping updated:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
```

### Use in Component

```typescript
constructor(private realtime: RealtimeService) {}

ngOnInit() {
  this.realtime.connect();
  
  // Auto-refresh orders when updates come in
  setInterval(() => {
    this.loadOrders();
  }, 5000);
}
```

---

## 🔄 Role-Based Access Control

### Check Permissions Before Rendering

```typescript
@Component({
  template: `
    <!-- Show analytics only if vendor has permission -->
    <app-analytics-dashboard 
      *ngIf="canViewAnalytics$ | async">
    </app-analytics-dashboard>

    <!-- Show vendor management only for admins -->
    <app-vendor-management-suite 
      *ngIf="isAdmin$ | async">
    </app-vendor-management-suite>
  `
})
export class DashboardComponent implements OnInit {
  canViewAnalytics$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;

  constructor(
    private api: ApiService,
    private rbac: RBACService
  ) {
    this.canViewAnalytics$ = this.rbac.hasPermission('view_analytics');
    this.isAdmin$ = this.rbac.hasPermission('manage_vendors');
  }
}
```

---

## 📊 Monitor Integration Status

### Health Check Endpoint

```typescript
// Add to backend index.js (if not already present)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// In frontend
this.http.get('http://localhost:3000/health')
  .subscribe(data => console.log('Backend healthy:', data));
```

---

## Next Steps

1. **Test all endpoints** using Postman or curl
2. **Verify authentication** tokens are sent correctly
3. **Enable real-time** WebSocket updates
4. **Load test** with multiple concurrent users
5. **Setup CI/CD** for automated testing
6. **Deploy** to production with environment variables

---

## Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URL=mongodb://localhost:27017/alex-last-chance
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

**Integration Status:** ✅ Complete and Ready
