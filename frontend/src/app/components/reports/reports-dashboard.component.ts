import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-black text-gray-900 mb-2 italic">Reports & Analytics</h1>
          <p class="text-gray-500 font-bold">Generate insights with advanced reporting tools</p>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <button (click)="generateReport('sales')" class="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</div>
            <p class="font-black text-gray-900 text-sm">Sales Report</p>
            <p class="text-xs text-gray-400 font-bold">Last 7 days</p>
          </button>

          <button (click)="generateReport('inventory')" class="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform">📦</div>
            <p class="font-black text-gray-900 text-sm">Inventory Report</p>
            <p class="text-xs text-gray-400 font-bold">Current status</p>
          </button>

          <button (click)="generateReport('customers')" class="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform">👥</div>
            <p class="font-black text-gray-900 text-sm">Customer Report</p>
            <p class="text-xs text-gray-400 font-bold">Analytics & trends</p>
          </button>

          <button (click)="showScheduler = true" class="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform">⏰</div>
            <p class="font-black text-gray-900 text-sm">Schedule Report</p>
            <p class="text-xs text-gray-400 font-bold">Auto delivery</p>
          </button>
        </div>

        <!-- Reports Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Sales Report -->
          <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-black text-gray-900">Sales Performance</h2>
                <p class="text-sm text-gray-500 font-bold">March 2026</p>
              </div>
              <div class="flex gap-2">
                <button (click)="exportReport('sales', 'pdf')" class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                  📄 PDF
                </button>
                <button (click)="exportReport('sales', 'excel')" class="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                  📊 Excel
                </button>
              </div>
            </div>

            <!-- Charts/Stats -->
            <div class="grid grid-cols-3 gap-4 mb-8">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                <p class="text-[10px] font-black text-blue-700 uppercase mb-2">Total Sales</p>
                <p class="text-3xl font-black text-blue-900">15,750 EGP</p>
                <span class="text-xs font-bold text-green-600">↑ 12.5%</span>
              </div>
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl">
                <p class="text-[10px] font-black text-orange-700 uppercase mb-2">Orders</p>
                <p class="text-3xl font-black text-orange-900">42</p>
                <span class="text-xs font-bold text-green-600">↑ 8 new</span>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
                <p class="text-[10px] font-black text-purple-700 uppercase mb-2">Avg Value</p>
                <p class="text-3xl font-black text-purple-900">375 EGP</p>
                <span class="text-xs font-bold text-green-600">↑ 4.2%</span>
              </div>
            </div>

            <!-- Chart Placeholder -->
            <div class="bg-gray-50 h-64 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
              <div class="text-center">
                <p class="text-gray-400 font-bold mb-2">📈 Revenue Trend Chart</p>
                <p class="text-xs text-gray-400">Chart library (Chart.js) integration</p>
              </div>
            </div>
          </div>

          <!-- Inventory Alerts -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-black text-gray-900 mb-6">Inventory Status</h3>
            
            <div class="space-y-4 mb-8">
              <div class="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div class="flex justify-between items-center mb-2">
                  <p class="font-bold text-red-900">Out of Stock</p>
                  <span class="bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-black">5</span>
                </div>
                <p class="text-xs text-red-600">Immediate action needed</p>
              </div>

              <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <div class="flex justify-between items-center mb-2">
                  <p class="font-bold text-yellow-900">Low Stock</p>
                  <span class="bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs font-black">23</span>
                </div>
                <p class="text-xs text-yellow-600">Reorder recommended</p>
              </div>

              <div class="p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div class="flex justify-between items-center mb-2">
                  <p class="font-bold text-green-900">Healthy Stock</p>
                  <span class="bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-black">459</span>
                </div>
                <p class="text-xs text-green-600">Running smoothly</p>
              </div>
            </div>

            <button (click)="exportReport('inventory', 'pdf')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black text-sm transition-colors">
              Export Full Report
            </button>
          </div>
        </div>

        <!-- Customer Segments -->
        <div class="mt-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 class="text-2xl font-black text-gray-900 mb-8">Customer Segments</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
              <p class="text-3xl font-black text-blue-900">287</p>
              <p class="text-sm font-bold text-blue-700 mt-2">Total Customers</p>
              <span class="inline-block bg-blue-300 text-blue-900 px-3 py-1 rounded-full text-xs font-bold mt-3">↑ 34 new</span>
            </div>

            <div class="text-center p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl">
              <p class="text-3xl font-black text-orange-900">12</p>
              <p class="text-sm font-bold text-orange-700 mt-2">VIP Members</p>
              <span class="inline-block bg-orange-300 text-orange-900 px-3 py-1 rounded-full text-xs font-bold mt-3">⭐ Premium</span>
            </div>

            <div class="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
              <p class="text-3xl font-black text-green-900">156</p>
              <p class="text-sm font-bold text-green-700 mt-2">Active Users</p>
              <span class="inline-block bg-green-300 text-green-900 px-3 py-1 rounded-full text-xs font-bold mt-3">54.4%</span>
            </div>

            <div class="text-center p-6 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl">
              <p class="text-3xl font-black text-red-900">68</p>
              <p class="text-sm font-bold text-red-700 mt-2">Inactive</p>
              <span class="inline-block bg-red-300 text-red-900 px-3 py-1 rounded-full text-xs font-bold mt-3">8.2% churn</span>
            </div>
          </div>
        </div>

        <!-- Schedule Report Modal -->
        <div *ngIf="showScheduler" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h2 class="text-2xl font-black mb-6">Schedule Report Delivery</h2>
            
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Report Type</label>
                <select [(ngModel)]="scheduleConfig.reportType" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="customers">Customer Report</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Frequency</label>
                <select [(ngModel)]="scheduleConfig.frequency" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Email Recipients</label>
                <input 
                  [(ngModel)]="scheduleConfig.email" 
                  placeholder="your@email.com" 
                  class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Format</label>
                <div class="flex gap-2">
                  <button (click)="scheduleConfig.format = 'pdf'" 
                          [class.bg-blue-600]="scheduleConfig.format === 'pdf'"
                          [class.text-white]="scheduleConfig.format === 'pdf'"
                          [class.bg-gray-100]="scheduleConfig.format !== 'pdf'"
                          class="flex-1 py-2 rounded-lg font-bold text-sm transition-colors">PDF</button>
                  <button (click)="scheduleConfig.format = 'excel'"
                          [class.bg-blue-600]="scheduleConfig.format === 'excel'"
                          [class.text-white]="scheduleConfig.format === 'excel'"
                          [class.bg-gray-100]="scheduleConfig.format !== 'excel'"
                          class="flex-1 py-2 rounded-lg font-bold text-sm transition-colors">Excel</button>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="showScheduler = false" class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors">
                Cancel
              </button>
              <button (click)="scheduleReport()" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  showScheduler = false;
  scheduleConfig = {
    reportType: 'sales',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
    email: ''
  };

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    // Load initial reports
  }

  generateReport(reportType: string) {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    if (reportType === 'sales') {
      this.reportService.getSalesReport(startDate, endDate).subscribe({
        next: (data) => console.log('Sales report:', data)
      });
    } else if (reportType === 'inventory') {
      this.reportService.getInventoryReport().subscribe({
        next: (data) => console.log('Inventory report:', data)
      });
    } else if (reportType === 'customers') {
      this.reportService.getCustomerAnalytics(startDate, endDate).subscribe({
        next: (data) => console.log('Customer report:', data)
      });
    }
  }

  exportReport(reportType: string, format: 'pdf' | 'excel' | 'csv') {
    if (format === 'pdf') {
      this.reportService.exportToPDF(reportType).subscribe();
    } else if (format === 'excel') {
      this.reportService.exportToExcel(reportType).subscribe();
    } else {
      this.reportService.exportToCSV(reportType).subscribe();
    }
  }

  scheduleReport() {
    this.reportService.scheduleReport({
      reportType: this.scheduleConfig.reportType,
      frequency: this.scheduleConfig.frequency,
      format: this.scheduleConfig.format,
      recipients: [this.scheduleConfig.email]
    }).subscribe({
      next: () => {
        alert('✅ Report scheduled successfully!');
        this.showScheduler = false;
      }
    });
  }
}
