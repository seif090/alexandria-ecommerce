# ⚡ Advanced Features - Quick Reference Guide

## Alexandria Multi-Vendor Platform - Developer Cheat Sheet

**Last Updated:** March 2026  
**Quick Navigation:** [Components](#-components) | [Services](#-services) | [Mobile](#-mobile) | [Permissions](#-permissions) | [Exports](#-exports)

---

## 📦 Components

### Analytics Dashboard
```typescript
import { AnalyticsDashboardComponent } from './components/advanced';

// Use in template
<app-analytics-dashboard></app-analytics-dashboard>

// Features: Metrics, charts, filtering, exports, real-time updates
```

**Available Inputs:**
- `refreshInterval?: number` - Update interval (default: 5000ms)
- `enableExport?: boolean` - Show export buttons (default: true)
- `enableFilters?: boolean` - Show filters (default: true)

### Vendor Management Suite
```typescript
import { VendorManagementSuiteComponent } from './components/advanced';

<app-vendor-management-suite></app-vendor-management-suite>

// Features: Directory, commissions, permissions, performance
```

**Available Inputs:**
- `enableCommissions?: boolean` - Show commission tier tab
- `enablePermissions?: boolean` - Show permissions management
- `pageSize?: number` - Vendors per page (default: 10)

### Fulfillment System
```typescript
import { FulfillmentSystemComponent } from './components/advanced';

<app-fulfillment-system></app-fulfillment-system>

// Features: Order tracking, warehouse management, real-time updates
```

**Available Inputs:**
- `autoRefresh?: boolean` - Enable auto updates (default: true)
- `showWarehouses?: boolean` - Show warehouse section (default: true)
- `statuses?: string[]` - Custom order statuses

---

## 🔧 Services

### AdvancedFeaturesService

**Initialization:**
```typescript
constructor(private features: AdvancedFeaturesService) {}
```

**Key Methods:**
```typescript
// Real-time updates
setupRealtimeUpdates(data$: Observable<any>): Observable<any>

// Advanced filtering
applyAdvancedFilter(query: string, filters: any): Observable<any[]>

// Export data
exportData(data: any[], format: 'csv'|'json'|'pdf'|'excel'): Observable<Blob>

// Check permission
checkPermission(role: string, action: string): Observable<boolean>
```

**Quick Example:**
```typescript
// Export to CSV
this.features.exportData(data, 'csv').subscribe(blob => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'export.csv';
  link.click();
});
```

---

### ResponsiveService

```typescript
constructor(private responsive: ResponsiveService) {}

// Get screen size
screenSize$ = this.responsive.getScreenSize()  // 'mobile'|'tablet'|'desktop'|'wide'|'ultrawide'

// Check if mobile
isMobile = this.responsive.isMobile()

// Grid columns for current screen
gridCols = this.responsive.getGridColumns()  // 1-4

// Responsive padding
padding = this.responsive.getResponsivePadding()  // 'sm'|'md'|'lg'
```

---

### RBACService

```typescript
constructor(private rbac: RBACService) {}

// Set user role
this.rbac.setUserRole('admin'|'vendor'|'customer'|'support')

// Check permission
canView$ = this.rbac.hasPermission('view_analytics')

// Multiple permissions (ALL must be true)
canEdit$ = this.rbac.hasAllPermissions(['edit', 'approve'])

// Multiple permissions (ANY can be true)
canModerate$ = this.rbac.hasAnyPermission(['manage_orders', 'process_refunds'])

// Get all permissions
permissions$ = this.rbac.getCurrentPermissions()
```

---

### DataAnalyticsService

```typescript
constructor(private analytics: DataAnalyticsService) {}

// Calculate growth percentage
growth = this.analytics.calculateGrowth(1000, 800)  // Returns: 25

// Format large numbers
display = this.analytics.formatLargeNumber(1234567)  // Returns: "1.2M"

// Calculate average
avg = this.analytics.calculateAverage([10, 20, 30])  // Returns: 20

// Detect trend
trend = this.analytics.detectTrend([10, 15, 20, 25])  // Returns: 'up'

// Calculate percentile
p90 = this.analytics.calculatePercentile(data, 90)
```

---

## 📱 Mobile Responsive

### Breakpoints
```
sm:  480px   - Mobile phones
md:  768px   - Tablets
lg:  1024px  - Small desktop
xl:  1280px  - Desktop
2xl: 1920px  - Large desktop
```

### Common Classes
```html
<!-- Show/hide based on screen -->
<div class="hidden lg:block">Desktop only</div>
<div class="block md:hidden">Mobile only</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Item</div>
</div>

<!-- Responsive text -->
<h1 class="text-xl md:text-2xl lg:text-3xl">Heading</h1>

<!-- Responsive spacing -->
<div class="p-4 md:p-6 lg:p-8">Content</div>

<!-- Touch-friendly buttons -->
<button class="min-w-11 min-h-11 px-4 py-2.5">Click me</button>
```

### Safe Area (Notches)
```html
<div appSafeArea>
  <!-- Auto-insets for notches on iOS -->
</div>

<!-- Or manual -->
<div class="pt-[env(safe-area-inset-top)]">Content</div>
```

### Responsive Containers
```html
<!-- Auto max-width scaling -->
<app-responsive-container maxWidth="lg">
  Content
</app-responsive-container>

<!-- Responsive stack (col on mobile, row on desktop) -->
<app-responsive-stack direction="row" gap="md" mobileVertical="true">
  <div>Item 1</div>
  <div>Item 2</div>
</app-responsive-stack>

<!-- Bottom sheet (modal on mobile, dialog on desktop) -->
<app-mobile-sheet [isOpen]="showSheet" title="Filters">
  <app-filter-panel></app-filter-panel>
</app-mobile-sheet>
```

---

## 🔐 Permissions

### Permission Names
```typescript
// Analytics
'view_analytics'
'export_data'
'generate_reports'

// Vendors
'manage_vendors'
'update_vendor_commission'
'suspend_vendors'

// Orders
'view_all_orders'
'update_orders'
'process_refunds'

// Products
'manage_own_products'
'view_own_inventory'

// Users
'manage_users'
'manage_roles'
```

### Permission Checks

**In Templates:**
```html
<!-- Single permission -->
<div *appHasPermission="'view_analytics'">
  <app-analytics></app-analytics>
</div>

<!-- OR logic (any permission) -->
<button *appHasPermissionOr="['manage_orders', 'process_refunds']">
  Manage
</button>

<!-- AND logic (all permissions) -->
<div *appHasPermissionAnd="['view_analytics', 'export_data']">
  Export Analytics
</div>
```

**In Components:**
```typescript
canView$ = this.rbac.hasPermission('view_analytics');
canEdit$ = this.rbac.hasAllPermissions(['edit', 'approve']);
canModerate$ = this.rbac.hasAnyPermission(['manage', 'moderate']);

this.canView$.subscribe(can => {
  this.showContent = can;
});
```

**In Routes:**
```typescript
const routes: Routes = [
  {
    path: 'admin/analytics',
    component: AnalyticsComponent,
    canActivate: [permissionGuard(['view_analytics'])]
  }
];
```

---

## 📤 Export Data

### Quick Export
```typescript
exportToCsv(data: any[], filename: string): void {
  this.features.exportData(data, 'csv').subscribe(blob => {
    this.downloadBlob(blob, `${filename}.csv`);
  });
}

exportToJson(data: any[], filename: string): void {
  this.features.exportData(data, 'json').subscribe(blob => {
    this.downloadBlob(blob, `${filename}.json`);
  });
}

exportToPdf(data: any[], filename: string): void {
  // Requires jsPDF: npm install jspdf
  this.features.exportData(data, 'pdf').subscribe(blob => {
    this.downloadBlob(blob, `${filename}.pdf`);
  });
}

exportToExcel(data: any[], filename: string): void {
  // Requires xlsx: npm install xlsx
  this.features.exportData(data, 'excel').subscribe(blob => {
    this.downloadBlob(blob, `${filename}.xlsx`);
  });
}

private downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

---

## 🔄 Real-Time Updates

### Setup Real-Time
```typescript
import { interval } from 'rxjs';

ngOnInit(): void {
  interval(5000)  // Every 5 seconds
    .pipe(
      switchMap(() => this.dataService.fetchLatestData()),
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      this.updateDisplay(data);
    });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### WebSocket Real-Time
```typescript
connecting to WebSocket:
orders$ = this.http.webSocket('ws://api/orders/stream')
  .pipe(
    reconnect({ backoffDuration: 3000, shouldReconnect: () => true }),
    filter(update => update.status !== 'old'),
    takeUntil(this.destroy$)
  );

// Watch specific order
watchOrder(orderId: string): Observable<OrderUpdate> {
  return this.orders$.pipe(
    filter(update => update.orderId === orderId)
  );
}
```

---

## 🎁 Common Patterns

### Real-Time with Debounce (Filtering)
```typescript
searchControl = new FormControl('');

results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.features.applyAdvancedFilter(query, {})),
  takeUntil(this.destroy$)
);
```

### Load and Display
```typescript
metrics$ = this.api.getMetrics().pipe(
  map(data => ({
    total: data.length,
    highest: Math.max(...data.map(d => d.value)),
    average: data.reduce((a,b) => a+b, 0) / data.length
  }))
);

// In template
<div *ngIf="metrics$ | async as metrics">
  Total: {{ metrics.total }} <br>
  Highest: {{ metrics.highest }} <br>
  Average: {{ metrics.average | number:'1.2-2' }}
</div>
```

### Error Handling
```typescript
data$ = this.api.getData().pipe(
  catchError(error => {
    console.error('Load failed:', error);
    this.notifier.error('Failed to load data');
    return of([]);  // Return empty array
  })
);
```

### Combine Multiple Data Sources
```typescript
dashboard$ = combineLatest([
  this.api.getMetrics(),
  this.api.getOrders(),
  this.api.getVendors()
]).pipe(
  map(([metrics, orders, vendors]) => ({
    metrics,
    orders,
    vendors
  }))
);
```

---

## 📊 Data Formatting

```typescript
// Large numbers
1234567 → "1.2M"
98765 → "98.8K"
1000 → "1K"

// Percentages
25 → "25%"
-10 → "-10%"

// Dates
new Date() → "Mar 15, 2026"

// Currency
1000 → "$1,000.00"

// Decimals
123.456 → "123.46"
```

---

## 🎯 Setup Checklist

```
✅ Import components and services
✅ Add components to routes
✅ Set user role in RBACService
✅ Sync permissions from backend (optional)
✅ Configure real-time updates
✅ Test on mobile (480px, 768px, 1024px)
✅ Install export libraries (jsPDF, xlsx)
✅ Test exports work
✅ Test permission guards
✅ Setup error handling
```

---

## 🚀 Performance Tips

```typescript
// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Unsubscribe properly
private destroy$ = new Subject<void>();
data$ = this.api.getData().pipe(takeUntil(this.destroy$));

// Debounce user input
searchControl.valueChanges.pipe(debounceTime(300))

// Lazy load images
<img loading="lazy" src="...">

// Combine multiple API calls
combineLatest([api1(), api2(), api3()])
```

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Permissions not working | `this.rbac.setUserRole('admin')` set first |
| Mobile looks broken | Check viewport meta tag, test at 480px |
| Real-time not updating | Verify interval() is in ngOnInit(), check unsubscribe |
| Exports failing | Install dependencies: `npm install jspdf xlsx` |
| Route guard blocking | Add permissions to guard: `canActivate: [permissionGuard(['action'])]` |
| Directive not hiding | Verify `HasPermissionDirective` imported correctly |
| Responsive grid wrong | Use correct Tailwind classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |

---

## 📚 Documentation Files

- **ADVANCED_FEATURES_DOCS.md** - Complete feature documentation  
- **MOBILE_RESPONSIVE_GUIDE.md** - Mobile-first strategy & patterns  
- **SERVICE_INTEGRATION_GUIDE.md** - Service API & backend integration  
- **RBAC_IMPLEMENTATION_GUIDE.md** - Permission system setup  

---

## 🔗 Import All at Once

```typescript
import {
  AdvancedFeaturesService,
  ResponsiveService,
  RBACService,
  DataAnalyticsService,
  AnalyticsDashboardComponent,
  VendorManagementSuiteComponent,
  FulfillmentSystemComponent,
  ResponsiveContainerComponent,
  ResponsiveStackComponent,
  HasPermissionDirective,
  SafeAreaDirective,
  TouchFriendlyDirective
} from './components/advanced';
```

---

**Last Updated:** March 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
