import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  orderNumber: string;
  vendor: string;
  products: string[];
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  estimatedDelivery: string;
  shippingAddress: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-black text-gray-900 mb-2 italic">Order Management</h1>
          <p class="text-gray-500 font-bold">Track and manage all your orders</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-blue-600">{{ allOrders.length }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Total Orders</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-yellow-600">{{ getCountByStatus('pending') + getCountByStatus('processing') }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">In Progress</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-purple-600">{{ getCountByStatus('shipped') }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Shipped</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-green-600">{{ getCountByStatus('delivered') }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Delivered</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Status</label>
              <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Date Range</label>
              <select [(ngModel)]="selectedDateRange" (change)="applyFilters()" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Price Range</label>
              <select [(ngModel)]="selectedPriceRange" (change)="applyFilters()" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                <option value="">All Prices</option>
                <option value="0-100">0 - 100 EGP</option>
                <option value="100-500">100 - 500 EGP</option>
                <option value="500-1000">500 - 1000 EGP</option>
                <option value="1000+">1000+ EGP</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Search</label>
              <input 
                [(ngModel)]="searchTerm" 
                (input)="applyFilters()"
                placeholder="Order #, vendor, product..." 
                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Orders List / Grid Toggle -->
        <div class="flex justify-between items-center mb-6">
          <p class="font-black text-gray-900">{{ filteredOrders.length }} orders</p>
          <div class="flex gap-2">
            <button (click)="viewMode = 'list'" 
                    [class.bg-blue-600]="viewMode === 'list'"
                    [class.text-white]="viewMode === 'list'"
                    [class.bg-gray-200]="viewMode !== 'list'"
                    class="px-4 py-2 rounded-lg font-bold text-sm transition-colors">
              📋 List
            </button>
            <button (click)="viewMode = 'grid'"
                    [class.bg-blue-600]="viewMode === 'grid'"
                    [class.text-white]="viewMode === 'grid'"
                    [class.bg-gray-200]="viewMode !== 'grid'"
                    class="px-4 py-2 rounded-lg font-bold text-sm transition-colors">
              🔲 Grid
            </button>
          </div>
        </div>

        <!-- Orders Grid View -->
        <div *ngIf="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let order of filteredOrders" class="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow p-6">
            <!-- Order Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-xs font-bold text-gray-500 uppercase">Order ID</p>
                <p class="text-lg font-black text-gray-900">#{{ order.orderNumber }}</p>
              </div>
              <span [ngClass]="'bg-' + getStatusColor(order.status) + '-100 text-' + getStatusColor(order.status) + '-700'"
                    class="px-3 py-1 rounded-full text-xs font-black uppercase">
                {{ order.status }}
              </span>
            </div>

            <!-- Vendor & Date -->
            <div class="mb-4 pb-4 border-b border-gray-200">
              <p class="text-xs font-bold text-gray-600 mb-1">Vendor: <span class="text-gray-900">{{ order.vendor }}</span></p>
              <p class="text-xs font-bold text-gray-600">Ordered: <span class="text-gray-900">{{ order.date }}</span></p>
            </div>

            <!-- Products Preview -->
            <div class="mb-4">
              <p class="text-xs font-bold text-gray-600 uppercase mb-2">Products</p>
              <div class="space-y-1">
                <p *ngFor="let product of order.products.slice(0, 2)" class="text-sm text-gray-800">• {{ product }}</p>
                <p *ngIf="order.products.length > 2" class="text-xs font-bold text-blue-600">+ {{ order.products.length - 2 }} more</p>
              </div>
            </div>

            <!-- Timeline -->
            <div class="mb-4 space-y-2">
              <div class="flex items-center gap-2">
                <span [ngClass]="getStatusProgress(order.status) >= 25 ? 'bg-green-500' : 'bg-gray-300'" 
                      class="w-3 h-3 rounded-full"></span>
                <span class="text-xs font-bold text-gray-600">Confirmed</span>
              </div>
              <div class="flex items-center gap-2">
                <span [ngClass]="getStatusProgress(order.status) >= 50 ? 'bg-green-500' : 'bg-gray-300'" 
                      class="w-3 h-3 rounded-full"></span>
                <span class="text-xs font-bold text-gray-600">Processing</span>
              </div>
              <div class="flex items-center gap-2">
                <span [ngClass]="getStatusProgress(order.status) >= 75 ? 'bg-green-500' : 'bg-gray-300'" 
                      class="w-3 h-3 rounded-full"></span>
                <span class="text-xs font-bold text-gray-600">Shipped</span>
              </div>
              <div class="flex items-center gap-2">
                <span [ngClass]="getStatusProgress(order.status) >= 100 ? 'bg-green-500' : 'bg-gray-300'" 
                      class="w-3 h-3 rounded-full"></span>
                <span class="text-xs font-bold text-gray-600">Delivered</span>
              </div>
            </div>

            <!-- Amount & Action -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <p class="text-xl font-black text-blue-600">{{ order.amount }} EGP</p>
              <button (click)="openOrderDetails(order)" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-black transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Orders List View -->
        <div *ngIf="viewMode === 'list'" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Order Number</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Vendor</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Products</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Amount</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Status</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Date</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of filteredOrders" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-6 font-bold text-gray-900">#{{ order.orderNumber }}</td>
                  <td class="py-4 px-6 text-gray-700 font-bold">{{ order.vendor }}</td>
                  <td class="py-4 px-6 text-sm text-gray-700">
                    <div class="flex items-center gap-2">
                      <span>{{ order.products[0] }}</span>
                      <span *ngIf="order.products.length > 1" class="text-xs font-bold text-blue-600">+{{ order.products.length - 1 }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6 font-black text-gray-900">{{ order.amount }} EGP</td>
                  <td class="py-4 px-6">
                    <span [ngClass]="'bg-' + getStatusColor(order.status) + '-100 text-' + getStatusColor(order.status) + '-700'"
                          class="px-3 py-1 rounded-full text-xs font-black uppercase">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-gray-600 font-bold text-sm">{{ order.date }}</td>
                  <td class="py-4 px-6">
                    <button (click)="openOrderDetails(order)" class="text-blue-600 hover:text-blue-700 font-black text-sm">
                      View →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Order Details Modal -->
        <div *ngIf="selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="text-xs font-bold uppercase opacity-90">Order</p>
                  <p class="text-3xl font-black">#{{ selectedOrder.orderNumber }}</p>
                </div>
                <button (click)="selectedOrder = null" class="text-2xl">✕</button>
              </div>
              <p class="text-sm opacity-90">{{ selectedOrder.date }}</p>
            </div>

            <!-- Content -->
            <div class="p-8">
              <!-- Status -->
              <div class="mb-8 p-6 bg-gray-50 rounded-2xl">
                <p class="text-xs font-bold text-gray-600 uppercase mb-3">Status</p>
                <div class="flex items-center justify-between">
                  <div class="text-center">
                    <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-black mx-auto mb-2">✓</div>
                    <p class="text-xs font-bold">Confirmed</p>
                  </div>
                  <div class="flex-1 h-1 bg-gray-300 mx-2"></div>
                  <div [ngClass]="['pending', 'processing'].includes(selectedOrder.status) ? 'bg-gray-300' : 'bg-green-500'" 
                       class="text-center">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-black mx-auto mb-2 transition-colors"
                         [ngClass]="['pending', 'processing'].includes(selectedOrder.status) ? 'bg-gray-300' : 'bg-green-500'">
                      {{ ['pending', 'processing'].includes(selectedOrder.status) ? '⏳' : '✓' }}
                    </div>
                    <p class="text-xs font-bold">Processing</p>
                  </div>
                  <div class="flex-1 h-1 bg-gray-300 mx-2"></div>
                  <div [ngClass]="['shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300'" 
                       class="text-center">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-black mx-auto mb-2 transition-colors"
                         [ngClass]="['shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300'">
                      {{ ['shipped', 'delivered'].includes(selectedOrder.status) ? '🚚' : '📦' }}
                    </div>
                    <p class="text-xs font-bold">Shipped</p>
                  </div>
                  <div class="flex-1 h-1 bg-gray-300 mx-2"></div>
                  <div [ngClass]="selectedOrder.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'" 
                       class="text-center">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-black mx-auto mb-2 transition-colors"
                         [ngClass]="selectedOrder.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'">
                      ✓
                    </div>
                    <p class="text-xs font-bold">Delivered</p>
                  </div>
                </div>
              </div>

              <!-- Order Info -->
              <div class="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p class="text-xs font-bold text-gray-600 uppercase mb-2">Vendor</p>
                  <p class="text-lg font-black text-gray-900">{{ selectedOrder.vendor }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold text-gray-600 uppercase mb-2">Amount</p>
                  <p class="text-lg font-black text-blue-600">{{ selectedOrder.amount }} EGP</p>
                </div>
              </div>

              <!-- Products -->
              <div class="mb-8">
                <p class="text-sm font-black text-gray-900 mb-4">Products</p>
                <div class="space-y-3">
                  <div *ngFor="let product of selectedOrder.products" class="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                    <span class="text-2xl">📦</span>
                    <div class="flex-1">
                      <p class="font-bold text-gray-900">{{ product }}</p>
                      <p class="text-xs text-gray-600">Qty: 1</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Shipping Info -->
              <div class="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <p class="text-sm font-black text-gray-900 mb-3">Shipping Information</p>
                <p class="text-sm text-gray-700 font-bold mb-1">{{ selectedOrder.shippingAddress }}</p>
                <p class="text-xs text-gray-600 font-bold mt-4">Estimated Delivery: <span class="text-gray-900">{{ selectedOrder.estimatedDelivery }}</span></p>
                <p *ngIf="selectedOrder.trackingNumber" class="text-xs text-gray-600 font-bold mt-2">Tracking: <span class="text-blue-600 font-black">{{ selectedOrder.trackingNumber }}</span></p>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-2xl font-black transition-colors">
                  Download Invoice
                </button>
                <button *ngIf="selectedOrder.status === 'delivered'" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black transition-colors">
                  Leave Review
                </button>
                <button *ngIf="!['delivered', 'cancelled'].includes(selectedOrder.status)" class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-2xl font-black transition-colors">
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderManagementComponent implements OnInit {
  viewMode: 'list' | 'grid' = 'list';
  selectedStatus = '';
  selectedDateRange = 'all';
  selectedPriceRange = '';
  searchTerm = '';
  selectedOrder: Order | null = null;

  allOrders: Order[] = [
    {
      id: '1',
      orderNumber: '10234',
      vendor: 'Fashion Hub',
      products: ['Summer Collection Dress', 'Casual Wear Shirt', 'Accessories Bundle'],
      amount: 450,
      status: 'delivered',
      date: 'Mar 15, 2026',
      estimatedDelivery: 'Mar 18, 2026',
      shippingAddress: '123 Nile Street, Cairo, Egypt 11511',
      trackingNumber: 'EG123456789'
    },
    {
      id: '2',
      orderNumber: '10233',
      vendor: 'Electronics Store',
      products: ['Wireless Headphones', 'Phone Charger'],
      amount: 320,
      status: 'shipped',
      date: 'Mar 14, 2026',
      estimatedDelivery: 'Mar 17, 2026',
      shippingAddress: '456 Tahrir Square, Cairo, Egypt 11511',
      trackingNumber: 'EG123456790'
    },
    {
      id: '3',
      orderNumber: '10232',
      vendor: 'Home Decor Plus',
      products: ['Modern Lamp', 'Wall Clock', 'Picture Frames'],
      amount: 580,
      status: 'processing',
      date: 'Mar 14, 2026',
      estimatedDelivery: 'Mar 19, 2026',
      shippingAddress: '789 Zamalek, Cairo, Egypt 11511'
    },
    {
      id: '4',
      orderNumber: '10231',
      vendor: 'Beauty & Care',
      products: ['Skincare Set', 'Face Masks'],
      amount: 210,
      status: 'pending',
      date: 'Mar 13, 2026',
      estimatedDelivery: 'Mar 20, 2026',
      shippingAddress: '321 Giza, Cairo, Egypt 12345'
    },
    {
      id: '5',
      orderNumber: '10230',
      vendor: 'Fashion Hub',
      products: ['Winter Jacket', 'Thermal Wear'],
      amount: 890,
      status: 'delivered',
      date: 'Mar 13, 2026',
      estimatedDelivery: 'Mar 16, 2026',
      shippingAddress: '654 Heliopolis, Cairo, Egypt 11371',
      trackingNumber: 'EG123456791'
    }
  ];

  filteredOrders: Order[] = [];

  ngOnInit() {
    this.filteredOrders = [...this.allOrders];
  }

  applyFilters() {
    this.filteredOrders = this.allOrders.filter(order => {
      // Status filter
      if (this.selectedStatus && order.status !== this.selectedStatus) {
        return false;
      }

      // Price range filter
      if (this.selectedPriceRange) {
        const [min, max] = this.parsePriceRange(this.selectedPriceRange);
        if (order.amount < min || (max && order.amount > max)) {
          return false;
        }
      }

      // Search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        if (!order.orderNumber.toLowerCase().includes(term) &&
            !order.vendor.toLowerCase().includes(term) &&
            !order.products.some(p => p.toLowerCase().includes(term))) {
          return false;
        }
      }

      return true;
    });
  }

  parsePriceRange(range: string): [number, number | null] {
    if (range === '0-100') return [0, 100];
    if (range === '100-500') return [100, 500];
    if (range === '500-1000') return [500, 1000];
    if (range === '1000+') return [1000, null];
    return [0, null];
  }

  getCountByStatus(status: string): number {
    return this.allOrders.filter(o => o.status === status).length;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusProgress(status: string): number {
    const progress: Record<string, number> = {
      pending: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0
    };
    return progress[status] || 0;
  }

  openOrderDetails(order: Order) {
    this.selectedOrder = order;
  }
}
