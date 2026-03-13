import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { AnalyticsService } from '../../services/analytics.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-900 text-white flex-shrink-0">
        <div class="p-6">
          <h2 class="text-xl font-black italic">ALEX CHANCE</h2>
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 text-center">Vendor Portal</p>
        </div>
        <nav class="mt-6 px-4">
          <button (click)="currentView = 'offers'" [class.bg-blue-600]="currentView === 'offers'" [class.text-white]="currentView === 'offers'" class="w-full text-left py-3 px-4 rounded-xl font-bold mb-2 text-gray-400 hover:text-white transition-all">My Offers</button>
          <button (click)="currentView = 'analytics'" [class.bg-blue-600]="currentView === 'analytics'" [class.text-white]="currentView === 'analytics'" class="w-full text-left py-3 px-4 rounded-xl font-bold mb-2 text-gray-400 hover:text-white transition-all">Analytics</button>
          <button (click)="currentView = 'subscription'" [class.bg-blue-600]="currentView === 'subscription'" [class.text-white]="currentView === 'subscription'" class="w-full text-left py-3 px-4 rounded-xl font-bold mb-2 text-gray-400 hover:text-white transition-all">Subscription</button>
          <button class="w-full text-left py-3 px-4 text-gray-400 hover:text-white mb-2">Settings</button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-grow p-10">
        <div *ngIf="currentView === 'offers'">
          <div class="flex justify-between items-center mb-12">
            <h1 class="text-3xl font-black text-gray-900">Manage Your Deals</h1>
            <button (click)="openAddModal()" 
                    class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
              + New Clearance Offer
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let item of products" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                  <img [src]="item.images[0] || 'https://via.placeholder.com/100'" class="w-full h-full object-cover">
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-lg line-clamp-1">{{ item.name }}</h3>
                  <span class="text-xs font-bold text-blue-600 uppercase">{{ item.category }}</span>
                </div>
              </div>
              
              <div class="flex justify-between items-end">
                <div>
                  <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Stock Left</p>
                  <p class="text-xl font-black text-blue-800">{{ item.stockCount }} <span class="text-xs">units</span></p>
                </div>
                <!-- Premium Promotion Badge -->
                <div class="absolute top-2 right-2 flex gap-1">
                   <span *ngIf="item.isFeatured" class="bg-orange-600 text-white text-[8px] font-black p-1 px-2 rounded uppercase tracking-tighter shadow-sm animate-pulse">Boosting</span>
                   <button *ngIf="!item.isFeatured" (click)="$event.stopPropagation(); promoteProduct(item._id)" class="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[8px] font-black p-1 px-2 rounded uppercase tracking-tighter">Promote</button>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Clearance Price</p>
                  <p class="text-xl font-black text-orange-600">{{ item.discountPrice }} <span class="text-xs">EGP</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="products.length === 0" class="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
             <p class="text-gray-400 font-medium text-xl">No active clearance offers yet.</p>
          </div>
        </div>

        <!-- Subscription View -->
        <div *ngIf="currentView === 'subscription'">
            <h1 class="text-3xl font-black text-gray-900 mb-6">Vendor Growth Plan</h1>
            <p class="text-gray-500 mb-12 font-medium">Clearance made easy. Boost your sales with a pro plan.</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Free Plan -->
                <div class="bg-white p-8 rounded-[40px] border-2 border-gray-100 flex flex-col items-center text-center">
                    <span class="text-[10px] font-black uppercase text-gray-400 mb-2">Basic</span>
                    <h2 class="text-2xl font-black mb-4">Start Small</h2>
                    <p class="text-3xl font-black mb-8 text-blue-900">0 EGP <span class="text-xs text-gray-400">/mo</span></p>
                    <ul class="text-xs font-bold text-gray-500 space-y-3 mb-10 flex-grow text-left w-full">
                        <li>✅ Post up to 10 offers</li>
                        <li>✅ Basic analytics</li>
                        <li>❌ No ad boost</li>
                        <li>❌ Hidden from homepage top</li>
                    </ul>
                    <button disabled class="w-full bg-gray-100 py-4 rounded-2xl font-black text-gray-400">Current Plan</button>
                </div>

                <!-- Pro Plan -->
                <div class="bg-blue-900 p-10 rounded-[40px] border-4 border-blue-400 flex flex-col items-center text-center transform scale-105 shadow-2xl relative">
                    <div class="absolute -top-4 bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Most Popular</div>
                    <span class="text-[10px] font-black uppercase text-blue-300 mb-2">Premium</span>
                    <h2 class="text-2xl font-black mb-4 text-white">Market Dominator</h2>
                    <p class="text-3xl font-black mb-8 text-white">299 EGP <span class="text-xs text-blue-400">/mo</span></p>
                    <ul class="text-xs font-bold text-blue-100 space-y-3 mb-10 flex-grow text-left w-full">
                        <li>✅ Unlimited deal postings</li>
                        <li>✅ Advanced sales analytics</li>
                        <li>✅ Boost up to 5 deals/month</li>
                        <li>✅ Priority in search results</li>
                    </ul>
                    <button (click)="upgradeToPro('pro')" class="w-full bg-orange-500 hover:bg-orange-600 py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 italic uppercase tracking-widest">Upgrade to PRO</button>
                </div>
                
                <!-- Enterprise Plan -->
                <div class="bg-white p-8 rounded-[40px] border-2 border-gray-100 flex flex-col items-center text-center">
                    <span class="text-[10px] font-black uppercase text-gray-400 mb-2">PRO+</span>
                    <h2 class="text-2xl font-black mb-4 text-gray-900">Chain Master</h2>
                    <p class="text-3xl font-black mb-4 text-blue-900">Contact Us</p>
                    <p class="text-[10px] font-bold text-gray-400 mb-8 uppercase italic leading-tight">For multiple branch liquidation in Alexandria</p>
                    <ul class="text-xs font-bold text-gray-500 space-y-3 mb-10 flex-grow text-left w-full">
                        <li>✅ Multi-branch management</li>
                        <li>✅ Custom API integrations</li>
                        <li>✅ Dedicated account manager</li>
                    </ul>
                    <button class="w-full border-2 border-blue-800 text-blue-800 py-4 rounded-2xl font-black hover:bg-blue-50 transition-colors uppercase text-xs tracking-widest leading-none">Book a Call</button>
                </div>
            </div>
        </div>

        <!-- Analytics View -->
        <div *ngIf="currentView === 'analytics'">
          <h1 class="text-3xl font-black text-gray-900 mb-12">Performance Analytics</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
             <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p class="text-xs font-black text-gray-400 uppercase mb-2">Total Revenue (Clearance)</p>
                <p class="text-4xl font-black text-blue-800">{{ analytics?.totalSales || 0 }} <span class="text-lg">EGP</span></p>
                <div class="mt-4 text-xs font-bold text-green-500">↑ 12% from last month</div>
             </div>
             <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p class="text-xs font-black text-gray-400 uppercase mb-2">Inventory Turned over</p>
                <p class="text-4xl font-black text-orange-600">{{ analytics?.orderCount || 0 }} <span class="text-lg">Orders</span></p>
                <div class="mt-4 text-xs font-bold text-gray-500">Based on recent sales</div>
             </div>
             <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p class="text-xs font-black text-gray-400 uppercase mb-2">Customer Visits</p>
                <p class="text-4xl font-black text-gray-900">4,281</p>
                <div class="mt-4 text-xs font-bold text-blue-500">High engagement area</div>
             </div>
          </div>

          <!-- AI Inventory Prediction -->
          <div class="bg-gradient-to-r from-indigo-900 to-purple-900 p-10 rounded-[40px] mb-12 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 p-8 opacity-10">
                <i class="fas fa-robot text-8xl text-white"></i>
             </div>
             <div class="relative z-10">
                <div class="flex items-center gap-4 mb-8">
                   <h3 class="text-2xl font-black text-white italic uppercase tracking-tighter">AI Inventory Forecaster</h3>
                   <span class="bg-purple-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest animate-pulse">Live Prediction</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div *ngFor="let forecast of analytics?.forecasts" 
                        class="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 transition-all hover:bg-white/20">
                      <p class="text-[10px] font-black text-purple-200 uppercase mb-2 truncate">{{ forecast.name }}</p>
                      <div class="flex justify-between items-end mb-4">
                         <span class="text-3xl font-black text-white">{{ forecast.daysRemaining }}</span>
                         <span class="text-[10px] font-bold text-purple-300 mb-1 uppercase">Days Left</span>
                      </div>
                      <div class="flex items-center justify-between">
                         <span class="text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter"
                               [class.bg-red-500]="forecast.riskLevel === 'CRITICAL'"
                               [class.bg-orange-500]="forecast.riskLevel === 'High'"
                               [class.bg-green-500]="forecast.riskLevel === 'Low'"
                               class="text-white">{{ forecast.riskLevel }} RISK</span>
                         <span class="text-[10px] font-bold text-white/50 italic">{{ forecast.velocity }} items/day</span>
                      </div>
                   </div>
                </div>
                
                <div *ngIf="!analytics?.forecasts?.length" class="text-center py-10 text-white/40 font-black italic uppercase tracking-widest">
                   Analyzing sales velocity... data appearing soon.
                </div>
             </div>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <h3 class="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs">Revenue Trend (Last 7 Days)</h3>
             <div class="flex items-end gap-2 h-64 border-b">
                <div *ngFor="let day of (analytics?.chartData || mockChartData)" 
                     class="flex-grow bg-blue-100 relative group"
                     [style.height.%]="(day.revenue / maxRevenue) * 100">
                   <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {{ day.revenue }} EGP
                   </div>
                   <div class="bg-blue-600 h-full w-full rounded-t-lg transition-all hover:bg-blue-700"></div>
                </div>
             </div>
             <div class="flex justify-between mt-4">
                <span *ngFor="let day of (analytics?.chartData || mockChartData)" class="text-[10px] font-black text-gray-400">{{ day.date.slice(-2) }}</span>
             </div>
          </div>

          <!-- Alexandria District Heatmap -->
          <div class="mt-12 bg-gray-900 p-8 rounded-[40px] shadow-2xl border-4 border-gray-800">
             <div class="flex justify-between items-center mb-8">
                <h3 class="font-black text-white uppercase tracking-widest text-xs">Alexandria Market Demand Heatmap</h3>
                <span class="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Real-time Alpha</span>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let loc of heatmap" class="bg-gray-800 p-6 rounded-3xl border border-gray-700 transition-all hover:bg-gray-700">
                   <div class="flex justify-between items-center mb-4">
                      <span class="text-xs font-black text-gray-400 uppercase tracking-tighter">{{ loc.name }}</span>
                      <span class="text-xs font-black" [class.text-green-400]="loc.trend === 'up'" [class.text-blue-400]="loc.trend === 'stable'">{{ loc.trend === 'up' ? '↗' : '→' }}</span>
                   </div>
                   <div class="flex items-center gap-4">
                      <div class="flex-grow bg-gray-900 h-2 rounded-full overflow-hidden">
                         <div [style.width.%]="loc.demandScore" class="bg-blue-500 h-full rounded-full transition-all duration-1000"></div>
                      </div>
                      <span class="text-xl font-black text-white">{{ loc.demandScore }}%</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

      <!-- Simple Add Modal Mockup (Conditional View) -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
          <div class="p-8 border-b">
            <h2 class="text-2xl font-black">Post New Deal</h2>
          </div>
          <div class="p-8">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase mb-2">Product Name</label>
                <input [(ngModel)]="newProduct.name" class="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase mb-2">Category</label>
                <select [(ngModel)]="newProduct.category" class="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500">
                  <option>Fashion</option>
                  <option>Grocery</option>
                  <option>Electronics</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label class="block text-xs font-black text-gray-400 uppercase mb-2">Original Price</label>
                  <input type="number" [(ngModel)]="newProduct.originalPrice" class="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-xs font-black text-gray-400 uppercase mb-2">Deal Price</label>
                  <div class="relative">
                    <input type="number" [(ngModel)]="newProduct.discountPrice" class="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500">
                    <button (click)="getAIPrice()" [disabled]="isAiLoading" class="absolute right-2 top-2 bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg text-xs font-black uppercase transition-colors">
                      {{ isAiLoading ? '...' : 'AI ✨' }}
                    </button>
                  </div>
                </div>
            </div>

            <!-- AI Suggestion Box -->
            <div *ngIf="aiSuggestion" class="mb-6 animate-in slide-in-from-top duration-300">
               <div class="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl flex items-center justify-between">
                  <div class="flex-grow">
                    <p class="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">AI Recommendation (Confidence: {{ aiSuggestion.confidence }})</p>
                    <p class="text-xs text-blue-900 font-medium">Suggesting <span class="font-black">{{ aiSuggestion.suggestedPrice }} EGP</span> based on market avg ({{ aiSuggestion.realMarketAvg }} EGP).</p>
                    <p class="text-[9px] text-blue-400 italic">{{ aiSuggestion.reasoning }}</p>
                  </div>
                  <button (click)="applyAISuggestion()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg transition-transform active:scale-90">Apply</button>
               </div>
            </div>
            
            <div class="flex gap-4">
              <button (click)="isModalOpen = false" class="flex-grow py-4 font-bold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
              <button (click)="saveProduct()" class="flex-grow py-4 font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 shadow-lg transition-colors">Launch Deal</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorDashboardComponent implements OnInit {
  products: any[] = [];
  analytics: any = null;
  heatmap: any[] = [];
  currentView: 'offers' | 'analytics' | 'subscription' = 'offers';
  isModalOpen = false;
  
  mockChartData = [
    { date: '2026-03-07', revenue: 400 },
    { date: '2026-03-08', revenue: 700 },
    { date: '2026-03-09', revenue: 500 },
    { date: '2026-03-10', revenue: 900 },
    { date: '2026-03-11', revenue: 1200 },
    { date: '2026-03-12', revenue: 800 },
    { date: '2026-03-13', revenue: 1100 }
  ];

  get maxRevenue() {
    const data = this.analytics?.chartData || this.mockChartData;
    return Math.max(...data.map((d: any) => d.revenue), 1000);
  }

  newProduct = {
    name: '',
    category: 'Fashion',
    originalPrice: 0,
    discountPrice: 0,
    description: 'Bulk clearance offer',
    stockCount: 10,
    images: []
  };

  aiSuggestion: any = null;
  isAiLoading = false;

  constructor(private productService: ProductService, private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadAnalytics();
  }

  loadProducts() {
    this.productService.getVendorProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.log('Auth required for dashboard')
    });
  }

  loadAnalytics() {
    this.analyticsService.getVendorAnalytics().subscribe({
      next: (data) => this.analytics = data,
      error: (err) => console.log('Could not load analytics')
    });
    this.analyticsService.getMarketHeatmap().subscribe({
      next: (data) => this.heatmap = data,
      error: (err) => console.log('Heatmap error')
    });
  }

  upgradeToPro(plan: string) {
    this.analyticsService.upgradePlan(plan).subscribe({
      next: (res: any) => {
        alert('Congratulations! You are now a PRO vendor.');
        window.location.reload();
      },
      error: (err: any) => alert(err.error?.message || 'Upgrade failed')
    });
  }

  promoteProduct(productId: string) {
    this.analyticsService.boostProduct(productId).subscribe({
      next: (res: any) => {
        alert('Product boosted! It will now appear highlighted in the marketplace.');
        this.loadProducts();
      },
      error: (err: any) => alert(err.error?.message || 'Boosting failed')
    });
  }

  openAddModal() {
    this.isModalOpen = true;
  }

  saveProduct() {
      this.productService.createProduct(this.newProduct).subscribe({
          next: () => {
              this.isModalOpen = false;
              this.loadProducts();
          },
          error: (err) => alert('Operation failed. Please login as vendor.')
      });
  }

  getAIPrice() {
    if (this.newProduct.originalPrice <= 0) return alert('Enter original price first');
    this.isAiLoading = true;
    this.productService.getAIPriceOptimization(
      this.newProduct.name,
      this.newProduct.category,
      this.newProduct.originalPrice,
      this.newProduct.stockCount
    ).subscribe({
      next: (res) => {
        this.aiSuggestion = res;
        this.isAiLoading = false;
      },
      error: (err) => {
        this.isAiLoading = false;
        alert('AI Service temporarily unavailable');
      }
    });
  }

  applyAISuggestion() {
    if (this.aiSuggestion) {
      this.newProduct.discountPrice = this.aiSuggestion.suggestedPrice;
      this.aiSuggestion = null;
    }
  }
}
