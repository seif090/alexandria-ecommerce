import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) { }

  getProducts(category?: string, search?: string, minDiscount?: number): Observable<any[]> {
    let params = '?';
    if (category) params += `category=${category}&`;
    if (search) params += `search=${search}&`;
    if (minDiscount) params += `minDiscount=${minDiscount}&`;
    
    return this.http.get<any[]>(`${this.apiUrl}${params}`);
  }

  getVendorProducts(): Observable<any[]> {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/vendor`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  createProduct(product: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(this.apiUrl, product, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  getAIPriceOptimization(name: string, category: string, originalPrice: number, stockCount: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/ai-optimize`, { name, category, originalPrice, stockCount }, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  visualSearch(imageUrl: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/visual-discovery`, { imageUrl });
  }
}
