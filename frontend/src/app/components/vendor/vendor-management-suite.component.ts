import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

interface Vendor {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
  commission: number;
  totalEarnings: number;
  products: number;
  joinDate: Date;
  avatar?: string;
}

interface VendorPermission {
  category: string;
  actions: string[];
  granted: boolean;
}

interface CommissionTier {
  name: string;
  minSales: number;
  commission: number;
  icon: string;
  features: string[];
}

@Component({
  selector: 'app-vendor-management-suite',
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
              🏪 Vendor Management
            </h1>
            <button (click)="toggleMobileMenu()" class="lg:hidden p-2 hover:bg-white/10 rounded-lg">
              ☰
            </button>
          </div>

          <!-- Tab Navigation (Mobile Horizontal Scroll) -->
          <div class="flex overflow-x-auto gap-2 pb-2">
            <button *ngFor="let tab of tabs"
                    (click)="activeTab = tab"
                    [ngClass]="activeTab === tab ? 'active' : ''"
                    class="px-4 py-2 rounded font-bold whitespace-nowrap text-sm transition"
                    [class.bg-gradient-pharaonic]="activeTab === tab"
                    [class.text-black]="activeTab === tab"
                    [class.bg-white/10]="activeTab !== tab"
                    [class.hover-white/20]="activeTab !== tab">
              {{ tab }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 lg:p-8">
        <!-- Tab 1: Vendor Directory -->
        <div *ngIf="activeTab === 'Directory'" [@fadeIn]>
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <!-- Search & Filters (Mobile Stack) -->
            <div class="lg:col-span-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Search vendors..." 
                       class="px-4 py-2 bg-white/10 rounded border border-white/20 focus:border-white/40 text-white placeholder-white/50">
                
                <select class="px-4 py-2 bg-white/10 rounded border border-white/20 focus:border-white/40 text-white">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>

                <select class="px-4 py-2 bg-white/10 rounded border border-white/20 focus:border-white/40 text-white">
                  <option>Sort By</option>
                  <option>Rating</option>
                  <option>Earnings</option>
                  <option>Products</option>
                  <option>Newest</option>
                </select>

                <button class="px-4 py-2 bg-gradient-pharaonic text-black font-black rounded hover:shadow-lg transition">
                  🔍 Search
                </button>
              </div>
            </div>

            <!-- Vendor Cards Grid (Mobile Responsive) -->
            <div class="lg:col-span-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let vendor of vendors$ | async" [@slideUp]
                     class="vendor-card bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10 hover:border-white/30 hover:shadow-lg transition cursor-pointer"
                     (click)="selectVendor(vendor)">
                  
                  <!-- Vendor Header -->
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-gradient-pharaonic flex items-center justify-center text-xl text-black font-black">
                        {{ vendor.name.charAt(0) }}
                      </div>
                      <div>
                        <h3 class="font-black text-sm lg:text-base">{{ vendor.name }}</h3>
                        <p class="text-xs text-white/60">{{ vendor.email }}</p>
                      </div>
                    </div>
                    <div class="px-3 py-1 rounded-full text-xs font-bold"
                         [ngClass]="getStatusClass(vendor.status)">
                      {{ vendor.status | titlecase }}
                    </div>
                  </div>

                  <!-- Vendor Stats Grid -->
                  <div class="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/5 rounded">
                    <div class="text-center">
                      <p class="text-xs text-white/60 mb-1">Rating</p>
                      <p class="font-black">⭐ {{ vendor.rating }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-xs text-white/60 mb-1">Products</p>
                      <p class="font-black text-blue-400">{{ vendor.products }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-xs text-white/60 mb-1">Commission</p>
                      <p class="font-black text-green-400">{{ vendor.commission }}%</p>
                    </div>
                  </div>

                  <!-- Earnings Info -->
                  <div class="mb-4 pb-4 border-b border-white/10">
                    <p class="text-xs text-white/60 mb-1">Total Earnings</p>
                    <p class="text-2xl font-black text-yellow-400">{{ vendor.totalEarnings | number }}K</p>
                  </div>

                  <!-- Actions -->
                  <div class="grid grid-cols-2 gap-2">
                    <button (click)="viewVendorDetails(vendor); $event.stopPropagation()"
                            class="px-3 py-2 text-xs lg:text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold rounded transition">
                      👁️ View
                    </button>
                    <button (click)="editVendor(vendor); $event.stopPropagation()"
                            class="px-3 py-2 text-xs lg:text-sm bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 font-bold rounded transition">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Commission Management -->
        <div *ngIf="activeTab === 'Commissions'" [@fadeIn]>
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div *ngFor="let tier of commissionTiers"
                 class="commission-card bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10 hover:border-white/30 transition">
              
              <div class="text-4xl mb-3">{{ tier.icon }}</div>
              <h3 class="text-lg lg:text-xl font-black mb-2">{{ tier.name }}</h3>
              <p class="text-sm text-white/60 mb-3">Starting at {{ tier.minSales | number }}K sales</p>
              
              <div class="bg-gradient-pharaonic text-black rounded p-3 mb-4 text-center">
                <p class="text-xs font-bold uppercase mb-1">Commission Rate</p>
                <p class="text-3xl font-black">{{ tier.commission }}%</p>
              </div>

              <div class="space-y-2 text-xs">
                <div *ngFor="let feature of tier.features" class="flex items-start gap-2">
                  <span class="text-green-400 mt-1">✓</span>
                  <span class="text-white/80">{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Commission Rules -->
          <div class="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10">
            <h2 class="text-xl lg:text-2xl font-black mb-4">Commission Rules & Conditions</h2>
            <div class="space-y-4">
              <div class="rule-item p-4 bg-white/5 rounded border-l-4 border-yellow-400">
                <h3 class="font-bold mb-2">🔄 Processing Time</h3>
                <p class="text-sm text-white/70">Commissions are calculated weekly and paid on the 1st and 15th of each month</p>
              </div>
              <div class="rule-item p-4 bg-white/5 rounded border-l-4 border-blue-400">
                <h3 class="font-bold mb-2">📊 Minimum Payout</h3>
                <p class="text-sm text-white/70">Minimum 500 EGP threshold required for payout</p>
              </div>
              <div class="rule-item p-4 bg-white/5 rounded border-l-4 border-green-400">
                <h3 class="font-bold mb-2">🛡️ Dispute Resolution</h3>
                <p class="text-sm text-white/70">Any disputes must be filed within 30 days of commission calculation</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Permissions & Roles -->
        <div *ngIf="activeTab === 'Permissions'" [@fadeIn]>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Selected Vendor Permissions -->
            <div class="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10" *ngIf="selectedVendor$ | async as vendor">
              <h2 class="text-xl lg:text-2xl font-black mb-6">{{ vendor.name }} Permissions</h2>
              
              <div class="space-y-6">
                <div *ngFor="let perm of vendorPermissions">
                  <h3 class="font-bold mb-3 flex items-center gap-2">
                    <input type="checkbox" [checked]="perm.granted" class="w-4 h-4 cursor-pointer">
                    {{ perm.category }}
                  </h3>
                  
                  <div class="ms-6 space-y-2">
                    <div *ngFor="let action of perm.actions" class="flex items-center gap-3">
                      <input type="checkbox" [checked]="perm.granted" class="w-4 h-4 cursor-pointer" disabled>
                      <span class="text-sm text-white/80">{{ action }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button class="w-full mt-6 px-6 py-3 bg-gradient-pharaonic text-black font-black rounded hover:shadow-lg transition">
                💾 Save Permissions
              </button>
            </div>

            <!-- Permission Templates -->
            <div class="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10">
              <h2 class="text-xl lg:text-2xl font-black mb-6">Role Templates</h2>
              
              <div class="space-y-3">
                <button *ngFor="let role of roleTemplates"
                        (click)="applyRoleTemplate(role)"
                        class="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded border border-white/10 hover:border-white/30 transition group">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-bold text-sm lg:text-base group-hover:text-yellow-400 transition">{{ role.name }}</h3>
                      <p class="text-xs text-white/60 mt-1">{{ role.description }}</p>
                    </div>
                    <span class="text-xl">{{ role.icon }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: Performance Metrics -->
        <div *ngIf="activeTab === 'Performance'" [@fadeIn]>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="metric-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10">
              <p class="text-xs text-white/60 font-bold uppercase mb-2">Avg Rating</p>
              <p class="text-3xl lg:text-4xl font-black text-yellow-400 mb-2">4.7</p>
              <div class="h-1 bg-white/10 rounded overflow-hidden">
                <div class="h-full w-94 bg-yellow-400"></div>
              </div>
            </div>

            <div class="metric-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10">
              <p class="text-xs text-white/60 font-bold uppercase mb-2">Delivery Rate</p>
              <p class="text-3xl lg:text-4xl font-black text-green-400 mb-2">98.5%</p>
              <div class="h-1 bg-white/10 rounded overflow-hidden">
                <div class="h-full w-98 bg-green-400"></div>
              </div>
            </div>

            <div class="metric-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10">
              <p class="text-xs text-white/60 font-bold uppercase mb-2">Response Time</p>
              <p class="text-3xl lg:text-4xl font-black text-blue-400 mb-2">2h</p>
              <p class="text-xs text-white/60 mt-2">Average response</p>
            </div>

            <div class="metric-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10">
              <p class="text-xs text-white/60 font-bold uppercase mb-2">Return Rate</p>
              <p class="text-3xl lg:text-4xl font-black text-orange-400 mb-2">2.1%</p>
              <p class="text-xs text-white/60 mt-2">Below average</p>
            </div>
          </div>

          <!-- Vendor Comparison Table (Mobile Scroll) -->
          <div class="bg-slate-900/50 backdrop-blur rounded-lg border border-white/10 overflow-x-auto">
            <table class="w-full text-sm lg:text-base">
              <thead class="border-b border-white/10">
                <tr>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Vendor</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Rating</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">On-Time</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Response</th>
                  <th class="px-4 py-3 text-left font-black text-yellow-400">Returns</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let vendor of vendors$ | async" class="border-b border-white/10 hover:bg-white/5 transition">
                  <td class="px-4 py-3 font-bold">{{ vendor.name }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-bold">
                      ⭐ {{ vendor.rating }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-green-400 font-bold">{{ 96 + Math.floor(Math.random() * 4) }}%</td>
                  <td class="px-4 py-3">{{ Math.floor(Math.random() * 4) + 1 }}h</td>
                  <td class="px-4 py-3 text-orange-400">{{ Math.floor(Math.random() * 4) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .vendor-card {
      animation: slideUp 0.6s ease-out;
      transition: all 0.3s ease;
    }

    .vendor-card:hover {
      transform: translateY(-4px);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 2rem;
      font-weight: bold;
      font-size: 0.75rem;
    }

    .tab-active {
      background: linear-gradient(135deg, rgb(251, 191, 36), rgb(217, 119, 6));
      color: black;
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

    @media (max-width: 768px) {
      input, select {
        font-size: 16px;
      }

      .vendor-card {
        padding: 1rem;
      }
    }
  `]
})
export class VendorManagementSuiteComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  activeTab = 'Directory';
  tabs = ['Directory', 'Commissions', 'Permissions', 'Performance'];
  mobileMenuOpen = false;

  vendors$ = new BehaviorSubject<Vendor[]>([
    {
      id: '1',
      name: 'TechVendor Pro',
      email: 'contact@techvendor.com',
      status: 'active',
      rating: 4.8,
      commission: 12,
      totalEarnings: 125000,
      products: 450,
      joinDate: new Date('2023-01-15')
    },
    {
      id: '2',
      name: 'Fashion Hub',
      email: 'info@fashionhub.com',
      status: 'active',
      rating: 4.6,
      commission: 15,
      totalEarnings: 95000,
      products: 320,
      joinDate: new Date('2023-03-20')
    },
    {
      id: '3',
      name: 'Home Essentials',
      email: 'sales@homeessentials.com',
      status: 'pending',
      rating: 4.5,
      commission: 10,
      totalEarnings: 45000,
      products: 180,
      joinDate: new Date('2024-01-10')
    }
  ]);

  selectedVendor$ = new BehaviorSubject<Vendor | null>(null);

  commissionTiers: CommissionTier[] = [
    {
      name: 'Bronze',
      minSales: 0,
      commission: 10,
      icon: '🥉',
      features: ['Standard support', 'Weekly payouts', 'Basic analytics']
    },
    {
      name: 'Silver',
      minSales: 50,
      commission: 12,
      icon: '🥈',
      features: ['Priority support', 'Bi-weekly payouts', 'Advanced analytics']
    },
    {
      name: 'Gold',
      minSales: 200,
      commission: 15,
      icon: '🥇',
      features: ['24/7 support', 'Weekly payouts', 'Custom analytics']
    },
    {
      name: 'Platinum',
      minSales: 500,
      commission: 18,
      icon: '💎',
      features: ['Dedicated manager', 'Daily payouts', 'Real-time analytics']
    }
  ];

  vendorPermissions: VendorPermission[] = [
    {
      category: 'Products',
      actions: ['Add Products', 'Edit Products', 'Delete Products', 'Bulk Upload'],
      granted: true
    },
    {
      category: 'Orders',
      actions: ['View Orders', 'Update Status', 'Cancel Orders', 'View Analytics'],
      granted: true
    },
    {
      category: 'Payments',
      actions: ['View Earnings', 'Request Payout', 'View Transactions'],
      granted: true
    },
    {
      category: 'Support',
      actions: ['Create Tickets', 'Chat with Support', 'View FAQs'],
      granted: true
    }
  ];

  roleTemplates = [
    {
      name: 'Basic Seller',
      description: 'Limited product management',
      icon: '👤',
      permissions: ['Products.Add', 'Orders.View', 'Payments.View']
    },
    {
      name: 'Premium Seller',
      description: 'Full access with analytics',
      icon: '⭐',
      permissions: ['*']
    },
    {
      name: 'Suspended',
      description: 'No access, pending review',
      icon: '🔒',
      permissions: []
    }
  ];

  ngOnInit(): void {
    // Initialize
  }

  selectVendor(vendor: Vendor): void {
    this.selectedVendor$.next(vendor);
  }

  viewVendorDetails(vendor: Vendor): void {
    console.log('View details:', vendor);
  }

  editVendor(vendor: Vendor): void {
    console.log('Edit vendor:', vendor);
  }

  applyRoleTemplate(template: any): void {
    console.log('Apply template:', template);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      active: 'bg-green-400/20 text-green-400',
      pending: 'bg-yellow-400/20 text-yellow-400',
      suspended: 'bg-red-400/20 text-red-400'
    };
    return classes[status] || 'bg-white/20 text-white';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  Math = Math;
}
