import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

interface Order {
  id: string;
  orderNumber: string;
  vendor: string;
  customer: string;
  items: number;
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'returned';
  total: number;
  createdAt: Date;
  estimatedDelivery?: Date;
  carrier?: string;
  trackingNumber?: string;
}

interface FulfillmentStatus {
  label: string;
  icon: string;
  color: string;
  count: number;
  percentage: number;
}

interface WarehouseLocation {
  id: string;
  name: string;
  city: string;
  capacity: number;
  utilization: number;
  activeOrders: number;
}

@Component({
  selector: 'app-fulfillment-system',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-nile text-white">
      <!-- Mobile Header -->
      <div class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-white/10">
        <div class="px-4 py-4 lg:px-8">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-pharaonic">
              📦 Fulfillment System
            </h1>
            <button (click)="toggleMobileMenu()" class="lg:hidden p-2 hover:bg-white/10 rounded-lg">
              ☰
            </button>
          </div>

          <!-- Status Filter Chips (Mobile Scroll) -->
          <div class="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4">
            <button *ngFor="let status of fulfillmentStatuses$ | async"
                    (click)="filterByStatus(status.label)"
                    [class.active]="selectedStatus === status.label"
                    class="px-4 py-2 rounded font-bold whitespace-nowrap text-sm transition flex items-center gap-2"
                    [ngClass]="selectedStatus === status.label 
                      ? 'bg-gradient-pharaonic text-black' 
                      : 'bg-white/10 hover:bg-white/20'">
              <span>{{ status.icon }}</span>
              <span>{{ status.label }} ({{ status.count }})</span>
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 lg:p-8">
        <!-- Key Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div *ngFor="let metric of (fulfillmentMetrics$ | async)" [@slideUp]
               class="metric-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs text-white/60 font-bold uppercase mb-2">{{ metric.label }}</p>
                <p class="text-2xl lg:text-3xl font-black">{{ metric.count }}</p>
              </div>
              <span class="text-3xl">{{ metric.icon }}</span>
            </div>
            <div class="mt-2 text-xs font-bold" [ngClass]="'text-' + metric.color">
              {{ metric.percentage }}% of total
            </div>
          </div>
        </div>

        <!-- Warehouse Control Center -->
        <div class="mb-8">
          <h2 class="text-2xl font-black mb-4">🏭 Warehouse Network</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div *ngFor="let warehouse of warehouses$ | async"
                 class="warehouse-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-white/30 transition cursor-pointer"
                 (click)="selectWarehouse(warehouse)">
              
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-black text-sm lg:text-base">{{ warehouse.name }}</h3>
                  <p class="text-xs text-white/60">📍 {{ warehouse.city }}</p>
                </div>
                <div class="text-2xl">📍</div>
              </div>

              <div class="space-y-2 mb-4">
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-white/70">Capacity</span>
                    <span class="text-xs font-bold">{{ warehouse.utilization }}%</span>
                  </div>
                  <div class="h-2 bg-white/10 rounded overflow-hidden">
                    <div class="h-full transition-all"
                         [style.width.%]="warehouse.utilization"
                         [style.backgroundColor]="getCapacityColor(warehouse.utilization)"></div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="bg-white/5 rounded p-2">
                    <p class="text-white/60">Capacity</p>
                    <p class="font-black">{{ warehouse.capacity }}</p>
                  </div>
                  <div class="bg-white/5 rounded p-2">
                    <p class="text-white/60">Active</p>
                    <p class="font-black text-blue-400">{{ warehouse.activeOrders }}</p>
                  </div>
                </div>
              </div>

              <button class="w-full px-3 py-2 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold rounded transition">
                👁️ View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Order Management Section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-black">📋 Active Orders</h2>
            <div class="flex gap-2">
              <input type="text" placeholder="Search orders..." 
                     class="px-4 py-2 text-sm bg-white/10 rounded border border-white/20 focus:border-white/40 text-white placeholder-white/50">
              <button class="px-4 py-2 bg-gradient-pharaonic text-black font-bold rounded hover:shadow-lg transition text-sm">
                🔍
              </button>
            </div>
          </div>

          <!-- Orders List (Mobile Responsive Cards & Desktop Table) -->
          <div class="hidden lg:block bg-slate-900/50 backdrop-blur rounded-lg border border-white/10 overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-white/10">
                <tr>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Order ID</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Vendor</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Items</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Status</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Est. Delivery</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of (filteredOrders$ | async)" 
                    class="border-b border-white/10 hover:bg-white/5 transition cursor-pointer"
                    (click)="selectOrder(order)">
                  <td class="px-4 py-3 font-bold">{{ order.orderNumber }}</td>
                  <td class="px-4 py-3 text-white/80">{{ order.vendor }}</td>
                  <td class="px-4 py-3">{{ order.items }}x</td>
                  <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded text-xs font-bold" [ngClass]="getStatusClass(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-white/80">{{ order.estimatedDelivery | date: 'MMM dd' }}</td>
                  <td class="px-4 py-3">
                    <button (click)="updateOrderStatus(order); $event.stopPropagation()"
                            class="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs font-bold rounded transition">
                      Update
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="lg:hidden grid grid-cols-1 gap-4">
            <div *ngFor="let order of (filteredOrders$ | async)"
                 (click)="selectOrder(order)"
                 class="order-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-white/30 transition cursor-pointer">
              
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-black text-sm">{{ order.orderNumber }}</p>
                  <p class="text-xs text-white/60">{{ order.vendor }}</p>
                </div>
                <span class="px-3 py-1 rounded text-xs font-bold" [ngClass]="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2 mb-3 p-2 bg-white/5 rounded text-center">
                <div>
                  <p class="text-xs text-white/60">Items</p>
                  <p class="font-black">{{ order.items }}x</p>
                </div>
                <div>
                  <p class="text-xs text-white/60">Total</p>
                  <p class="font-black text-green-400">{{ order.total }}K</p>
                </div>
                <div>
                  <p class="text-xs text-white/60">Delivery</p>
                  <p class="font-black text-orange-400">{{ order.estimatedDelivery | date: 'dd/MM' }}</p>
                </div>
              </div>

              <div *ngIf="order.trackingNumber" class="mb-3 p-2 bg-blue-600/10 rounded text-xs border border-blue-400/20">
                <p class="text-blue-400 font-bold">📦 {{ order.carrier }} - {{ order.trackingNumber }}</p>
              </div>

              <button (click)="updateOrderStatus(order); $event.stopPropagation()"
                      class="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs font-bold rounded transition">
                Update Status
              </button>
            </div>
          </div>
        </div>

        <!-- Order Status Update Modal (Mobile Bottom Sheet on Mobile) -->
        <div *ngIf="(selectedOrder$ | async) as order" [@fadeIn]
             class="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50"
             (click)="closeModal()">
          <div class="bg-slate-900 rounded-t-lg lg:rounded-lg w-full lg:w-96 p-6 border border-white/10"
               (click)="$event.stopPropagation()">
            
            <h2 class="text-xl font-black mb-4">📦 Update Order Status</h2>
            <p class="text-sm text-white/60 mb-6">Order: {{ order.orderNumber }}</p>

            <div class="space-y-3 mb-6">
              <button *ngFor="let status of statusOptions"
                      (click)="updateStatus(status)"
                      [class.active]="order.status === status"
                      class="w-full px-4 py-3 text-left rounded border border-white/20 hover:border-white/40 hover:bg-white/5 transition font-bold text-sm"
                      [ngClass]="order.status === status ? 'bg-gradient-pharaonic text-black border-none' : ''">
                {{ getStatusLabel(status) }}
              </button>
            </div>

            <div class="space-y-3">
              <input type="text" placeholder="Tracking Number (optional)" 
                     class="w-full px-4 py-2 bg-white/10 rounded border border-white/20 focus:border-white/40 text-white placeholder-white/50 text-sm">
              
              <select class="w-full px-4 py-2 bg-white/10 rounded border border-white/20 focus:border-white/40 text-white text-sm">
                <option>Select Carrier</option>
                <option>FedEx</option>
                <option>UPS</option>
                <option>DHL</option>
                <option>Local Courier</option>
              </select>
            </div>

            <div class="flex gap-3 mt-6">
              <button (click)="closeModal()" class="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-bold transition text-sm">
                Cancel
              </button>
              <button (click)="confirmUpdate()" class="flex-1 px-4 py-2 bg-gradient-pharaonic text-black rounded font-bold hover:shadow-lg transition text-sm">
                Update
              </button>
            </div>
          </div>
        </div>

        <!-- Real-time Update Indicator -->
        <div class="fixed bottom-4 left-4 right-4 lg:static lg:mt-6 bg-blue-600/20 border border-blue-400/50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span class="text-xs lg:text-sm font-bold">Real-time Fulfillment Updates</span>
          </div>
          <span class="text-xs text-white/60">Last updated: {{ lastUpdate }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .metric-card {
      animation: slideUp 0.6s ease-out;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .warehouse-card {
      animation: slideUp 0.6s ease-out;
      transition: all 0.3s ease;
    }

    .warehouse-card:hover {
      transform: translateY(-4px);
    }

    .order-card {
      animation: slideUp 0.6s ease-out;
      transition: all 0.3s ease;
    }

    .order-card:hover {
      transform: translateY(-4px);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: bold;
      font-size: 0.75rem;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    input, select {
      font-size: 16px; /* Prevents iOS zoom */
    }

    @media (max-width: 768px) {
      .order-card {
        padding: 1rem;
      }
    }
  `]
})
export class FulfillmentSystemComponent implements OnInit {
  selectedStatus = 'All';
  mobileMenuOpen = false;
  lastUpdate = 'Just now';

  statusOptions: Array<'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'returned'> = 
    ['pending', 'processing', 'packed', 'shipped', 'delivered', 'returned'];

  fulfillmentMetrics$ = new BehaviorSubject([
    { label: 'Pending Orders', icon: '⏳', count: 234, color: 'yellow-400', percentage: 100 },
    { label: 'Processing', icon: '⚙️', count: 156, color: 'blue-400', percentage: 67 },
    { label: 'Shipped', icon: '🚚', count: 89, color: 'green-400', percentage: 38 },
    { label: 'Delivered', icon: '✅', count: 2104, color: 'purple-400', percentage: 90 }
  ]);

  fulfillmentStatuses$ = new BehaviorSubject<FulfillmentStatus[]>([
    { label: 'All', icon: '📦', color: 'white', count: 2583, percentage: 100 },
    { label: 'Pending', icon: '⏳', color: 'yellow', count: 234, percentage: 9 },
    { label: 'Processing', icon: '⚙️', color: 'blue', count: 156, percentage: 6 },
    { label: 'Packed', icon: '📦', color: 'purple', count: 89, percentage: 3 },
    { label: 'Shipped', icon: '🚚', color: 'green', count: 150, percentage: 6 },
    { label: 'Delivered', icon: '✅', color: 'green', count: 1954, percentage: 76 }
  ]);

  warehouses$ = new BehaviorSubject<WarehouseLocation[]>([
    { id: '1', name: 'Cairo Hub', city: 'Cairo', capacity: 5000, utilization: 78, activeOrders: 450 },
    { id: '2', name: 'Alexandria Port', city: 'Alexandria', capacity: 3000, utilization: 65, activeOrders: 280 },
    { id: '3', name: 'Giza Center', city: 'Giza', capacity: 4000, utilization: 82, activeOrders: 380 },
    { id: '4', name: 'Suez Node', city: 'Suez', capacity: 2000, utilization: 45, activeOrders: 120 }
  ]);

  orders$ = new BehaviorSubject<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-00156',
      vendor: 'TechVendor Pro',
      customer: 'Ahmed Hassan',
      items: 3,
      status: 'pending',
      total: 450,
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-00157',
      vendor: 'Fashion Hub',
      customer: 'Fatima Mohamed',
      items: 2,
      status: 'packed',
      total: 320,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      carrier: 'FedEx',
      trackingNumber: 'FX123456789'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-00158',
      vendor: 'Home Essentials',
      customer: 'Omar Khalil',
      items: 5,
      status: 'shipped',
      total: 580,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      carrier: 'UPS',
      trackingNumber: 'UP987654321'
    }
  ]);

  filteredOrders$ = new BehaviorSubject<Order[]>([]);
  selectedOrder$ = new BehaviorSubject<Order | null>(null);

  ngOnInit(): void {
    this.updateFilteredOrders();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.updateFilteredOrders();
  }

  updateFilteredOrders(): void {
    const allOrders = this.orders$.value;
    const filtered = this.selectedStatus === 'All'
      ? allOrders
      : allOrders.filter(o => this.getStatusLabel(o.status).toLowerCase() === this.selectedStatus.toLowerCase());
    this.filteredOrders$.next(filtered);
  }

  selectOrder(order: Order): void {
    this.selectedOrder$.next(order);
  }

  updateOrderStatus(order: Order): void {
    this.selectOrder(order);
  }

  updateStatus(status: string): void {
    const order = this.selectedOrder$.value;
    if (order) {
      order.status = status as any;
      this.updateFilteredOrders();
    }
  }

  confirmUpdate(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.selectedOrder$.next(null);
  }

  selectWarehouse(warehouse: WarehouseLocation): void {
    console.log('Selected warehouse:', warehouse);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'bg-yellow-400/20 text-yellow-400',
      processing: 'bg-blue-400/20 text-blue-400',
      packed: 'bg-purple-400/20 text-purple-400',
      shipped: 'bg-green-400/20 text-green-400',
      delivered: 'bg-green-600/20 text-green-300',
      returned: 'bg-red-400/20 text-red-400'
    };
    return classes[status] || 'bg-white/20 text-white';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: '⏳ Pending',
      processing: '⚙️ Processing',
      packed: '📦 Packed',
      shipped: '🚚 Shipped',
      delivered: '✅ Delivered',
      returned: '↩️ Returned'
    };
    return labels[status] || status;
  }

  getCapacityColor(utilization: number): string {
    if (utilization < 50) return 'rgb(34, 197, 94)';
    if (utilization < 80) return 'rgb(251, 191, 36)';
    return 'rgb(239, 68, 68)';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
