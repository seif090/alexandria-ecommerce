# 🔧 Service Integration Guide

## Advanced Features Service - Complete Integration Reference

**Version:** 1.0  
**Last Updated:** March 2026  
**Scope:** Backend API integration, real-time updates, exports, permissions

---

## 📋 Table of Contents

1. [Service Overview](#service-overview)
2. [Core Services](#core-services)
3. [API Integration](#api-integration)
4. [Real-Time Updates](#real-time-updates)
5. [Export Functionality](#export-functionality)
6. [Permission System](#permission-system)
7. [Error Handling](#error-handling)
8. [Testing Guide](#testing-guide)

---

## 📱 Service Overview

### Service Architecture

```
┌─────────────────────────────────────────┐
│      Angular Components                 │
├─────────────────────────────────────────┤
│   AdvancedFeaturesService              │
│  ├─ Real-time Updates                  │
│  ├─ Advanced Filtering                 │
│  └─ Export Functionality               │
├─────────────────────────────────────────┤
│   ResponsiveService                     │
│  ├─ Screen Detection                   │
│  ├─ Breakpoint Management              │
│  └─ Layout Calculations                │
├─────────────────────────────────────────┤
│   RBACService                           │
│  ├─ Role Management                    │
│  ├─ Permission Checking                │
│  └─ Resource Access Control            │
├─────────────────────────────────────────┤
│   DataAnalyticsService                  │
│  ├─ Calculations                       │
│  ├─ Formatting                         │
│  └─ Trend Detection                    │
├─────────────────────────────────────────┤
│      HTTP Client / WebSocket            │
├─────────────────────────────────────────┤
│      Backend APIs                       │
└─────────────────────────────────────────┘
```

---

## 🎯 Core Services

### 1. AdvancedFeaturesService

#### Purpose
Central service for advanced features: real-time updates, filtering, exports, and permission checking.

#### Key Methods

```typescript
/**
 * Setup real-time data updates with interval
 * @param interval$ - Observable that emits values
 * @returns Observable of updated data
 */
setupRealtimeUpdates(interval$: Observable<any>): Observable<any>

/**
 * Apply advanced filters to data
 * @param query - Search query string
 * @param filters - Filter object
 * @returns Observable of filtered data
 */
applyAdvancedFilter(
  query: string, 
  filters: AdvancedFilter
): Observable<any[]>

/**
 * Export data in specified format
 * @param data - Data array to export
 * @param format - Export format (csv, json, pdf, excel)
 * @returns Observable of Blob
 */
exportData(
  data: any[], 
  format: 'csv' | 'json' | 'pdf' | 'excel'
): Observable<Blob>

/**
 * Check if user has permission
 * @param role - User role
 * @param action - Action to perform
 * @returns Observable<boolean>
 */
checkPermission(role: string, action: string): Observable<boolean>
```

#### Usage Example

```typescript
import { AdvancedFeaturesService } from './services/advanced-features.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div>
      <button (click)="setupRealTime()">Enable Real-Time</button>
      <button (click)="exportAnalytics()">Export Report</button>
      <input (input)="filterData($event)" placeholder="Search...">
    </div>
  `,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private advancedFeatures = inject(AdvancedFeaturesService);

  setupRealTime(): void {
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.advancedFeatures
          .setupRealtimeUpdates(of({})))
      )
      .subscribe(data => console.log('Updated:', data));
  }

  filterData(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.advancedFeatures
      .applyAdvancedFilter(query, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => console.log('Filtered:', results));
  }

  exportAnalytics(): void {
    const data = [...]; // Your analytics data
    this.advancedFeatures
      .exportData(data, 'csv')
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'analytics.csv';
        link.click();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### 2. ResponsiveService

#### Purpose
Handle responsive design logic, screen size detection, and layout calculations.

#### Key Methods

```typescript
/**
 * Get current screen size
 * @returns Observable with screen size: 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide'
 */
getScreenSize(): Observable<string>

/**
 * Check if screen is mobile
 * @returns boolean
 */
isMobile(): boolean

/**
 * Get grid columns based on current screen
 * @returns number of columns (1-4)
 */
getGridColumns(): number

/**
 * Get responsive padding size
 * @returns Padding size: 'sm' | 'md' | 'lg'
 */
getResponsivePadding(): string

/**
 * Observable stream of screen size changes
 */
screenSize$: Observable<string>
```

#### Usage Example

```typescript
@Component({
  selector: 'app-responsive-grid',
  template: `
    <div [ngClass]="'grid-cols-' + (gridCols$ | async)">
      <div *ngFor="let item of items" class="card">
        {{ item.name }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: grid;
    }
  `]
})
export class ResponsiveGridComponent {
  gridCols$ = this.responsive.getScreenSize().pipe(
    map(size => {
      switch(size) {
        case 'mobile': return 1;
        case 'tablet': return 2;
        case 'desktop': return 3;
        default: return 4;
      }
    })
  );

  constructor(private responsive: ResponsiveService) {}
}
```

---

### 3. RBACService

#### Purpose
Manage role-based access control and permissions.

#### Roles Available

```typescript
type UserRole = 'admin' | 'vendor' | 'customer' | 'support';

interface RolePermission {
  role: UserRole;
  permissions: string[];  // Actions allowed
  resources: string[];    // Data can access
}
```

#### Role Permission Matrix

| Action | Admin | Vendor | Customer | Support |
|--------|-------|--------|----------|---------|
| view_analytics | ✅ | ✅* | ❌ | ✅ |
| create_vendor | ✅ | ❌ | ❌ | ❌ |
| manage_orders | ✅ | ✅* | ❌ | ✅ |
| view_customers | ✅ | ✅* | ❌ | ✅ |
| export_data | ✅ | ✅ | ❌ | ✅ |
| manage_permissions | ✅ | ❌ | ❌ | ❌ |
| create_support_ticket | ✅ | ✅ | ✅ | ❌ |

*Vendor: Own data only

#### Key Methods

```typescript
/**
 * Set current user role
 * @param role - User role
 */
setUserRole(role: UserRole): void

/**
 * Check if current user has permission
 * @param permission - Permission to check
 * @returns Observable<boolean>
 */
hasPermission(permission: string): Observable<boolean>

/**
 * Check if current user can access resource
 * @param resource - Resource name
 * @returns Observable<boolean>
 */
canAccessResource(resource: string): Observable<boolean>

/**
 * Get all permissions for current role
 * @returns Observable<string[]>
 */
getCurrentPermissions(): Observable<string[]>
```

#### Usage Example

```typescript
@Component({
  selector: 'app-admin-panel',
  template: `
    <div *ngIf="canAccessAnalytics$ | async" class="analytics">
      <app-analytics-dashboard></app-analytics-dashboard>
    </div>
    
    <div *ngIf="canManageVendors$ | async" class="vendor-management">
      <app-vendor-suite></app-vendor-suite>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  canAccessAnalytics$ = this.rbac.hasPermission('view_analytics');
  canManageVendors$ = this.rbac.hasPermission('manage_vendors');

  constructor(private rbac: RBACService) {}

  ngOnInit(): void {
    // Set user role from auth service
    this.rbac.setUserRole('admin');
  }
}
```

---

### 4. DataAnalyticsService

#### Purpose
Provide analytics calculations and data formatting utilities.

#### Key Methods

```typescript
/**
 * Calculate percentage growth between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Growth percentage
 */
calculateGrowth(current: number, previous: number): number

/**
 * Format large numbers to readable format
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2M")
 */
formatLargeNumber(num: number): string

/**
 * Calculate average of number array
 * @param numbers - Array of numbers
 * @returns Average value
 */
calculateAverage(numbers: number[]): number

/**
 * Detect trend direction
 * @param data - Array of data points
 * @returns 'up' | 'down' | 'stable'
 */
detectTrend(data: number[]): 'up' | 'down' | 'stable'

/**
 * Calculate percentile value
 * @param data - Array of data
 * @param percentile - Percentile (0-100)
 * @returns Value at percentile
 */
calculatePercentile(data: number[], percentile: number): number
```

#### Usage Example

```typescript
@Component({
  selector: 'app-metric-card',
  template: `
    <div class="metric">
      <h3>{{ label }}</h3>
      <p class="value">{{ value }}</p>
      <p class="change" [ngClass]="trend">
        {{ trend === 'up' ? '↑' : '↓' }} {{ changePercent }}%
      </p>
    </div>
  `
})
export class MetricCardComponent {
  @Input() currentValue: number;
  @Input() previousValue: number;
  @Input() label: string;

  value: string;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';

  constructor(private analytics: DataAnalyticsService) {}

  ngOnInit(): void {
    this.value = this.analytics.formatLargeNumber(this.currentValue);
    
    this.changePercent = this.analytics.calculateGrowth(
      this.currentValue,
      this.previousValue
    );

    this.trend = this.changePercent > 0 
      ? 'up' 
      : this.changePercent < 0 
      ? 'down' 
      : 'stable';
  }
}
```

---

## 🌐 API Integration

### Backend Endpoint Structure

```
/api/v1
├── /analytics
│   ├── GET /metrics              - Current metrics
│   ├── GET /sales/trends         - Sales trend data
│   ├── GET /revenue/breakdown    - Revenue by source
│   └── GET /products/top         - Top performing products
├── /vendors
│   ├── GET                        - List vendors
│   ├── POST                       - Create vendor
│   ├── GET /:id                   - Get vendor by ID
│   ├── PATCH /:id                 - Update vendor
│   ├── DELETE /:id                - Delete vendor
│   ├── PATCH /:id/commission      - Update commission tier
│   └── GET /:id/performance       - Vendor performance metrics
├── /orders
│   ├── GET                        - List orders
│   ├── POST                       - Create order
│   ├── GET /:id                   - Get order details
│   ├── PATCH /:id/status          - Update order status
│   ├── GET /:id/tracking          - Get tracking info
│   └── WS /stream                 - Real-time order updates
├── /warehouses
│   ├── GET                        - List warehouses
│   ├── GET /:id/capacity          - Warehouse capacity
│   ├── GET /:id/orders            - Warehouse orders
│   └── PATCH /:id/capacity        - Update capacity
└── /permissions
    ├── GET                        - Current user permissions
    ├── GET /:role                 - Role permissions
    └── POST /:vendorId/grant      - Grant permissions
```

### Integration Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://api.example.com/api/v1';

  constructor(private http: HttpClient) {}

  // Analytics Endpoints
  getAnalyticsMetrics(): Observable<AnalyticsMetric[]> {
    return this.http.get<AnalyticsMetric[]>(`${this.apiUrl}/analytics/metrics`);
  }

  getSalesTrends(): Observable<SalesTrend[]> {
    return this.http.get<SalesTrend[]>(`${this.apiUrl}/analytics/sales/trends`);
  }

  getRevenueBreakdown(): Observable<RevenueSource[]> {
    return this.http.get<RevenueSource[]>(`${this.apiUrl}/analytics/revenue/breakdown`);
  }

  getTopProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/analytics/products/top`);
  }

  // Vendor Endpoints
  getVendors(page = 1, limit = 20): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(
      `${this.apiUrl}/vendors?page=${page}&limit=${limit}`
    );
  }

  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/vendors/${id}`);
  }

  createVendor(vendor: Partial<Vendor>): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.apiUrl}/vendors`, vendor);
  }

  updateVendorCommission(
    vendorId: string, 
    tier: string
  ): Observable<{ success: boolean }> {
    return this.http.patch(
      `${this.apiUrl}/vendors/${vendorId}/commission`,
      { tier }
    );
  }

  // Order Endpoints
  getOrders(status?: string): Observable<Order[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Order[]>(`${this.apiUrl}/orders${params}`);
  }

  updateOrderStatus(
    orderId: string, 
    status: string
  ): Observable<{ success: boolean }> {
    return this.http.patch(
      `${this.apiUrl}/orders/${orderId}/status`,
      { status }
    );
  }

  // Warehouse Endpoints
  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}/warehouses`);
  }

  getWarehouseCapacity(warehouseId: string): Observable<WarehouseCapacity> {
    return this.http.get<WarehouseCapacity>(
      `${this.apiUrl}/warehouses/${warehouseId}/capacity`
    );
  }
}
```

---

## 🔄 Real-Time Updates

### WebSocket Integration

```typescript
import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { reconnect } from '@ngneat/rxjs-store';

@Injectable({ providedIn: 'root' })
export class RealTimeService {
  private wsUrl = 'ws://api.example.com/api/v1/orders/stream';
  
  // Real-time order updates via WebSocket
  orderUpdates$ = webSocket<OrderUpdate>({
    url: this.wsUrl,
    openObserver: {
      next: () => console.log('WebSocket connected')
    },
    closeObserver: {
      next: () => console.log('WebSocket disconnected')
    }
  }).pipe(
    reconnect({
      backoffDuration: 3000,
      shouldReconnect: () => true
    })
  );

  // Emit events for specific order updates
  watchOrder(orderId: string): Observable<OrderUpdate> {
    return this.orderUpdates$.pipe(
      filter(update => update.orderId === orderId)
    );
  }
}
```

### Usage in Component

```typescript
@Component({
  selector: 'app-order-tracking',
  template: `
    <div *ngIf="orderUpdate$ | async as update">
      <p>Status: {{ update.status }}</p>
      <p>Location: {{ update.currentLocation }}</p>
      <p>Updated: {{ update.timestamp | date:'short' }}</p>
    </div>
  `
})
export class OrderTrackingComponent implements OnInit {
  @Input() orderId: string;
  orderUpdate$: Observable<OrderUpdate>;

  constructor(private realTime: RealTimeService) {}

  ngOnInit(): void {
    this.orderUpdate$ = this.realTime.watchOrder(this.orderId);
  }
}
```

---

## 📤 Export Functionality

### Supported Formats

#### CSV Export

```typescript
exportToCSV(data: any[]): Blob {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header])
      ).join(',')
    )
  ].join('\n');

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

// Usage
const analyticsData = [
  { metric: 'Sales', value: 12540, change: 12.5 },
  { metric: 'Revenue', value: 8750, change: 8.2 }
];

const blob = service.exportToCSV(analyticsData);
downloadBlob(blob, 'analytics.csv');
```

#### PDF Export (with jsPDF)

```typescript
// Install: npm install jspdf

import jsPDF from 'jspdf';

exportToPDF(data: any[], title: string): Blob {
  const doc = new jsPDF();
  
  doc.text(title, 10, 10);
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(h => item[h]));
  
  doc.table(
    10,
    20,
    rows,
    headers
  );
  
  return doc.output('blob');
}
```

#### Excel Export (with xlsx)

```typescript
// Install: npm install xlsx

import * as XLSX from 'xlsx';

exportToExcel(data: any[], sheetName = 'Data'): Blob {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const workbook: XLSX.WorkBook = {
    Sheets: { [sheetName]: worksheet },
    SheetNames: [sheetName]
  };
  
  const blob = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  });
  
  return new Blob([blob], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}
```

### Download Helper

```typescript
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Usage
downloadBlob(blob, 'analytics-report.csv');
```

---

## 🔐 Permission System

### Backend Permission Sync

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionSyncService {
  constructor(
    private http: HttpClient,
    private rbac: RBACService
  ) {}

  /**
   * Fetch and sync user permissions from backend
   */
  syncPermissionsFromBackend(userId: string): Observable<void> {
    return this.http
      .get<UserPermissions>(`/api/users/${userId}/permissions`)
      .pipe(
        tap(permissions => {
          this.rbac.setUserRole(permissions.role);
          this.rbac.setPermissions(permissions.permissions);
        }),
        map(() => undefined)
      );
  }
}
```

### Permission Guard for Routes

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { RBACService } from './services/rbac.service';

export const permissionGuard = (
  requiredPermission: string
): CanActivateFn => {
  return (route, state) => {
    const rbac = inject(RBACService);
    const router = inject(Router);

    return rbac.hasPermission(requiredPermission).pipe(
      map(hasPermission => {
        if (hasPermission) {
          return true;
        } else {
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};

// Usage in routing
const routes: Routes = [
  {
    path: 'admin/analytics',
    component: AnalyticsDashboardComponent,
    canActivate: [permissionGuard('view_analytics')]
  },
  {
    path: 'admin/vendors',
    component: VendorManagementComponent,
    canActivate: [permissionGuard('manage_vendors')]
  }
];
```

---

## ⚠️ Error Handling

### Global Error Handler

```typescript
import { Injectable, ErrorHandler } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private logger: LoggerService,
    private notifier: NotificationService
  ) {}

  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let userMessage = 'Something went wrong';

    switch (error.status) {
      case 401:
        userMessage = 'Unauthorized. Please log in.';
        break;
      case 403:
        userMessage = 'You do not have permission for this action';
        break;
      case 404:
        userMessage = 'Resource not found';
        break;
      case 500:
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        userMessage = error.message;
    }

    this.logger.error(error);
    this.notifier.error(userMessage);
  }

  private handleClientError(error: Error): void {
    this.logger.error(error);
    this.notifier.error('An error occurred');
  }
}
```

### Error Handling in Services

```typescript
applyAdvancedFilter(query: string, filters: any): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/analytics/search`,
    { params: { q: query, filters: JSON.stringify(filters) } }
  ).pipe(
    catchError(error => {
      this.logger.error('Filter error:', error);
      return of([]);  // Return empty array on error
    })
  );
}
```

---

## 🧪 Testing Guide

### Unit Test Example for Service

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdvancedFeaturesService } from './advanced-features.service';

describe('AdvancedFeaturesService', () => {
  let service: AdvancedFeaturesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdvancedFeaturesService]
    });

    service = TestBed.inject(AdvancedFeaturesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should export data to CSV', (done) => {
    const testData = [
      { name: 'Item 1', value: 100 },
      { name: 'Item 2', value: 200 }
    ];

    service.exportData(testData, 'csv').subscribe(blob => {
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe('text/csv');
      done();
    });
  });

  it('should apply filters correctly', (done) => {
    const mockData = [
      { id: 1, name: 'Test', category: 'A' }
    ];

    service.applyAdvancedFilter('test', {}).subscribe(result => {
      expect(result).toEqual(mockData);
      done();
    });

    const req = httpMock.expectOne(req => 
      req.url.includes('/search')
    );
    req.flush(mockData);
  });

  it('should check permissions', (done) => {
    service.checkPermission('admin', 'view_analytics').subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});
```

### Integration Test Example

```typescript
describe('Analytics Dashboard Integration', () => {
  let component: AnalyticsDashboardComponent;
  let fixture: ComponentFixture<AnalyticsDashboardComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsDashboardComponent],
      providers: [ApiService, AdvancedFeaturesService, ResponsiveService]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsDashboardComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
  });

  it('should load and display analytics metrics', (done) => {
    spyOn(apiService, 'getAnalyticsMetrics')
      .and.returnValue(of([
        { label: 'Sales', value: 12540, change: 12.5, trend: 'up' }
      ]));

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const element = fixture.nativeElement.querySelector('.metric-value');
      expect(element?.textContent).toContain('12.5K');
      done();
    });
  });
});
```

---

## 📚 Quick Reference

### Import Services

```typescript
import { 
  AdvancedFeaturesService,
  ResponsiveService,
  RBACService,
  DataAnalyticsService
} from './services/advanced-features.service';
```

### Inject in Component

```typescript
constructor(
  private advanced: AdvancedFeaturesService,
  private responsive: ResponsiveService,
  private rbac: RBACService,
  private analytics: DataAnalyticsService
) {}
```

### Common Patterns

```typescript
// Real-time setup
interval(5000).pipe(
  switchMap(() => this.advanced.setupRealtimeUpdates(of({}))),
  takeUntil(this.destroy$)
).subscribe();

// Filter with debounce
searchControl.valueChanges.pipe(
  debounceTime(300),
  switchMap(query => this.advanced.applyAdvancedFilter(query, {})),
  takeUntil(this.destroy$)
).subscribe();

// Check permission
this.rbac.hasPermission('view_analytics').pipe(
  map(can => this.showAnalytics = can)
).subscribe();

// Format number
const formatted = this.analytics.formatLargeNumber(1234567);  // "1.2M"
```

---

**Document Status:** Complete  
**Last Updated:** March 2026  
**Ready for Implementation:** ✅
