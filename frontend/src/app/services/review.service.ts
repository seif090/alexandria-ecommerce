import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) { }

  getReviews(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}`);
  }

  addReview(review: { product: string; rating: number; comment: string }): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(this.apiUrl, review, {
      headers: { 'x-auth-token': token || '' }
    });
  }
}
