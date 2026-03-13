import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface VendorMetric {
  label: string;
  value: number | string;
  unit: string;
  trend: number;
  icon: string;
  color: string;
}

interface PerformanceAlert {
  type: 'success' | 'warning' | 'error';
  message: string;
  icon: string;
}

@Component({
  selector: 'app-vendor-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-black text-gray-900 mb-2 italic">Vendor Performance</h1>
          <p class="text-gray-500 font-bold">Track your sales metrics and optimize your business</p>
        </div>

        <!-- Performance Alerts -->
        <div class="space-y-3 mb-12">
          <div class="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <span class="text-2xl">✅</span>
            <div>
              <p class="font-bold text-green-900">Great Performance!</p>
              <p class="text-sm text-green-700">You're in the top 10% of vendors this month</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <span class="text-2xl">⚡</span>
            <div>
              <p class="font-bold text-yellow-900">Ship Faster</p>
              <p class="text-sm text-yellow-700">Average shipping time increased to 2.4 days. Target: 2 days</p>
            </div>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow" *ngFor="let metric of keyMetrics">
            <div class="flex justify-between items-start mb-4">
              <span class="text-3xl">{{ metric.icon }}</span>
              <span [ngClass]="metric.trend >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs font-black">
                {{ metric.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(metric.trend) }}%
              </span>
            </div>
            <p class="text-sm text-gray-600 font-bold mb-2">{{ metric.label }}</p>
            <p class="text-3xl font-black" [ngClass]="'text-' + metric.color + '-900'">
              {{ metric.value }}<span class="text-lg">{{ metric.unit }}</span>
            </p>
          </div>
        </div>

        <!-- Sales Overview & Top Products -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <!-- Sales Chart -->
          <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-black text-gray-900 mb-6">Sales Trend - March 2026</h2>
            
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl h-64 flex items-end justify-around">
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-blue-400 rounded-t-lg" style="height: 80px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Mon</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-blue-500 rounded-t-lg" style="height: 120px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Tue</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-blue-400 rounded-t-lg" style="height: 100px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Wed</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-purple-500 rounded-t-lg" style="height: 160px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Thu</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-blue-500 rounded-t-lg" style="height: 140px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Fri</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-purple-600 rounded-t-lg" style="height: 180px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Sat</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="w-12 bg-blue-500 rounded-t-lg" style="height: 110px;"></div>
                <p class="text-xs font-bold text-gray-600 mt-2">Sun</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mt-6">
              <div class="text-center p-4 bg-gray-50 rounded-2xl">
                <p class="text-2xl font-black text-blue-600">2,450 EGP</p>
                <p class="text-xs font-bold text-gray-500">This Week</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-2xl">
                <p class="text-2xl font-black text-purple-600">8,920 EGP</p>
                <p class="text-xs font-bold text-gray-500">This Month</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-2xl">
                <p class="text-2xl font-black text-green-600">↑ 34%</p>
                <p class="text-xs font-bold text-gray-500">Growth</p>
              </div>
            </div>
          </div>

          <!-- Top Products -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-black text-gray-900 mb-6">Top Products</h2>
            
            <div class="space-y-4">
              <div *ngFor="let product of topProducts" class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center text-white font-black" 
                     [ngClass]="'from-' + product.color + '-400 + ' + product.color + '-600'">
                  {{ product.icon }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-black text-gray-900">{{ product.name }}</p>
                  <p class="text-xs text-gray-600">{{ product.sales }} sales</p>
                </div>
                <p class="text-sm font-black text-gray-900">{{ product.revenue }} EGP</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rating & Reviews -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <!-- Rating -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-black text-gray-900 mb-6">Your Rating</h2>
            
            <div class="flex items-center gap-6 mb-8">
              <div class="text-center">
                <p class="text-6xl font-black text-yellow-500">4.8</p>
                <p class="text-sm text-gray-600 font-bold flex justify-center gap-1">
                  <span>★★★★★</span>
                </p>
                <p class="text-xs text-gray-500 font-bold mt-2">342 reviews</p>
              </div>

              <div class="flex-1 space-y-3">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-bold text-gray-600">5 stars</span>
                    <span class="text-xs font-bold text-gray-900">285</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 83%;"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-bold text-gray-600">4 stars</span>
                    <span class="text-xs font-bold text-gray-900">42</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 12%;"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-bold text-gray-600">3 stars</span>
                    <span class="text-xs font-bold text-gray-900">12</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 3%;"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-bold text-gray-600">Below 3</span>
                    <span class="text-xs font-bold text-gray-900">3</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 1%;"></div>
                  </div>
                </div>
              </div>
            </div>

            <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold transition-colors">
              View All Reviews
            </button>
          </div>

          <!-- Performance Goals -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-black text-gray-900 mb-6">Performance Goals</h2>
            
            <div class="space-y-5">
              <div *ngFor="let goal of performanceGoals">
                <div class="flex justify-between items-center mb-2">
                  <p class="text-sm font-bold text-gray-900">{{ goal.label }}</p>
                  <span class="text-xs font-black text-gray-600">{{ goal.current }}/{{ goal.target }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r rounded-full h-3 transition-all"
                       [ngClass]="goal.completed ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'"
                       [style.width.%]="(goal.current / goal.target) * 100"></div>
                </div>
                <p class="text-xs text-gray-500 font-bold mt-1">{{ goal.progress }}% complete</p>
              </div>
            </div>

            <button class="w-full mt-6 bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-2xl font-bold transition-colors">
              View Growth Tips
            </button>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-black text-gray-900 mb-6">Recent Orders</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-4 px-4 text-xs font-black text-gray-600">Order ID</th>
                  <th class="text-left py-4 px-4 text-xs font-black text-gray-600">Customer</th>
                  <th class="text-left py-4 px-4 text-xs font-black text-gray-600">Amount</th>
                  <th class="text-left py-4 px-4 text-xs font-black text-gray-600">Status</th>
                  <th class="text-left py-4 px-4 text-xs font-black text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-4 font-bold text-gray-900">#{{ order.id }}</td>
                  <td class="py-4 px-4 text-gray-700 font-bold">{{ order.customer }}</td>
                  <td class="py-4 px-4 font-black text-gray-900">{{ order.amount }} EGP</td>
                  <td class="py-4 px-4">
                    <span [ngClass]="'bg-' + order.statusColor + '-100 text-' + order.statusColor + '-700'" 
                          class="px-3 py-1 rounded-full text-xs font-black">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-gray-600 font-bold text-sm">{{ order.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorPerformanceComponent implements OnInit {
  Math = Math;

  keyMetrics: VendorMetric[] = [
    { label: 'Total Sales', value: 8920, unit: ' EGP', trend: 34, icon: '📊', color: 'blue' },
    { label: 'Total Orders', value: 156, unit: '', trend: 12, icon: '📦', color: 'orange' },
    { label: 'Total Customers', value: 487, unit: '', trend: 8, icon: '👥', color: 'green' },
    { label: 'Conversion Rate', value: '3.2', unit: '%', trend: 5, icon: '🎯', color: 'purple' }
  ];

  topProducts = [
    { name: 'Spring Collection', sales: 45, revenue: 3420, icon: '👗', color: 'pink' },
    { name: 'Casual Wear', sales: 38, revenue: 2850, icon: '👔', color: 'blue' },
    { name: 'Accessories', sales: 32, revenue: 1650, icon: '⌚', color: 'yellow' }
  ];

  performanceGoals = [
    { label: 'Customer Reviews', current: 42, target: 50, progress: 84, completed: false },
    { label: 'On-Time Shipments', current: 94, target: 95, progress: 99, completed: true },
    { label: 'Return Rate', current: 2, target: 3, progress: 67, completed: true }
  ];

  recentOrders = [
    { id: '10234', customer: 'Ahmed Hassan', amount: 450, status: 'Delivered', statusColor: 'green', date: 'Mar 15' },
    { id: '10233', customer: 'Fatima Ahmad', amount: 320, status: 'Shipped', statusColor: 'blue', date: 'Mar 14' },
    { id: '10232', customer: 'Mohammed Karim', amount: 580, status: 'Processing', statusColor: 'yellow', date: 'Mar 14' },
    { id: '10231', customer: 'Noor Ali', amount: 210, status: 'Pending', statusColor: 'orange', date: 'Mar 13' },
    { id: '10230', customer: 'Zainab Mohamed', amount: 890, status: 'Delivered', statusColor: 'green', date: 'Mar 13' }
  ];

  ngOnInit() {
    // Load vendor performance data
  }
}
