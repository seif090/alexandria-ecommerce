import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  commission: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-12">
          <div>
            <h1 class="text-4xl font-black text-gray-900 mb-2 italic">Category Management</h1>
            <p class="text-gray-500 font-bold">Manage your product categories</p>
          </div>
          <button (click)="showAddForm = true" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-colors">
            + Add Category
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-blue-600">{{ categories.length }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Total Categories</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-green-600">{{ getTotalProducts() }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Total Products</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-purple-600">{{ getAverageCommission().toFixed(1) }}%</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Avg Commission</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-yellow-600">{{ getActiveCount() }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Active</p>
          </div>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let category of categories" class="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow p-6">
            <!-- Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="text-4xl">{{ category.icon }}</div>
              <span [ngClass]="category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                    class="px-3 py-1 rounded-full text-xs font-black uppercase">
                {{ category.status }}
              </span>
            </div>

            <!-- Name & Description -->
            <p class="text-xl font-black text-gray-900 mb-2">{{ category.name }}</p>
            <p class="text-sm text-gray-600 mb-4">{{ category.description }}</p>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-200">
              <div class="bg-blue-50 p-3 rounded-2xl">
                <p class="text-xs font-bold text-blue-700 uppercase">Products</p>
                <p class="text-2xl font-black text-blue-900">{{ category.productCount }}</p>
              </div>
              <div class="bg-purple-50 p-3 rounded-2xl">
                <p class="text-xs font-bold text-purple-700 uppercase">Commission</p>
                <p class="text-2xl font-black text-purple-900">{{ category.commission }}%</p>
              </div>
            </div>

            <!-- Last Updated -->
            <p class="text-xs text-gray-600 font-bold mb-4">Updated: {{ category.lastUpdated }}</p>

            <!-- Actions -->
            <div class="flex gap-2">
              <button (click)="editCategory(category)" class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg text-xs font-black transition-colors">
                ✏️ Edit
              </button>
              <button (click)="toggleStatus(category)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-black transition-colors">
                {{ category.status === 'active' ? '❌' : '✅' }} {{ category.status === 'active' ? 'Disable' : 'Enable' }}
              </button>
              <button (click)="deleteCategory(category)" class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-xs font-black transition-colors">
                🗑️ Delete
              </button>
            </div>
          </div>

          <!-- Add New Card (If showing form) -->
          <div *ngIf="showAddForm" class="bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-300 p-6 flex items-center justify-center min-h-64">
            <p class="text-gray-400 font-bold">Scroll down to see the form →</p>
          </div>
        </div>

        <!-- Add/Edit Category Modal -->
        <div *ngIf="showAddForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black">{{ editingCategory ? 'Edit Category' : 'Add New Category' }}</h2>
                <button (click)="closeForm()" class="text-2xl">✕</button>
              </div>
            </div>

            <div class="p-8">
              <div class="space-y-6">
                <!-- Name -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">Category Name *</label>
                  <input 
                    [(ngModel)]="formData.name" 
                    placeholder="e.g., Electronics, Fashion, Home & Garden"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">Description</label>
                  <textarea 
                    [(ngModel)]="formData.description" 
                    placeholder="Describe this category..."
                    rows="4"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold"></textarea>
                </div>

                <!-- Icon Selection -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-3">Category Icon</label>
                  <div class="grid grid-cols-6 gap-2">
                    <button *ngFor="let icon of availableIcons"
                            (click)="formData.icon = icon"
                            [class.ring-4]="formData.icon === icon"
                            [class.ring-blue-500]="formData.icon === icon"
                            class="text-3xl p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold">
                      {{ icon }}
                    </button>
                  </div>
                </div>

                <!-- Color Selection -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-3">Color Theme</label>
                  <div class="flex gap-2">
                    <button *ngFor="let color of ['blue', 'purple', 'green', 'red', 'yellow', 'orange']"
                            (click)="formData.color = color"
                            [class.ring-4]="formData.color === color"
                            [class.ring-gray-400]="formData.color === color"
                            [ngClass]="'from-' + color + '-400 to-' + color + '-600'"
                            class="w-12 h-12 rounded-lg bg-gradient-to-br transition-all"></button>
                  </div>
                </div>

                <!-- Commission -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">Commission Rate (%)</label>
                  <input 
                    type="number"
                    [(ngModel)]="formData.commission" 
                    min="0"
                    max="100"
                    placeholder="e.g., 10"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">Status</label>
                  <select [(ngModel)]="formData.status" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 mt-8">
                <button (click)="closeForm()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-2xl font-black transition-colors">
                  Cancel
                </button>
                <button (click)="saveCategory()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black transition-colors">
                  {{ editingCategory ? 'Update' : 'Create' }} Category
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div *ngIf="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <p class="text-lg font-black text-gray-900 mb-2">Delete Category?</p>
            <p class="text-gray-600 font-bold mb-6">
              Are you sure you want to delete <span class="text-gray-900 font-black">"{{ deletingCategory?.name }}"</span>? 
              This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button (click)="showDeleteConfirm = false" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-2xl font-black transition-colors">
                Cancel
              </button>
              <button (click)="confirmDelete()" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-black transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [
    {
      id: '1',
      name: 'Electronics',
      description: 'Mobile phones, laptops, and tech accessories',
      productCount: 245,
      icon: '📱',
      color: 'blue',
      status: 'active',
      commission: 10,
      lastUpdated: 'Mar 10, 2026'
    },
    {
      id: '2',
      name: 'Fashion & Clothing',
      description: 'Men, women, and kids clothing and accessories',
      productCount: 512,
      icon: '👗',
      color: 'purple',
      status: 'active',
      commission: 15,
      lastUpdated: 'Mar 12, 2026'
    },
    {
      id: '3',
      name: 'Home & Garden',
      description: 'Furniture, decor, and garden supplies',
      productCount: 187,
      icon: '🏠',
      color: 'green',
      status: 'active',
      commission: 12,
      lastUpdated: 'Mar 11, 2026'
    },
    {
      id: '4',
      name: 'Beauty & Personal Care',
      description: 'Skincare, makeup, and wellness products',
      productCount: 298,
      icon: '💄',
      color: 'red',
      status: 'active',
      commission: 18,
      lastUpdated: 'Mar 13, 2026'
    },
    {
      id: '5',
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      productCount: 156,
      icon: '⛳',
      color: 'yellow',
      status: 'inactive',
      commission: 12,
      lastUpdated: 'Feb 28, 2026'
    },
    {
      id: '6',
      name: 'Books & Media',
      description: 'Books, audiobooks, and digital content',
      productCount: 342,
      icon: '📚',
      color: 'orange',
      status: 'active',
      commission: 8,
      lastUpdated: 'Mar 14, 2026'
    }
  ];

  availableIcons = ['📱', '👗', '🏠', '💄', '⛳', '📚', '🎮', '🍕', '✈️', '🚗', '💻', '🛠️'];
  
  showAddForm = false;
  showDeleteConfirm = false;
  editingCategory: Category | null = null;
  deletingCategory: Category | null = null;

  formData = {
    name: '',
    description: '',
    icon: '📱',
    color: 'blue',
    commission: 10,
    status: 'active' as 'active' | 'inactive'
  };

  ngOnInit() {
    // Load categories
  }

  getTotalProducts(): number {
    return this.categories.reduce((sum, cat) => sum + cat.productCount, 0);
  }

  getAverageCommission(): number {
    const total = this.categories.reduce((sum, cat) => sum + cat.commission, 0);
    return total / this.categories.length;
  }

  getActiveCount(): number {
    return this.categories.filter(c => c.status === 'active').length;
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.formData = {
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      commission: category.commission,
      status: category.status
    };
    this.showAddForm = true;
  }

  saveCategory() {
    if (!this.formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (this.editingCategory) {
      // Update existing
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          ...this.formData,
          lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        };
        alert('✅ Category updated successfully!');
      }
    } else {
      // Add new
      const newCategory: Category = {
        id: String(Date.now()),
        ...this.formData,
        productCount: 0,
        lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      this.categories.push(newCategory);
      alert('✅ Category created successfully!');
    }

    this.closeForm();
  }

  toggleStatus(category: Category) {
    category.status = category.status === 'active' ? 'inactive' : 'active';
    category.lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    alert(`✅ Category ${category.status === 'active' ? 'enabled' : 'disabled'}!`);
  }

  deleteCategory(category: Category) {
    this.deletingCategory = category;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.deletingCategory) {
      this.categories = this.categories.filter(c => c.id !== this.deletingCategory!.id);
      alert('✅ Category deleted successfully!');
      this.showDeleteConfirm = false;
      this.deletingCategory = null;
    }
  }

  closeForm() {
    this.showAddForm = false;
    this.editingCategory = null;
    this.formData = {
      name: '',
      description: '',
      icon: '📱',
      color: 'blue',
      commission: 10,
      status: 'active'
    };
  }
}
