import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:3000/api/analytics';

  constructor(private http: HttpClient) { }

  getVendorAnalytics(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get<any>(`${this.apiUrl}/analytics`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  upgradePlan(plan: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/upgrade-subscription`, { plan }, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  boostProduct(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/boost-product/${productId}`, {}, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  getMarketHeatmap(): Observable<any[]> {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/market-heatmap`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard`);
  }

  verifyPickupOTP(orderId: string, otp: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/verify-pickup-otp`, { orderId, otp }, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  getRecommendations(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get<any>(`${this.apiUrl}/recommendations`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  getProductSentiment(productId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/product-sentiment/${productId}`);
  }

  checkSurgeAlert(productId: string, district: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/check-surge-alert`, { productId, district }, {
      headers: { 'x-auth-token': token || '' }
    });
  }
}
