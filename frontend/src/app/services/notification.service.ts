import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';
  private socket: Socket;
  private notificationsSubject = new Subject<any>();
  private unreadCountSubject = new Subject<number>();
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    // Listen for new deals
    this.socket.on('newDeal', (data: any) => {
      const notification = {
        id: data.id,
        type: 'deal_alert',
        title: '🎉 Flash Deal Alert!',
        message: `${data.productName} now ${data.discount}% OFF - ${data.price} EGP`,
        data,
        timestamp: new Date(),
        read: false
      };
      this.notificationsSubject.next(notification);
      this.playNotificationSound();
    });

    // Listen for order updates
    this.socket.on('order:update', (data: any) => {
      const notification = {
        id: data.orderId,
        type: 'order_update',
        title: '📦 Order Update',
        message: `Your order is ${data.status}`,
        data,
        timestamp: new Date(),
        read: false
      };
      this.notificationsSubject.next(notification);
    });

    // Listen for system messages
    this.socket.on('system:message', (data: any) => {
      const notification = {
        id: data.id,
        type: 'system',
        title: data.title,
        message: data.message,
        data,
        timestamp: new Date(),
        read: false
      };
      this.notificationsSubject.next(notification);
    });

    // Listen for unread count updates
    this.socket.on('unread:count', (count: number) => {
      this.unreadCountSubject.next(count);
    });
  }

  getNewDealNotifications(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newDeal', (data) => observer.next(data));
    });
  }

  // Subscribe to deal notifications by category
  subscribeToDealNotifications(categories: string[]): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/subscribe-deals`, { categories }, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Get all notifications
  getNotifications(limit: number = 20): Observable<any[]> {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/list?limit=${limit}`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Mark as read
  markAsRead(notificationId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/mark-read/${notificationId}`, {}, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Mark all as read
  markAllAsRead(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/mark-all-read`, {}, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    const token = localStorage.getItem('token');
    return this.http.get<number>(`${this.apiUrl}/unread-count`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete<any>(`${this.apiUrl}/${notificationId}`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Send push notification
  sendPushNotification(notification: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: 'assets/logo.png',
        tag: notification.id
      });
    }
  }

  // Play sound
  private playNotificationSound(): void {
    const audio = new Audio('assets/notification-sound.mp3');
    audio.play().catch(err => console.log('Sound unavailable:', err));
  }
}
