import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../services/translate.pipe';

interface AdminTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  link: string;
  badge?: string;
}

@Component({
  selector: 'app-admin-tools',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 class="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
        🛠️ {{ 'adminTools.title' | translate }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ng-container *ngFor="let tool of tools">
          <a [routerLink]="tool.link" 
             [ngClass]="'bg-gradient-to-br ' + tool.color"
             class="p-6 rounded-2xl text-white hover:shadow-lg transition-all transform hover:scale-105 block group">
            
            <!-- Tool Icon & Badge -->
            <div class="flex justify-between items-start mb-4">
              <span class="text-4xl">{{ tool.icon }}</span>
              <span *ngIf="tool.badge" class="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-full">
                {{ tool.badge }}
              </span>
            </div>

            <!-- Tool Info -->
            <h3 class="text-lg font-black mb-2 group-hover:translate-x-1 transition-transform">
              {{ tool.title }}
            </h3>
            <p class="text-sm opacity-90 leading-tight">
              {{ tool.description }}
            </p>

            <!-- Arrow -->
            <div class="mt-4 text-xl opacity-0 group-hover:opacity-100 transition-opacity">→</div>
          </a>
        </ng-container>
      </div>
    </div>
  `,
  styles: []
})
export class AdminToolsComponent {
  tools: AdminTool[] = [
    {
      id: 'seed-data',
      title: '🌱 Seed Demo Data',
      description: 'Populate database with sample products, orders, and customers',
      icon: '🌱',
      color: 'from-green-500 to-emerald-600',
      link: '/admin/seed-data',
      badge: 'New'
    },
    {
      id: 'reports',
      title: '📊 Sales Reports',
      description: 'View comprehensive sales analytics and trends',
      icon: '📊',
      color: 'from-blue-500 to-blue-600',
      link: '/admin-dashboard'
    },
    {
      id: 'users',
      title: '👥 User Management',
      description: 'Manage vendors, customers, and admin accounts',
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      link: '/admin-dashboard'
    },
    {
      id: 'products',
      title: '📦 Product Catalog',
      description: 'Add, edit, or remove products from the marketplace',
      icon: '📦',
      color: 'from-orange-500 to-orange-600',
      link: '/admin-dashboard'
    },
    {
      id: 'orders',
      title: '📋 Order Management',
      description: 'Track and manage all marketplace orders',
      icon: '📋',
      color: 'from-pink-500 to-pink-600',
      link: '/admin-dashboard'
    },
    {
      id: 'settings',
      title: '⚙️ System Settings',
      description: 'Configure marketplace settings and preferences',
      icon: '⚙️',
      color: 'from-gray-600 to-gray-700',
      link: '/admin-dashboard'
    }
  ];
}
