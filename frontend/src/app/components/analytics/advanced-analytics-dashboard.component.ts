import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, interval, BehaviorSubject } from 'rxjs';
import { takeUntil, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  unit?: string;
}

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  rating: number;
}

interface SourceMetric {
  source: string;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-analytics-dashboard',
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
              📊 Analytics Dashboard
            </h1>
            <button (click)="toggleMobileMenu()" class="lg:hidden p-2 hover:bg-white/10 rounded-lg">
              ☰
            </button>
          </div>

          <!-- Date Range Selector (Mobile Optimized) -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button *ngFor="let range of dateRanges"
                    (click)="selectDateRange(range)"
                    [class.active]="selectedRange === range"
                    class="px-3 py-2 rounded text-sm font-bold transition"
                    [ngClass]="selectedRange === range 
                      ? 'bg-gradient-pharaonic text-black' 
                      : 'bg-white/10 hover:bg-white/20'">
              {{ range }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-4 lg:p-8">
        <!-- Key Metrics Grid (Mobile First) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div *ngFor="let metric of keyMetrics" 
               class="metric-card p-4 rounded-lg bg-slate-900/50 backdrop-blur border border-white/10 hover:border-white/30 transition"
               [@fadeIn]>
            
            <div class="flex items-start justify-between mb-3">
              <div class="text-3xl">{{ metric.icon }}</div>
              <div class="trend" [ngClass]="'trend-' + metric.trend">
                {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
              </div>
            </div>

            <p class="text-xs lg:text-sm text-white/60 font-bold uppercase mb-2">{{ metric.label }}</p>
            <p class="text-lg lg:text-3xl font-black mb-1">
              {{ metric.value | number }}{{ metric.unit || '' }}
            </p>
            <div class="h-1 bg-white/10 rounded overflow-hidden">
              <div class="h-full transition-all" [style.width.%]="metric.value % 100" [style.backgroundColor]="metric.color"></div>
            </div>
          </div>
        </div>

        <!-- Charts Section (Responsive Stacking) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Sales Chart -->
          <div class="lg:col-span-2 bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10">
            <h2 class="text-xl lg:text-2xl font-black mb-6 flex items-center gap-2">
              <span>📈</span> Sales Trend
            </h2>
            <div class="h-64 lg:h-80 overflow-x-auto">
              <div class="chart-placeholder bg-gradient-to-b from-white/5 to-transparent rounded p-4">
                <svg viewBox="0 0 400 200" class="w-full h-full">
                  <!-- Chart Grid -->
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="200" fill="url(#grid)" />
                  
                  <!-- Sample Line Chart -->
                  <polyline points="20,150 60,100 100,120 140,80 180,90 220,50 260,60 300,30 340,40 380,20" 
                            fill="none" stroke="url(#grad)" stroke-width="2"/>
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:rgb(251,191,36);stop-opacity:1" />
                      <stop offset="100%" style="stop-color:rgb(251,191,36);stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div class="mt-4 text-xs lg:text-sm text-white/60 text-center">
              Swipe to view more data →
            </div>
          </div>

          <!-- Revenue Breakdown -->
          <div class="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-white/10">
            <h2 class="text-xl lg:text-2xl font-black mb-6">Revenue Breakdown</h2>
            <div class="space-y-4">
              <div *ngFor="let source of revenueSources" class="source-item">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold">{{ source.source }}</span>
                  <span class="text-xs font-bold text-white/60">{{ source.percentage }}%</span>
                </div>
                <div class="h-2 bg-white/10 rounded overflow-hidden">
                  <div class="h-full transition-all" 
                       [style.width.%]="source.percentage"
                       [style.backgroundColor]="source.color"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products Grid (Mobile Responsive) -->
        <div class="mb-8">
          <h2 class="text-xl lg:text-2xl font-black mb-4 flex items-center gap-2">
            <span>⭐</span> Top Performing Products
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let product of topProducts; let i = index" 
                 (click)="viewProductDetails(product)"
                 class="product-card bg-slate-900/50 backdrop-blur rounded-lg p-4 border border-white/10 hover:border-white/30 cursor-pointer transition"
                 [@staggeredFadeIn]="i">
              
              <div class="flex items-start justify-between mb-3">
                <div class="rank text-2xl font-black text-yellow-400">#{{ i + 1 }}</div>
                <div class="rating text-yellow-400 font-bold">⭐ {{ product.rating }}</div>
              </div>

              <h3 class="font-bold text-sm lg:text-base mb-3 line-clamp-2">{{ product.name }}</h3>

              <div class="grid grid-cols-2 gap-3 text-xs lg:text-sm">
                <div class="stat bg-white/5 rounded p-2">
                  <p class="text-white/60 text-xs mb-1">Sales</p>
                  <p class="font-black text-green-400">{{ product.sales }}</p>
                </div>
                <div class="stat bg-white/5 rounded p-2">
                  <p class="text-white/60 text-xs mb-1">Revenue</p>
                  <p class="font-black text-blue-400">{{ product.revenue | number }}K</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters & Export Section (Mobile Optimized) -->
        <div class="bg-slate-900/50 backdrop-blur rounded-lg p-4 lg:p-6 border border-white/10">
          <h2 class="text-lg lg:text-xl font-black mb-4">Filters & Actions</h2>

          <form [formGroup]="filterForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Category Filter -->
              <div>
                <label class="text-xs font-bold text-white/60 uppercase mb-2 block">Category</label>
                <select formControlName="category" class="w-full px-3 py-2 bg-white/10 rounded border border-white/20 text-white focus:border-white/40">
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>

              <!-- Vendor Filter -->
              <div>
                <label class="text-xs font-bold text-white/60 uppercase mb-2 block">Vendor</label>
                <select formControlName="vendor" class="w-full px-3 py-2 bg-white/10 rounded border border-white/20 text-white focus:border-white/40">
                  <option value="">All Vendors</option>
                  <option value="vendor1">Vendor 1</option>
                  <option value="vendor2">Vendor 2</option>
                </select>
              </div>

              <!-- Min Revenue -->
              <div>
                <label class="text-xs font-bold text-white/60 uppercase mb-2 block">Min Revenue</label>
                <input type="number" formControlName="minRevenue" class="w-full px-3 py-2 bg-white/10 rounded border border-white/20 text-white" placeholder="0">
              </div>

              <!-- Min Rating -->
              <div>
                <label class="text-xs font-bold text-white/60 uppercase mb-2 block">Min Rating</label>
                <input type="number" formControlName="minRating" step="0.1" min="0" max="5" class="w-full px-3 py-2 bg-white/10 rounded border border-white/20 text-white" placeholder="0">
              </div>
            </div>

            <!-- Export Buttons (Mobile Stack) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <button (click)="exportData('csv')" class="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 font-bold rounded transition text-sm">
                📥 CSV
              </button>
              <button (click)="exportData('pdf')" class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded transition text-sm">
                📄 PDF
              </button>
              <button (click)="exportData('json')" class="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold rounded transition text-sm">
                📋 JSON
              </button>
              <button (click)="refreshData()" class="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 font-bold rounded transition text-sm">
                🔄 Refresh
              </button>
            </div>
          </form>
        </div>

        <!-- Real-time Update Indicator (Mobile Bottom) -->
        <div class="fixed bottom-4 left-4 right-4 lg:static lg:mt-6 lg:bottom-auto lg:left-auto lg:right-auto bg-blue-600/20 border border-blue-400/50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span class="text-xs lg:text-sm font-bold">Live Update</span>
          </div>
          <span class="text-xs text-white/60">{{ lastUpdateTime }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --metric-color-up: rgb(34, 197, 94);
      --metric-color-down: rgb(239, 68, 68);
      --metric-color-stable: rgb(59, 130, 246);
    }

    .metric-card {
      animation: slideUp 0.6s ease-out;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .trend {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: bold;
      font-size: 0.75rem;
    }

    .trend-up {
      background: rgba(34, 197, 94, 0.2);
      color: rgb(34, 197, 94);
    }

    .trend-down {
      background: rgba(239, 68, 68, 0.2);
      color: rgb(239, 68, 68);
    }

    .trend-stable {
      background: rgba(59, 130, 246, 0.2);
      color: rgb(59, 130, 246);
    }

    .chart-placeholder {
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
    }

    .source-item {
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .source-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .product-card {
      animation: slideUp 0.6s ease-out;
      animation-fill-mode: both;
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

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Mobile Optimizations */
    @media (max-width: 768px) {
      :host ::ng-deep {
        --safe-area: env(safe-area-inset-bottom, 0);
        padding-bottom: var(--safe-area);
      }

      .metric-card {
        padding: 1rem;
      }

      input, select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private formBuilder = inject(FormBuilder);

  filterForm: FormGroup;
  selectedRange = '7D';
  dateRanges = ['7D', '30D', '90D', 'YTD', 'All'];
  mobileMenuOpen = false;
  lastUpdateTime = 'Just now';

  keyMetrics: AnalyticsMetric[] = [
    { label: 'Total Sales', value: 12540, change: 12.5, trend: 'up', icon: '📊', color: 'rgb(34, 197, 94)', unit: 'K' },
    { label: 'Revenue', value: 8750, change: 8.2, trend: 'up', icon: '💰', color: 'rgb(59, 130, 246)', unit: 'K' },
    { label: 'Orders', value: 2340, change: -2.1, trend: 'down', icon: '📦', color: 'rgb(251, 191, 36)' },
    { label: 'Customers', value: 845, change: 5.3, trend: 'up', icon: '👥', color: 'rgb(168, 85, 247)' }
  ];

  revenueSources: SourceMetric[] = [
    { source: 'Online Sales', value: 65, percentage: 65, color: 'rgb(34, 197, 94)' },
    { source: 'Vendors', value: 25, percentage: 25, color: 'rgb(59, 130, 246)' },
    { source: 'Affiliates', value: 10, percentage: 10, color: 'rgb(251, 191, 36)' }
  ];

  topProducts: TopProduct[] = [
    { id: '1', name: 'Premium Wireless Headphones Ultra Pro Max', sales: 1250, revenue: 125, rating: 4.8 },
    { id: '2', name: 'Smart Watch Series 5', sales: 890, revenue: 89, rating: 4.6 },
    { id: '3', name: 'Laptop Stand Aluminum', sales: 756, revenue: 37, rating: 4.9 }
  ];

  constructor() {
    this.filterForm = this.formBuilder.group({
      category: [''],
      vendor: [''],
      minRevenue: [0],
      minRating: [0]
    });
  }

  ngOnInit(): void {
    this.setupRealtimeUpdates();
    this.setupFilterListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupRealtimeUpdates(): void {
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.simulateDataUpdate())
      )
      .subscribe(() => {
        this.updateLastUpdateTime();
      });
  }

  setupFilterListener(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        this.applyFilters(filters);
      });
  }

  simulateDataUpdate() {
    return new Promise(resolve => setTimeout(() => resolve(null), 100));
  }

  updateLastUpdateTime(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.lastUpdateTime = `${hours}:${minutes}`;
  }

  selectDateRange(range: string): void {
    this.selectedRange = range;
    this.refreshData();
  }

  applyFilters(filters: any): void {
    console.log('Applying filters:', filters);
    // Filter logic here
  }

  exportData(format: string): void {
    let content = '';
    let filename = `analytics-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      content = this.generateCSV();
      filename += '.csv';
    } else if (format === 'pdf') {
      this.generatePDF();
      return;
    } else if (format === 'json') {
      content = JSON.stringify({
        metrics: this.keyMetrics,
        products: this.topProducts,
        sources: this.revenueSources
      }, null, 2);
      filename += '.json';
    }

    this.downloadFile(content, filename);
  }

  generateCSV(): string {
    let csv = 'Metric,Value,Change,Trend\n';
    this.keyMetrics.forEach(m => {
      csv += `"${m.label}","${m.value}","${m.change}%","${m.trend}"\n`;
    });
    csv += '\nTop Products,Sales,Revenue,Rating\n';
    this.topProducts.forEach(p => {
      csv += `"${p.name}","${p.sales}","${p.revenue}","${p.rating}"\n`;
    });
    return csv;
  }

  generatePDF(): void {
    console.log('PDF export would use a library like jsPDF');
    // Implementation with jsPDF library
  }

  downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  viewProductDetails(product: TopProduct): void {
    console.log('View details for:', product);
    // Navigate to product details
  }

  refreshData(): void {
    console.log('Refreshing analytics data...');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
