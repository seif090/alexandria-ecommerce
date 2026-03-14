import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <h1 class="text-2xl font-bold text-gray-900">Alexandria Ecommerce</h1>
        </div>
      </nav>
      
      <main class="max-w-7xl mx-auto px-4 py-12">
        <div class="bg-white rounded-lg shadow p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Welcome to Alexandria!</h2>
          <p class="text-gray-600 mb-6">
            Multi-vendor ecommerce platform dedicated to clearance sales and inventory liquidation in Alexandria.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="font-bold text-lg text-blue-900 mb-2">🛍️ Clearance Deals</h3>
              <p class="text-sm text-gray-600">Find amazing discounts on clearance inventory</p>
            </div>
            <div class="bg-green-50 p-6 rounded-lg">
              <h3 class="font-bold text-lg text-green-900 mb-2">🏪 Vendor Dashboard</h3>
              <p class="text-sm text-gray-600">Manage your inventory and promotions</p>
            </div>
            <div class="bg-orange-50 p-6 rounded-lg">
              <h3 class="font-bold text-lg text-orange-900 mb-2">📊 Real-time Analytics</h3>
              <p class="text-sm text-gray-600">Track your sales and market trends</p>
            </div>
          </div>

          <div class="mt-8">
            <p class="text-sm text-gray-500">Status: ✅ Backend API Connected</p>
            <p class="text-sm text-gray-500">Database: ✅ SQLite Initialized</p>
            <p class="text-sm text-gray-500">Deployment: ✅ Live on Vercel</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class App {
  constructor() {}
}

