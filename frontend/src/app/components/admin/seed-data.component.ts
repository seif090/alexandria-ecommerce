import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../services/translate.pipe';

interface SeedStatus {
  products: number;
  orders: number;
  customers: number;
  ready: boolean;
}

@Component({
  selector: 'app-seed-data',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-black text-gray-900 mb-2 italic">🌱 {{ 'seedData.title' | translate }}</h1>
          <p class="text-gray-500 font-bold">{{ 'seedData.subtitle' | translate }}</p>
        </div>

        <!-- Status Card -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 class="text-2xl font-black text-gray-900 mb-6">{{ 'seedData.currentStatus' | translate }}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-blue-50 rounded-2xl">
              <p class="text-sm font-bold text-blue-700 uppercase mb-2">{{ 'common.products' | translate }}</p>
              <p class="text-4xl font-black text-blue-900">{{ status?.products || 0 }}</p>
            </div>
            
            <div class="p-6 bg-purple-50 rounded-2xl">
              <p class="text-sm font-bold text-purple-700 uppercase mb-2">{{ 'orders.title' | translate }}</p>
              <p class="text-4xl font-black text-purple-900">{{ status?.orders || 0 }}</p>
            </div>
            
            <div class="p-6 bg-green-50 rounded-2xl">
              <p class="text-sm font-bold text-green-700 uppercase mb-2">{{ 'common.customers' | translate }}</p>
              <p class="text-4xl font-black text-green-900">{{ status?.customers || 0 }}</p>
            </div>
          </div>

          <button (click)="checkStatus()" class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-bold transition-colors">
            🔄 {{ 'seedData.refreshStatus' | translate }}
          </button>
        </div>

        <!-- Seeding Options -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 class="text-2xl font-black text-gray-900 mb-6">{{ 'seedData.seedOptions' | translate }}</h2>
          
          <div class="space-y-4">
            <!-- Seed All -->
            <button (click)="seedAll()" [disabled]="isLoading" 
                    class="w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-black transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <p class="text-xl mb-1">{{ 'seedData.seedAllData' | translate }}</p>
              <p class="text-sm opacity-90">{{ 'seedData.seedAllDesc' | translate }}</p>
            </button>

            <!-- Seed Products -->
            <button (click)="seedProducts()" [disabled]="isLoading"
                    class="w-full p-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-black transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <p class="text-xl mb-1">{{ 'seedData.seedProducts' | translate }}</p>
              <p class="text-sm opacity-90">{{ 'seedData.seedProductsDesc' | translate }}</p>
            </button>

            <!-- Seed Orders -->
            <button (click)="seedOrders()" [disabled]="isLoading"
                    class="w-full p-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-black transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <p class="text-xl mb-1">{{ 'seedData.seedOrders' | translate }}</p>
              <p class="text-sm opacity-90">{{ 'seedData.seedOrdersDesc' | translate }}</p>
            </button>

            <!-- Seed Customers -->
            <button (click)="seedCustomers()" [disabled]="isLoading"
                    class="w-full p-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-black transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <p class="text-xl mb-1">{{ 'seedData.seedCustomers' | translate }}</p>
              <p class="text-sm opacity-90">{{ 'seedData.seedCustomersDesc' | translate }}</p>
            </button>
          </div>
        </div>

        <!-- Clear Data -->
        <div class="bg-white rounded-3xl shadow-sm border border-red-200 p-8">
          <h2 class="text-2xl font-black text-gray-900 mb-4">⚠️ {{ 'seedData.dangerZone' | translate }}</h2>
          <p class="text-gray-600 font-bold mb-6">{{ 'seedData.clearWarning' | translate }}</p>
          
          <button (click)="clearAll()" [disabled]="isLoading"
                  class="w-full p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? ('common.loading' | translate) : ('seedData.clearAll' | translate) }}
          </button>
        </div>

        <!-- Status Messages -->
        <div *ngIf="message" [ngClass]="messageType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'" 
             class="fixed bottom-8 right-8 p-6 rounded-2xl border-2 max-w-md shadow-lg">
          <p class="font-bold" [ngClass]="messageType === 'success' ? 'text-green-900' : 'text-red-900'">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SeedDataComponent implements OnInit {
  status: SeedStatus | null = null;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.http.get<any>('http://localhost:3000/api/seed/seed-status').subscribe({
      next: (response) => {
        this.status = response.data;
      },
      error: () => {
        this.showMessage('❌ Failed to check status', 'error');
      }
    });
  }

  seedAll() {
    this.isLoading = true;
    this.http.post('http://localhost:3000/api/seed/seed-all', {}).subscribe({
      next: (response: any) => {
        this.showMessage(`✅ ${response.stats.products} products, ${response.stats.orders} orders, ${response.stats.customers} customers seeded!`, 'success');
        this.checkStatus();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage(`❌ Error: ${error.error?.error || 'Failed to seed data'}`, 'error');
        this.isLoading = false;
      }
    });
  }

  seedProducts() {
    this.isLoading = true;
    this.http.post('http://localhost:3000/api/seed/seed-products', {}).subscribe({
      next: (response: any) => {
        this.showMessage(`✅ ${response.products} products seeded!`, 'success');
        this.checkStatus();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage(`❌ Error: ${error.error?.error}`, 'error');
        this.isLoading = false;
      }
    });
  }

  seedOrders() {
    this.isLoading = true;
    this.http.post('http://localhost:3000/api/seed/seed-orders', {}).subscribe({
      next: (response: any) => {
        this.showMessage(`✅ ${response.orders} orders seeded!`, 'success');
        this.checkStatus();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage(`❌ Error: ${error.error?.error}`, 'error');
        this.isLoading = false;
      }
    });
  }

  seedCustomers() {
    this.isLoading = true;
    this.http.post('http://localhost:3000/api/seed/seed-customers', {}).subscribe({
      next: (response: any) => {
        this.showMessage(`✅ ${response.customers} customers seeded!`, 'success');
        this.checkStatus();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage(`❌ Error: ${error.error?.error}`, 'error');
        this.isLoading = false;
      }
    });
  }

  clearAll() {
    if (confirm('⚠️ This will delete ALL data. Are you sure?')) {
      this.isLoading = true;
      this.http.post('http://localhost:3000/api/seed/clear-all', {}).subscribe({
        next: () => {
          this.showMessage('✅ All data cleared!', 'success');
          this.checkStatus();
          this.isLoading = false;
        },
        error: (error) => {
          this.showMessage(`❌ Error: ${error.error?.error}`, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 5000);
  }
}
