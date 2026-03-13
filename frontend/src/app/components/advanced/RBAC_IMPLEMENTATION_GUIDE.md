# 🔐 RBAC Implementation Guide

## Role-Based Access Control - Architecture & Setup

**Version:** 1.0  
**Last Updated:** March 2026  
**Scope:** Permission management, role hierarchy, authorization

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Permission System](#permission-system)
4. [Implementation](#implementation)
5. [Synchronization](#synchronization)
6. [Advanced Patterns](#advanced-patterns)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What is RBAC?

**Role-Based Access Control (RBAC)** is a method of restricting system access based on a user's assigned role. It allows you to:

- Define different user roles (Admin, Vendor, Customer, Support)
- Assign specific permissions to each role
- Enforce permissions across the application
- Simplify permission management at scale

### RBAC Architecture

```
┌──────────────────────────────────────┐
│         User Authentication          │
├──────────────────────────────────────┤
│         Set User Role                │
├──────────────────────────────────────┤
│      Permission Access Map           │
├──────────────────────────────────────┤
│    Route Guards & Directives         │
├──────────────────────────────────────┤
│   Component Visibility Control       │
└──────────────────────────────────────┘
```

---

## 👥 Role Definitions

### Core Roles

#### 1. **ADMIN** - System Administrator
Full platform access with all capabilities.

**Responsibilities:**
- User management
- Platform configuration
- Vendor onboarding/offboarding
- Payment processing oversight
- Analytics and reporting
- System troubleshooting

**Permissions:**
```typescript
ADMIN_PERMISSIONS = [
  'view_all_data',
  'manage_users',
  'manage_vendors',
  'manage_orders',
  'manage_payments',
  'manage_settings',
  'view_analytics',
  'export_reports',
  'manage_roles',
  'system_audit',
  'refund_orders',
  'suspend_vendors'
]
```

#### 2. **VENDOR** - Seller
Access to own store and order management.

**Responsibilities:**
- Manage products
- Process orders
- Track shipments
- Manage inventory
- View own analytics
- Customer support

**Permissions:**
```typescript
VENDOR_PERMISSIONS = [
  'view_own_orders',
  'manage_own_products',
  'manage_own_inventory',
  'process_own_orders',
  'view_own_analytics',
  'manage_own_customers',
  'create_support_ticket',
  'view_shipping_labels',
  'generate_reports'  // Own data only
]
```

#### 3. **CUSTOMER** - Buyer
Purchase and review capabilities.

**Permissions:**
```typescript
CUSTOMER_PERMISSIONS = [
  'browse_products',
  'create_orders',
  'view_own_orders',
  'create_reviews',
  'manage_wishlist',
  'create_support_ticket',
  'update_profile',
  'manage_addresses'
]
```

#### 4. **SUPPORT** - Customer Service
Order and customer issue management.

**Permissions:**
```typescript
SUPPORT_PERMISSIONS = [
  'view_all_orders',
  'view_all_customers',
  'create_support_ticket',
  'manage_support_tickets',
  'view_analytics',
  'process_refunds',
  'update_order_status',
  'contact_vendors',
  'generate_reports'
]
```

### Role Hierarchy

```
ADMIN (100% access)
├── Can perform all SUPPORT actions
├── Can perform all VENDOR actions
├── Can perform all CUSTOMER actions
└── Plus: System administration

SUPPORT (70% access)
├── Can perform all CUSTOMER actions
├── Plus: Order & customer management

VENDOR (50% access)
├── Own store management
├── Customer interaction within own store

CUSTOMER (30% access)
└── Shopping & personal profile
```

---

## 🔑 Permission System

### Permission Structure

```typescript
interface Permission {
  id: string;              // Unique identifier
  name: string;            // Human-readable name
  description: string;     // What this permission does
  category: string;        // Category (orders, products, users, etc.)
  actions: string[];       // Specific actions (create, read, update, delete)
  resources: string[];     // Data types it applies to
}

interface RolePermission {
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}
```

### Permission Categories

#### 📊 Analytics & Reporting
```
- view_analytics
- generate_reports
- export_data
- schedule_reports
- share_analytics
```

#### 🏪 Vendor Management
```
- manage_vendors
- view_vendors
- suspend_vendors
- update_vendor_commission
- manage_vendor_permissions
```

#### 📦 Order Management
```
- create_orders
- view_orders
- update_orders
- cancel_orders
- process_refunds
- manage_shipping
```

#### 👥 User Management
```
- create_users
- update_users
- delete_users
- manage_roles
- reset_passwords
- view_audit_logs
```

#### 💳 Payment Processing
```
- process_payments
- view_transactions
- manage_refunds
- configure_payment_methods
- view_payment_reports
```

#### 🛍️ Product Management
```
- create_products
- update_products
- delete_products
- manage_inventory
- publish_products
- view_product_analytics
```

---

## 🔧 Implementation

### Step 1: Create RBAC Service

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type UserRole = 'admin' | 'vendor' | 'customer' | 'support';

interface RolePermissionMap {
  [key in UserRole]: Set<string>;
}

@Injectable({ providedIn: 'root' })
export class RBACService {
  private currentRole$ = new BehaviorSubject<UserRole>('customer');
  private permissionMap: RolePermissionMap = {
    admin: new Set([
      'view_all_data', 'manage_users', 'manage_vendors',
      'manage_orders', 'manage_payments', 'view_analytics',
      'export_reports', 'manage_roles', 'system_audit'
    ]),
    vendor: new Set([
      'view_own_orders', 'manage_own_products',
      'manage_own_inventory', 'process_own_orders',
      'view_own_analytics', 'manage_own_customers'
    ]),
    customer: new Set([
      'browse_products', 'create_orders',
      'view_own_orders', 'create_reviews',
      'manage_wishlist'
    ]),
    support: new Set([
      'view_all_orders', 'view_all_customers',
      'create_support_ticket', 'manage_support_tickets',
      'view_analytics', 'process_refunds'
    ])
  };

  /**
   * Set the current user role
   */
  setUserRole(role: UserRole): void {
    this.currentRole$.next(role);
  }

  /**
   * Get current user role
   */
  getCurrentRole(): Observable<UserRole> {
    return this.currentRole$.asObservable();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.currentRole$.pipe(
      map(role => {
        const permissions = this.permissionMap[role];
        return permissions?.has(permission) || false;
      })
    );
  }

  /**
   * Check if user can access resource
   */
  canAccessResource(resource: string): Observable<boolean> {
    return this.currentRole$.pipe(
      map(role => {
        // Example: vendor can access own orders
        if (role === 'vendor' && resource.startsWith('orders:own')) {
          return true;
        }
        // Admin can access all
        if (role === 'admin') {
          return true;
        }
        return false;
      })
    );
  }

  /**
   * Get all permissions for current role
   */
  getCurrentPermissions(): Observable<string[]> {
    return this.currentRole$.pipe(
      map(role => Array.from(this.permissionMap[role] || []))
    );
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(permissions: string[]): Observable<boolean> {
    return this.currentRole$.pipe(
      map(role => {
        const rolePerms = this.permissionMap[role];
        return permissions.every(p => rolePerms?.has(p) || false);
      })
    );
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.currentRole$.pipe(
      map(role => {
        const rolePerms = this.permissionMap[role];
        return permissions.some(p => rolePerms?.has(p) || false);
      })
    );
  }
}
```

### Step 2: Create Permission Directive

```typescript
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { RBACService } from './rbac.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission: string;
  @Input() appHasPermissionOr: string[] = [];
  @Input() appHasPermissionAnd: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbac: RBACService
  ) {}

  ngOnInit(): void {
    if (this.appHasPermission) {
      this.checkPermission(this.appHasPermission);
    } else if (this.appHasPermissionOr.length > 0) {
      this.checkPermissionOr(this.appHasPermissionOr);
    } else if (this.appHasPermissionAnd.length > 0) {
      this.checkPermissionAnd(this.appHasPermissionAnd);
    }
  }

  private checkPermission(permission: string): void {
    this.rbac.hasPermission(permission)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasPermission => {
        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }

  private checkPermissionOr(permissions: string[]): void {
    this.rbac.hasAnyPermission(permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasPermission => {
        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }

  private checkPermissionAnd(permissions: string[]): void {
    this.rbac.hasAllPermissions(permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasPermission => {
        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Step 3: Create Permission Guard

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { RBACService } from './rbac.service';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

export const permissionGuard = (
  requiredPermissions: string[],
  requireAll = false
): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const rbac = inject(RBACService);
    const router = inject(Router);

    const permission$ = requireAll
      ? rbac.hasAllPermissions(requiredPermissions)
      : rbac.hasAnyPermission(requiredPermissions);

    return permission$.pipe(
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

// Role-based guard
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const rbac = inject(RBACService);
    const router = inject(Router);

    return rbac.getCurrentRole().pipe(
      map(role => {
        if (allowedRoles.includes(role)) {
          return true;
        } else {
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};
```

### Step 4: Use in Routes

```typescript
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    children: [
      {
        path: 'analytics',
        component: AnalyticsDashboardComponent,
        canActivate: [permissionGuard(['view_analytics'])]
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [permissionGuard(['manage_users'])]
      },
      {
        path: 'vendors',
        component: VendorManagementComponent,
        canActivate: [permissionGuard(['manage_vendors'])]
      }
    ]
  },
  {
    path: 'vendor',
    canActivate: [roleGuard(['vendor'])],
    children: [
      {
        path: 'dashboard',
        component: VendorDashboardComponent
      },
      {
        path: 'orders',
        component: VendorOrdersComponent,
        canActivate: [permissionGuard(['view_own_orders'])]
      }
    ]
  },
  {
    path: 'customer',
    canActivate: [roleGuard(['customer'])],
    children: [
      {
        path: 'orders',
        component: MyOrdersComponent
      }
    ]
  }
];
```

### Step 5: Use in Templates

```typescript
<ng-container *appHasPermission="'view_analytics'">
  <app-analytics-dashboard></app-analytics-dashboard>
</ng-container>

<!-- OR Logic -->
<button *appHasPermissionOr="['manage_orders', 'process_refunds']">
  Manage Orders
</button>

<!-- AND Logic -->
<div *appHasPermissionAnd="['view_analytics', 'export_data']">
  <button (click)="exportAnalytics()">Export</button>
</div>
```

### Step 6: Use in Components

```typescript
@Component({
  selector: 'app-admin-panel',
  template: `
    <div class="admin-panel">
      <!-- Manager Users Section -->
      <div *ngIf="canManageUsers$ | async">
        <h2>User Management</h2>
        <app-user-management></app-user-management>
      </div>

      <!-- Manage Vendors Section -->
      <div *ngIf="canManageVendors$ | async">
        <h2>Vendor Management</h2>
        <app-vendor-management></app-vendor-management>
      </div>

      <!-- View Analytics -->
      <div *ngIf="canViewAnalytics$ | async">
        <h2>Analytics</h2>
        <app-analytics></app-analytics>
      </div>

      <!-- Export Reports -->
      <button 
        *ngIf="canExport$ | async"
        (click)="exportReports()">
        Export Reports
      </button>
    </div>
  `,
  imports: [CommonModule, HasPermissionDirective]
})
export class AdminPanelComponent implements OnInit {
  canManageUsers$ = this.rbac.hasPermission('manage_users');
  canManageVendors$ = this.rbac.hasPermission('manage_vendors');
  canViewAnalytics$ = this.rbac.hasPermission('view_analytics');
  canExport$ = this.rbac.hasPermission('export_reports');

  constructor(private rbac: RBACService) {}

  ngOnInit(): void {
    // Set user role based on authentication
    this.rbac.setUserRole('admin');
  }

  exportReports(): void {
    console.log('Exporting reports...');
  }
}
```

---

## 🔄 Synchronization

### Backend Permission Sync

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionSyncService {
  constructor(
    private http: HttpClient,
    private rbac: RBACService,
    private auth: AuthService
  ) {}

  /**
   * Fetch and sync permissions from backend
   */
  syncPermissionsFromBackend(): Observable<UserPermissions> {
    const userId = this.auth.getCurrentUserId();
    
    return this.http
      .get<UserPermissions>(`/api/users/${userId}/permissions`)
      .pipe(
        tap(permissions => {
          this.rbac.setUserRole(permissions.role);
          // If needed, update the permission map
          this.updatePermissionMap(permissions);
        }),
        catchError(error => {
          console.error('Failed to sync permissions:', error);
          return throwError(() => new Error('Permission sync failed'));
        })
      );
  }

  private updatePermissionMap(permissions: UserPermissions): void {
    // Update the RBAC service with backend permissions
    // Implementation depends on your needs
  }
}
```

### Initialize on App Startup

```typescript
@Injectable()
export class AppInitializerService {
  constructor(
    private auth: AuthService,
    private permSync: PermissionSyncService
  ) {}

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.auth.isAuthenticated()) {
        this.permSync.syncPermissionsFromBackend()
          .subscribe({
            next: () => resolve(),
            error: (err) => reject(err)
          });
      } else {
        resolve();
      }
    });
  }
}

// In app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (initializer: AppInitializerService) => 
        () => initializer.initialize(),
      deps: [AppInitializerService],
      multi: true
    }
  ]
};
```

---

## 🎨 Advanced Patterns

### Resource-Level Permissions

```typescript
interface ResourcePermission {
  resource: string;       // e.g., 'orders:123'
  actions: string[];      // e.g., ['read', 'update']
  constraints?: {
    ownOnly?: boolean;    // User can only access own resources
    vendorId?: string;    // Specific vendor
    customerId?: string;  // Specific customer
  };
}

// Check resource access
canAccessOrder(orderId: string): Observable<boolean> {
  return combineLatest([
    this.rbac.getCurrentRole(),
    this.orders.getOrderVendor(orderId)
  ]).pipe(
    map(([role, vendorId]) => {
      if (role === 'admin') return true;
      if (role === 'vendor' && vendorId === this.auth.getCurrentVendorId()) {
        return true;
      }
      return false;
    })
  );
}
```

### Dynamic Permission Group

```typescript
interface PermissionGroup {
  name: string;
  permissions: string[];
  description: string;
}

const permissionGroups: PermissionGroup[] = [
  {
    name: 'Analytics Reader',
    permissions: ['view_analytics', 'generate_reports'],
    description: 'Read-only analytics access'
  },
  {
    name: 'Order Manager',
    permissions: ['view_all_orders', 'update_orders', 'process_refunds'],
    description: 'Full order management'
  },
  {
    name: 'Vendor Admin',
    permissions: ['manage_vendors', 'update_vendor_commission', 'suspend_vendors'],
    description: 'Vendor administration'
  }
];

// Assign group to role
assignPermissionGroup(role: UserRole, group: PermissionGroup): void {
  group.permissions.forEach(permission => {
    this.addPermissionToRole(role, permission);
  });
}
```

### Attribute-Based Access Control (ABAC)

```typescript
interface AccessPolicy {
  subject: string;        // User role
  action: string;         // What to do
  resource: string;       // What resource
  condition?: (context: any) => boolean;  // Additional logic
}

evaluatePolicy(policy: AccessPolicy, context: any): boolean {
  if (!policy.condition) {
    return this.hasPermission(policy.action).pipe(
      map(has => has && policy.subject === context.userRole)
    );
  }

  return of(
    this.hasPermission(policy.action) &&
    policy.subject === context.userRole &&
    policy.condition(context)
  );
}

// Example: User can only refund their own orders
const refundPolicy: AccessPolicy = {
  subject: 'vendor',
  action: 'refund_orders',
  resource: 'orders',
  condition: (context) => context.orderId === context.userOrderId
};
```

---

## 🔒 Security Best Practices

### 1. Never Trust Client-Side Permission Checks

```typescript
// ❌ BAD - Only checking permissions on client
if (this.rbac.hasPermission('delete_vendor')) {
  this.deleteVendor();  // Backend MUST also check!
}

// ✅ GOOD - Backend validates permissions
deleteVendor(vendorId: string): Observable<void> {
  return this.http.delete(`/api/vendors/${vendorId}`).pipe(
    // Backend will validate user permission before deleting
    map(() => {
      this.showSuccess('Vendor deleted');
    })
  );
}
```

### 2. Audit Permission Changes

```typescript
logPermissionChange(
  userId: string,
  change: 'granted' | 'revoked',
  permission: string,
  reason?: string
): Observable<void> {
  return this.http.post('/api/audit/permissions', {
    userId,
    change,
    permission,
    reason,
    timestamp: new Date(),
    changedBy: this.auth.getCurrentUserId()
  });
}
```

### 3. Implement Permission Caching (with TTL)

```typescript
@Injectable()
export class CachedRBACService extends RBACService {
  private permissionCache = new Map<string, { value: boolean; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  hasPermission(permission: string): Observable<boolean> {
    const cached = this.permissionCache.get(permission);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return of(cached.value);
    }

    return super.hasPermission(permission).pipe(
      tap(value => {
        this.permissionCache.set(permission, { value, timestamp: Date.now() });
      })
    );
  }

  clearCache(): void {
    this.permissionCache.clear();
  }
}
```

### 4. Implement Rate Limiting for Sensitive Actions

```typescript
@Injectable()
export class RateLimitedActionService {
  private actionCounts = new Map<string, number[]>();
  private readonly LIMIT = 5;  // 5 actions
  private readonly WINDOW = 60000;  // per minute

  canPerformAction(userId: string, action: string): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const timestamps = this.actionCounts.get(key) || [];

    // Remove old timestamps
    const recentTimestamps = timestamps.filter(t => now - t < this.WINDOW);
    
    if (recentTimestamps.length >= this.LIMIT) {
      return false;
    }

    recentTimestamps.push(now);
    this.actionCounts.set(key, recentTimestamps);
    return true;
  }
}
```

### 5. Encrypt Sensitive Permission Data

```typescript
@Injectable()
export class SecureRBACService extends RBACService {
  constructor(private encrypt: EncryptionService) {
    super();
  }

  async setUserRoleSecurely(role: UserRole, secret: string): Promise<void> {
    const encrypted = await this.encrypt.encrypt(role, secret);
    localStorage.setItem('user_role_secure', encrypted);
  }

  async getUserRoleSecurely(secret: string): Promise<UserRole> {
    const encrypted = localStorage.getItem('user_role_secure');
    if (!encrypted) return 'customer';
    return await this.encrypt.decrypt(encrypted, secret);
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Permissions not appearing

**Solution:** Ensure permissions are initialized during app startup
```typescript
// In app initialization
this.permissionSync.syncPermissionsFromBackend().subscribe();

// Or set manually in development
this.rbac.setUserRole('admin');
```

### Issue: Directive not hiding elements

**Solution:** Check that RBACService is properly injected
```typescript
// Verify imports
imports: [CommonModule, HasPermissionDirective]
```

### Issue: Route guard not working

**Solution:** Ensure guard is added to route config
```typescript
{
  path: 'admin',
  canActivate: [permissionGuard(['manage_users'])]  // Must be array
}
```

### Issue: Permission checks always fail

**Solution:** Verify role is set before checking permissions
```typescript
ngOnInit(): void {
  this.rbac.setUserRole('vendor');
  this.hasPermission = this.rbac.hasPermission('view_own_orders');
}
```

---

## 📚 Quick Reference

```typescript
// Set role
rbac.setUserRole('admin');

// Check single permission
rbac.hasPermission('view_analytics').subscribe(can => {});

// Check all permissions (AND)
rbac.hasAllPermissions(['view_analytics', 'export_data']).subscribe(can => {});

// Check any permission (OR)
rbac.hasAnyPermission(['manage_orders', 'process_refunds']).subscribe(can => {});

// Hide element if no permission
<div *appHasPermission="'manage_users'">Content</div>

// Route guard
canActivate: [permissionGuard(['manage_orders'])]
```

---

**Document Status:** Complete  
**Last Updated:** March 2026  
**Ready for Implementation:** ✅
