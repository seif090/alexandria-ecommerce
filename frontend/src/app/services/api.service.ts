import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = this.getApiUrl();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  private getApiUrl(): string {
    // Use environment variable if available (set in Vercel)
    const envApiUrl = (window as any).__API_URL__ || 
                      (typeof process !== 'undefined' && (process as any).env?.['NG_APP_API_URL']);
    
    if (envApiUrl) {
      return envApiUrl;
    }

    // Fallback to backend on same domain
    const isDev = !window.location.hostname.includes('vercel.app');
    if (isDev) {
      return 'http://localhost:3000/api';
    }

    // For production, use relative API path (proxied by Vercel)
    return '/api';
  }

  // ============ ANALYTICS ENDPOINTS ============

  getAnalyticsMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/advanced/analytics/metrics`).pipe(shareReplay(1));
  }

  getSalesTrends(days = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/advanced/analytics/sales/trends`, {
      params: new HttpParams().set('days', days.toString())
    }).pipe(shareReplay(1));
  }

  getRevenueBreakdown(): Observable<any> {
    return this.http.get(`${this.apiUrl}/advanced/analytics/revenue/breakdown`).pipe(shareReplay(1));
  }

  getTopProducts(limit = 3): Observable<any> {
    return this.http.get(`${this.apiUrl}/advanced/analytics/products/top`, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(shareReplay(1));
  }

  searchAnalytics(query: string, filters: any): Observable<any> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    if (filters) params = params.set('filters', JSON.stringify(filters));
    
    return this.http.get(`${this.apiUrl}/advanced/analytics/search`, { params });
  }

  // ============ VENDOR ENDPOINTS ============

  getVendors(page = 1, limit = 20, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) params = params.set('status', status);
    
    return this.http.get(`${this.apiUrl}/vendors`, { params });
  }

  getVendorById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendors/${id}`).pipe(shareReplay(1));
  }

  createVendor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/vendors`, data);
  }

  updateVendor(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/vendors/${id}`, data);
  }

  updateVendorCommission(id: string, tier: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/vendors/${id}/commission`, { tier });
  }

  updateVendorPermissions(id: string, permissions: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/vendors/${id}/permissions`, permissions);
  }

  suspendVendor(id: string, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/vendors/${id}/suspend`, { reason });
  }

  getVendorPerformance(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendors/${id}/performance`).pipe(shareReplay(1));
  }

  // ============ ORDER ENDPOINTS ============

  getOrders(page = 1, limit = 20, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) params = params.set('status', status);
    
    return this.http.get(`${this.apiUrl}/orders`, { params });
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`).pipe(shareReplay(1));
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, data);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  updateOrderShipping(id: string, shipping: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/shipping`, shipping);
  }

  processRefund(id: string, reason: string, requestType = 'request'): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${id}/refund`, { reason, requestType });
  }

  approveRefund(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${id}/refund`, { requestType: 'approve' });
  }

  getOrderStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/stats/fulfillment`).pipe(shareReplay(1));
  }

  // ============ WAREHOUSE ENDPOINTS ============

  getWarehouses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/warehouses`).pipe(shareReplay(1));
  }

  getWarehouseById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/warehouses/${id}`).pipe(shareReplay(1));
  }

  createWarehouse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/warehouses`, data);
  }

  updateWarehouse(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/warehouses/${id}`, data);
  }

  updateWarehouseCapacity(id: string, usedCapacity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/warehouses/${id}/capacity`, { usedCapacity });
  }

  getWarehouseInventory(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/warehouses/${id}/inventory`).pipe(shareReplay(1));
  }

  getWarehouseStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/warehouses/stats/overview`).pipe(shareReplay(1));
  }

  // ============ PERMISSION ENDPOINTS ============

  getCurrentPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions/current`).pipe(shareReplay(1));
  }

  getPermissionsByRole(role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions/${role}`).pipe(shareReplay(1));
  }

  checkPermission(permission: string, resource?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/permissions/check`, { permission, resource });
  }

  updateVendorPermissionsAdvanced(vendorId: string, permissions: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/permissions/vendor/${vendorId}`, permissions);
  }

  getPermissionAuditLog(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions/audit/log`).pipe(shareReplay(1));
  }

  // ============ REAL-TIME UPDATES ============

  setupRealtimeUpdates<T>(
    endpoint: string,
    interval$: Observable<any>
  ): Observable<T> {
    return interval$
      .pipe(
        switchMap(() => this.http.get<T>(`${this.apiUrl}${endpoint}`)),
        takeUntil(this.destroy$),
        shareReplay(1)
      );
  }

  // ============ CLEANUP ============

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
