import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white py-8 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-5xl font-black mb-2 italic tracking-tighter">Alexandria Last Chance</h1>
          <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Admin Control Center</p>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button (click)="seedDemoData()" 
                  [disabled]="isSeeding"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white py-6 rounded-3xl font-black text-lg uppercase transition-all transform active:scale-95 transition-all">
             {{ isSeeding ? '⏳ Seeding...' : '🌱 Seed Demo Data' }}
          </button>
          <button (click)="refreshStats()" 
                  class="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-lg uppercase transition-all transform active:scale-95">
             🔄 Refresh Stats
          </button>
          <button (click)="exportOrders()" 
                  class="bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-3xl font-black text-lg uppercase transition-all transform active:scale-95">
             📊 Export Orders
          </button>
        </div>

        <!-- System Health -->
        <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 mb-10">
          <h2 class="text-2xl font-black mb-6 uppercase tracking-widest text-xs">System Status</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl">
                <p class="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-2">Database</p>
                <p class="text-3xl font-black">{{ health?.database }}</p>
             </div>
             <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl">
                <p class="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Users</p>
                <p class="text-3xl font-black">{{ health?.dataPoints?.users || 0 }}</p>
             </div>
             <div class="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-2xl">
                <p class="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-2">Products</p>
                <p class="text-3xl font-black">{{ health?.dataPoints?.products || 0 }}</p>
             </div>
             <div class="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-2xl">
                <p class="text-[10px] font-black text-pink-200 uppercase tracking-widest mb-2">Status</p>
                <p class="text-lg font-black">{{ health?.status }}</p>
             </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div *ngIf="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <!-- Overview -->
          <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <h3 class="text-lg font-black mb-6 uppercase tracking-widest text-xs">Overview</h3>
             <div class="space-y-4">
                <div class="flex justify-between">
                   <span class="text-slate-400">Vendors</span>
                   <span class="font-black text-2xl text-blue-400">{{ stats.overview.totalVendors }}</span>
                </div>
                <div class="flex justify-between">
                   <span class="text-slate-400">Customers</span>
                   <span class="font-black text-2xl text-green-400">{{ stats.overview.totalCustomers }}</span>
                </div>
                <div class="flex justify-between">
                   <span class="text-slate-400">Products</span>
                   <span class="font-black text-2xl text-orange-400">{{ stats.overview.totalProducts }}</span>
                </div>
                <div class="flex justify-between bg-red-900/30 p-3 rounded-xl border border-red-800">
                   <span class="text-slate-300">Low Stock</span>
                   <span class="font-black text-xl text-red-400">{{ stats.overview.lowStockProducts }}</span>
                </div>
             </div>
          </div>

          <!-- Orders -->
          <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <h3 class="text-lg font-black mb-6 uppercase tracking-widest text-xs">Orders</h3>
             <div class="space-y-4">
                <div class="flex justify-between">
                   <span class="text-slate-400">Total</span>
                   <span class="font-black text-2xl text-blue-400">{{ stats.orders.totalOrders }}</span>
                </div>
                <div class="flex justify-between bg-green-900/30 p-3 rounded-xl border border-green-800">
                   <span class="text-slate-300">Completed</span>
                   <span class="font-black text-xl text-green-400">{{ stats.orders.completedOrders }}</span>
                </div>
                <div class="flex justify-between bg-yellow-900/30 p-3 rounded-xl border border-yellow-800">
                   <span class="text-slate-300">Processing</span>
                   <span class="font-black text-xl text-yellow-400">{{ stats.orders.processingOrders }}</span>
                </div>
                <div class="flex justify-between">
                   <span class="text-slate-400">Pending</span>
                   <span class="font-black text-xl text-orange-400">{{ stats.orders.pendingOrders }}</span>
                </div>
             </div>
          </div>

          <!-- Revenue -->
          <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <h3 class="text-lg font-black mb-6 uppercase tracking-widest text-xs">💰 Revenue</h3>
             <div class="space-y-4">
                <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                   <p class="text-3xl font-black text-emerald-400">{{ stats.revenue.totalRevenue }} EGP</p>
                </div>
                <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Order</p>
                   <p class="text-2xl font-black text-blue-400">{{ stats.revenue.avgOrderValue }} EGP</p>
                </div>
             </div>
          </div>
        </div>

        <!-- Top Vendors & Products -->
        <div *ngIf="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <!-- Top Vendors -->
          <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <h3 class="text-lg font-black mb-6 uppercase tracking-widest text-xs">🏆 Top Vendors</h3>
             <div class="space-y-4">
                <div *ngFor="let vendor of stats.topVendors" class="bg-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                   <div>
                      <p class="font-black text-sm">{{ vendor.vendorInfo[0]?.shopName || 'Unknown' }}</p>
                      <p class="text-[10px] text-slate-400">{{ vendor.orderCount }} orders</p>
                   </div>
                   <span class="font-black text-lg text-green-400">{{ vendor.totalSales }} EGP</span>
                </div>
             </div>
          </div>

          <!-- Quality Metrics -->
          <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <h3 class="text-lg font-black mb-6 uppercase tracking-widest text-xs">⭐ Quality</h3>
             <div class="space-y-4">
                <div class="flex justify-between">
                   <span class="text-slate-400">Total Reviews</span>
                   <span class="font-black text-2xl text-blue-400">{{ stats.quality.totalReviews }}</span>
                </div>
                <div class="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-2xl text-center">
                   <p class="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-2">Average Rating</p>
                   <p class="text-4xl font-black">{{ stats.quality.avgRating }} ⭐</p>
                </div>
             </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div *ngIf="stats" class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
          <h3 class="text-lg font-black mb-6 uppercase tracking-widest text-xs">📋 Recent Orders</h3>
          <div class="overflow-x-auto">
             <table class="w-full text-sm">
                <thead class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700">
                   <tr>
                      <th class="text-left py-4">Order ID</th>
                      <th class="text-left">Customer</th>
                      <th class="text-left">Vendor</th>
                      <th class="text-right">Amount</th>
                      <th class="text-center">Status</th>
                      <th class="text-right">Date</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let order of stats.recentOrders" class="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td class="py-4 font-bold text-blue-400">{{ order._id | slice:0:8 }}...</td>
                      <td class="text-slate-300">{{ order.user?.name }}</td>
                      <td class="text-slate-300">{{ order.vendor?.shopName }}</td>
                      <td class="text-right font-bold text-green-400">{{ order.totalAmount }} EGP</td>
                      <td class="text-center">
                         <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase"
                               [class.bg-green-900/50]="order.status === 'completed'"
                               [class.text-green-400]="order.status === 'completed'"
                               [class.bg-yellow-900/50]="order.status === 'processing'"
                               [class.text-yellow-400]="order.status === 'processing'"
                               [class.bg-blue-900/50]="order.status === 'pending'"
                               [class.text-blue-400]="order.status === 'pending'">
                            {{ order.status }}
                         </span>
                      </td>
                      <td class="text-right text-slate-400">{{ order.createdAt | date:'short' }}</td>
                   </tr>
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  health: any = null;
  isSeeding = false;
  private adminKey = 'alex-admin-2026-secret';
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.refreshStats();
    this.checkHealth();
  }

  refreshStats() {
    this.http.get(`${this.apiUrl}/admin-stats`, {
      headers: { 'x-admin-key': this.adminKey }
    }).subscribe({
      next: (data: any) => this.stats = data,
      error: (err) => console.error('Stats Error:', err)
    });
  }

  checkHealth() {
    this.http.get(`${this.apiUrl}/health`, {
      headers: { 'x-admin-key': this.adminKey }
    }).subscribe({
      next: (data: any) => this.health = data,
      error: (err) => console.error('Health Error:', err)
    });
  }

  seedDemoData() {
    this.isSeeding = true;
    this.http.post(`${this.apiUrl}/seed-demo-data`, {}, {
      headers: { 'x-admin-key': this.adminKey }
    }).subscribe({
      next: (data: any) => {
        alert(`✅ Seeded: ${data.stats.products} products, ${data.stats.orders} orders, ${data.stats.reviews} reviews!`);
        this.isSeeding = false;
        setTimeout(() => this.refreshStats(), 500);
      },
      error: (err) => {
        alert('❌ Seeding failed: ' + err.error?.message);
        this.isSeeding = false;
      }
    });
  }

  exportOrders() {
    window.open(`${this.apiUrl}/export-orders-csv?adminKey=${this.adminKey}`, '_blank');
  }
}
