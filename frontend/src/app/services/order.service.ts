import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/analytics/orders';

  constructor(private http: HttpClient) { }

  placeOrder(orderData: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(this.apiUrl, orderData, {
      headers: { 'x-auth-token': token || '' }
    });
  }
}
