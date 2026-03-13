import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bell Icon in Navbar (shown in app.html) -->
      <button (click)="toggleNotifications()" class="relative group cursor-pointer">
        <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
          🔔
        </div>
        <span *ngIf="unreadCount() > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
          {{ unreadCount() }}
        </span>
      </button>

      <!-- Notifications Dropdown -->
      <div *ngIf="showNotifications" class="absolute right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-orange-600 text-white p-4 flex justify-between items-center">
          <div>
            <h3 class="font-black text-lg">Notifications</h3>
            <p class="text-[10px] text-white/70 font-bold">{{ unreadCount() }} unread</p>
          </div>
          <div class="flex gap-2">
            <button (click)="markAllAsRead()" class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
              Mark all read
            </button>
            <button (click)="toggleNotifications()" class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
              ✕
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <div *ngIf="notifications.length === 0" class="p-8 text-center text-gray-400 font-bold">
            <p>🔔 No notifications yet</p>
            <p class="text-xs mt-2">You'll see updates here about deals, orders, and messages</p>
          </div>

          <div *ngFor="let notif of notifications" 
               (click)="markAsRead(notif._id)"
               class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
               [ngClass]="notif.isRead ? 'bg-gray-50 opacity-70' : 'bg-white'">
            
            <!-- Deal Alert -->
            <div *ngIf="notif.type === 'deal_alert'" class="flex gap-3">
              <div class="text-2xl">🎉</div>
              <div class="flex-1">
                <p class="font-black text-sm text-gray-900">{{ notif.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ notif.message }}</p>
                <div class="flex gap-2 mt-2">
                  <button class="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                    View Deal
                  </button>
                  <button (click)="deleteNotification(notif._id)" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
              <div *ngIf="!notif.isRead" class="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            </div>

            <!-- Order Update -->
            <div *ngIf="notif.type === 'order_update'" class="flex gap-3">
              <div class="text-2xl">📦</div>
              <div class="flex-1">
                <p class="font-black text-sm text-gray-900">{{ notif.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ notif.message }}</p>
                <p class="text-[10px] text-gray-400 mt-2">{{ notif.createdAt | date:'short' }}</p>
              </div>
              <div *ngIf="!notif.isRead" class="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            </div>

            <!-- System Message -->
            <div *ngIf="notif.type === 'system'" class="flex gap-3">
              <div class="text-2xl">ℹ️</div>
              <div class="flex-1">
                <p class="font-black text-sm text-gray-900">{{ notif.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ notif.message }}</p>
              </div>
              <div *ngIf="!notif.isRead" class="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 p-4 text-center">
          <button class="text-blue-600 hover:text-blue-700 font-black text-sm transition-colors">
            View All Notifications →
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationsCenterComponent implements OnInit {
  showNotifications = false;
  notifications = signal<any[]>([]);
  unreadCount = signal<number>(0);

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
    this.subscribeToNotifications();
  }

  loadNotifications() {
    this.notificationService.getNotifications(20).subscribe({
      next: (data: any[]) => {
        this.notifications.set(data);
      }
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count: number) => {
        this.unreadCount.set(count);
      }
    });
  }

  subscribeToNotifications() {
    this.notificationService.notifications$.subscribe({
      next: (notification: any) => {
        const current = this.notifications();
        this.notifications.set([notification, ...current]);
        const count = this.unreadCount();
        this.unreadCount.set(count + 1);
      }
    });

    this.notificationService.unreadCount$.subscribe({
      next: (count: number) => {
        this.unreadCount.set(count);
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const updated = this.notifications().map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        );
        this.notifications.set(updated);
        const count = Math.max(0, this.unreadCount() - 1);
        this.unreadCount.set(count);
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const updated = this.notifications().map(n => ({ ...n, isRead: true }));
        this.notifications.set(updated);
        this.unreadCount.set(0);
      }
    });
  }

  deleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        const updated = this.notifications().filter(n => n._id !== notificationId);
        this.notifications.set(updated);
      }
    });
  }
}
