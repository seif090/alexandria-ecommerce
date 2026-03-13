import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, switchMap, debounceTime } from 'rxjs/operators';

export interface AdvancedFilter {
  searchQuery: string;
  sortBy: string;
  filters: { [key: string]: any };
  dateRange: { start: Date; end: Date };
}

export interface ExportFormat {
  format: 'csv' | 'pdf' | 'json' | 'excel';
  includeMetadata: boolean;
  dateRange?: { start: Date; end: Date };
}

export interface RolePermission {
  role: string;
  permissions: string[];
  resources: string[];
}

export interface RealtimeUpdate {
  timestamp: Date;
  type: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
}

@Injectable({ providedIn: 'root' })
export class AdvancedFeaturesService {
  private filters$ = new BehaviorSubject<AdvancedFilter>({
    searchQuery: '',
    sortBy: 'recent',
    filters: {},
    dateRange: { start: new Date(), end: new Date() }
  });

  private realtimeUpdates$ = new BehaviorSubject<RealtimeUpdate[]>([]);
  private userPermissions$ = new BehaviorSubject<RolePermission | null>(null);
  private isLoading$ = new BehaviorSubject(false);

  /**
   * Setup real-time data updates for dashboards
   */
  setupRealtimeUpdates(interval$: Observable<any>): Observable<RealtimeUpdate[]> {
    return interval$.pipe(
      switchMap(() => this.fetchRealtimeData()),
      map(data => {
        this.realtimeUpdates$.next(data);
        return data;
      })
    );
  }

  /**
   * Advanced filtering with debounce
   */
  applyAdvancedFilter(query: string, filters: any): Observable<any[]> {
    return this.filters$.pipe(
      debounceTime(300),
      switchMap(() => this.executeAdvancedQuery(query, filters))
    );
  }

  /**
   * Export data in multiple formats
   */
  exportData(data: any[], format: ExportFormat): Blob {
    switch (format.format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
        return this.convertToJSON(data);
      case 'pdf':
        return this.convertToPDF(data);
      case 'excel':
        return this.convertToExcel(data);
      default:
        return new Blob();
    }
  }

  /**
   * Check role-based permissions
   */
  checkPermission(role: string, action: string): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(perm => perm?.role === role && perm?.permissions?.includes(action))
    );
  }

  /**
   * Get filtered permissions based on role
   */
  getPermissionsByRole(role: string): Observable<RolePermission | null> {
    return this.userPermissions$.pipe(
      map(perm => perm?.role === role ? perm : null)
    );
  }

  // Private methods

  private fetchRealtimeData(): Promise<RealtimeUpdate[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            timestamp: new Date(),
            type: 'order_update',
            data: { orderId: '12345', status: 'shipped' },
            priority: 'high'
          }
        ]);
      }, 1000);
    });
  }

  private executeAdvancedQuery(query: string, filters: any): Promise<any[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([]), 500);
    });
  }

  private convertToCSV(data: any[]): Blob {
    const csv = this.arrayToCSV(data);
    return new Blob([csv], { type: 'text/csv' });
  }

  private convertToJSON(data: any[]): Blob {
    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  private convertToPDF(data: any[]): Blob {
    // Implementation would use jsPDF library
    return new Blob([], { type: 'application/pdf' });
  }

  private convertToExcel(data: any[]): Blob {
    // Implementation would use xlsx library
    return new Blob([], { type: 'application/vnd.ms-excel' });
  }

  private arrayToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ];
    
    return csv.join('\n');
  }

  // Getters
  get filters(): Observable<AdvancedFilter> {
    return this.filters$.asObservable();
  }

  get realtimeUpdates(): Observable<RealtimeUpdate[]> {
    return this.realtimeUpdates$.asObservable();
  }

  get userPermissions(): Observable<RolePermission | null> {
    return this.userPermissions$.asObservable();
  }

  get isLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }
}

/**
 * Mobile Responsiveness Utility Service
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
    ultrawide: 1920
  };

  private screenSize$ = new BehaviorSubject(this.getScreenSize());

  constructor() {
    window.addEventListener('resize', () => {
      this.screenSize$.next(this.getScreenSize());
    });
  }

  /**
   * Get current screen size
   */
  getScreenSize(): 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide' {
    const width = window.innerWidth;
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'mobile';
    if (width < this.breakpoints.desktop) return 'tablet';
    if (width < this.breakpoints.wide) return 'desktop';
    if (width < this.breakpoints.ultrawide) return 'wide';
    return 'ultrawide';
  }

  /**
   * Observable stream of screen size changes
   */
  get screenSize(): Observable<string> {
    return this.screenSize$.asObservable();
  }

  /**
   * Check if screen is mobile
   */
  isMobile(): boolean {
    const size = this.getScreenSize();
    return size === 'mobile';
  }

  /**
   * Get grid columns based on screen size
   */
  getGridColumns(): number {
    const size = this.getScreenSize();
    switch (size) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      case 'wide': return 4;
      default: return 5;
    }
  }

  /**
   * Get optimal padding based on screen size
   */
  getResponsivePadding(): string {
    const size = this.getScreenSize();
    switch (size) {
      case 'mobile': return 'p-2 lg:p-4';
      case 'tablet': return 'p-4 lg:p-6';
      default: return 'p-6 lg:p-8';
    }
  }
}

/**
 * Role-Based Access Control Service
 */
@Injectable({ providedIn: 'root' })
export class RBACService {
  private roles: Map<string, RolePermission> = new Map([
    ['admin', {
      role: 'admin',
      permissions: ['*'],
      resources: ['*']
    }],
    ['vendor', {
      role: 'vendor',
      permissions: ['view_orders', 'update_orders', 'view_analytics', 'manage_inventory'],
      resources: ['own_orders', 'own_products', 'own_analytics']
    }],
    ['customer', {
      role: 'customer',
      permissions: ['view_orders', 'view_products', 'leave_review'],
      resources: ['own_orders', 'all_products']
    }],
    ['support', {
      role: 'support',
      permissions: ['view_orders', 'view_customers', 'resolve_issues'],
      resources: ['all_orders', 'all_customers', 'tickets']
    }]
  ]);

  private userRole$ = new BehaviorSubject<string>('customer');

  /**
   * Set current user role
   */
  setUserRole(role: string): void {
    if (this.roles.has(role)) {
      this.userRole$.next(role);
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.userRole$.pipe(
      map(role => {
        const rolePerms = this.roles.get(role);
        if (!rolePerms) return false;
        return rolePerms.permissions.includes('*') || rolePerms.permissions.includes(permission);
      })
    );
  }

  /**
   * Check if user can access resource
   */
  canAccessResource(resource: string): Observable<boolean> {
    return this.userRole$.pipe(
      map(role => {
        const rolePerms = this.roles.get(role);
        if (!rolePerms) return false;
        return rolePerms.resources.includes('*') || rolePerms.resources.includes(resource);
      })
    );
  }

  /**
   * Get all permissions for current role
   */
  getCurrentPermissions(): Observable<string[]> {
    return this.userRole$.pipe(
      map(role => this.roles.get(role)?.permissions || [])
    );
  }

  /**
   * Get user role
   */
  getUserRole(): Observable<string> {
    return this.userRole$.asObservable();
  }
}

/**
 * Data Analytics Service
 */
@Injectable({ providedIn: 'root' })
export class DataAnalyticsService {
  /**
   * Calculate growth percentage
   */
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Format large numbers
   */
  formatLargeNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  /**
   * Calculate average
   */
  calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(data: number[], percentile: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const index = (percentile / 100) * sorted.length;
    return sorted[Math.floor(index)];
  }

  /**
   * Detect trends
   */
  detectTrend(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-2);
    const diff = recent[1] - recent[0];
    if (diff > 0) return 'up';
    if (diff < 0) return 'down';
    return 'stable';
  }
}
