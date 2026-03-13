import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out-of-stock';
  rating: number;
  reviews: number;
  image: string;
  lastUpdated: string;
  sales: number;
  revenue: number;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-12">
          <div>
            <h1 class="text-4xl font-black text-gray-900 mb-2 italic">Product Listing</h1>
            <p class="text-gray-500 font-bold">Manage and optimize your product inventory</p>
          </div>
          <button (click)="showAddProduct = true" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-colors">
            + Add Product
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-blue-600">{{ products.length }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Total Products</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-green-600">{{ getTotalStock() }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Items in Stock</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-purple-600">{{ getTotalSales() }}</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Total Sales</p>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-black text-yellow-600">{{ getTotalRevenue() | number: '1.0-0' }} EGP</p>
            <p class="text-sm font-bold text-gray-600 mt-2">Revenue</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-12">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Category</label>
              <select [(ngModel)]="filterCategory" (change)="applyFilters()" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home & Garden</option>
                <option value="Beauty">Beauty & Care</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Status</label>
              <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Sort By</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                <option value="newest">Newest First</option>
                <option value="bestselling">Best Selling</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Search</label>
              <input 
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
                placeholder="Product name, SKU..." 
                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="flex items-end">
              <button (click)="resetFilters()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-black transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Product</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">SKU</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Category</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Price</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Stock</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Sales</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Rating</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Status</th>
                  <th class="text-left py-4 px-6 text-xs font-black text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="text-3xl">{{ product.image }}</div>
                      <div>
                        <p class="font-bold text-gray-900">{{ product.name }}</p>
                        <p class="text-xs text-gray-500">Updated: {{ product.lastUpdated }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-gray-700 font-bold">{{ product.sku }}</td>
                  <td class="py-4 px-6 text-gray-700 font-bold">{{ product.category }}</td>
                  <td class="py-4 px-6 font-black text-gray-900">{{ product.price }} EGP</td>
                  <td class="py-4 px-6">
                    <span [ngClass]="product.stock > 50 ? 'bg-green-100 text-green-700' : 
                                     product.stock > 10 ? 'bg-yellow-100 text-yellow-700' : 
                                     'bg-red-100 text-red-700'"
                          class="px-3 py-1 rounded-full text-xs font-black">
                      {{ product.stock }} units
                    </span>
                  </td>
                  <td class="py-4 px-6 font-black text-gray-900">{{ product.sales }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-1">
                      <span>★</span>
                      <span class="font-bold text-gray-900">{{ product.rating }}</span>
                      <span class="text-xs text-gray-500">({{ product.reviews }})</span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <span [ngClass]="getStatusBgColor(product.status)"
                          class="px-3 py-1 rounded-full text-xs font-black uppercase">
                      {{ product.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex gap-2">
                      <button (click)="editProduct(product)" class="text-blue-600 hover:text-blue-700 font-black text-sm">
                        ✏️
                      </button>
                      <button (click)="deleteProduct(product)" class="text-red-600 hover:text-red-700 font-black text-sm">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add/Edit Product Modal -->
        <div *ngIf="showAddProduct" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
                <button (click)="closeProductForm()" class="text-2xl">✕</button>
              </div>
            </div>

            <div class="p-8">
              <div class="space-y-6">
                <!-- Product Name -->
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">Product Name *</label>
                  <input 
                    [(ngModel)]="productForm.name" 
                    placeholder="e.g., Premium Wireless Headphones"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                </div>

                <!-- SKU -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">SKU *</label>
                    <input 
                      [(ngModel)]="productForm.sku" 
                      placeholder="e.g., WHD-001"
                      class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                  </div>
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">Category *</label>
                    <select [(ngModel)]="productForm.category" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home & Garden</option>
                      <option value="Beauty">Beauty & Care</option>
                    </select>
                  </div>
                </div>

                <!-- Price & Stock -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">Price (EGP) *</label>
                    <input 
                      type="number"
                      [(ngModel)]="productForm.price" 
                      min="0"
                      placeholder="0.00"
                      class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                  </div>
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">Stock Quantity *</label>
                    <input 
                      type="number"
                      [(ngModel)]="productForm.stock"
                      min="0"
                      placeholder="0"
                      class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                  </div>
                </div>

                <!-- Status & Image -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">Status</label>
                    <select [(ngModel)]="productForm.status" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">Product Icon</label>
                    <select [(ngModel)]="productForm.image" class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                      <option value="📱">📱 Phone</option>
                      <option value="👗">👗 Clothing</option>
                      <option value="⌚">⌚ Watch</option>
                      <option value="💄">💄 Beauty</option>
                      <option value="🎧">🎧 Headphones</option>
                      <option value="📷">📷 Camera</option>
                      <option value="🛋️">🛋️ Furniture</option>
                      <option value="👟">👟 Shoes</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 mt-8">
                <button (click)="closeProductForm()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-2xl font-black transition-colors">
                  Cancel
                </button>
                <button (click)="saveProduct()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black transition-colors">
                  {{ editingProduct ? 'Update' : 'Create' }} Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListingComponent implements OnInit {
  products: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      sku: 'WHD-001',
      category: 'Electronics',
      price: 450,
      stock: 85,
      status: 'active',
      rating: 4.8,
      reviews: 156,
      image: '🎧',
      lastUpdated: 'Mar 14, 2026',
      sales: 324,
      revenue: 145800
    },
    {
      id: '2',
      name: 'Spring Collection Dress',
      sku: 'DRS-002',
      category: 'Fashion',
      price: 320,
      stock: 45,
      status: 'active',
      rating: 4.6,
      reviews: 89,
      image: '👗',
      lastUpdated: 'Mar 13, 2026',
      sales: 156,
      revenue: 49920
    },
    {
      id: '3',
      name: 'Smartwatch Pro',
      sku: 'SWT-003',
      category: 'Electronics',
      price: 890,
      stock: 5,
      status: 'active',
      rating: 4.9,
      reviews: 234,
      image: '⌚',
      lastUpdated: 'Mar 12, 2026',
      sales: 87,
      revenue: 77430
    },
    {
      id: '4',
      name: 'Skincare Starter Kit',
      sku: 'SKN-004',
      category: 'Beauty',
      price: 210,
      stock: 0,
      status: 'out-of-stock',
      rating: 4.7,
      reviews: 123,
      image: '💄',
      lastUpdated: 'Mar 11, 2026',
      sales: 234,
      revenue: 49140
    },
    {
      id: '5',
      name: 'Modern Office Chair',
      sku: 'CHR-005',
      category: 'Home',
      price: 1200,
      stock: 12,
      status: 'active',
      rating: 4.5,
      reviews: 45,
      image: '🛋️',
      lastUpdated: 'Mar 10, 2026',
      sales: 32,
      revenue: 38400
    },
    {
      id: '6',
      name: 'Running Shoes Pro',
      sku: 'SHO-006',
      category: 'Fashion',
      price: 550,
      stock: 0,
      status: 'inactive',
      rating: 4.4,
      reviews: 67,
      image: '👟',
      lastUpdated: 'Feb 28, 2026',
      sales: 45,
      revenue: 24750
    }
  ];

  filteredProducts: Product[] = [];
  filterCategory = '';
  filterStatus = '';
  sortBy = 'newest';
  searchTerm = '';
  showAddProduct = false;
  editingProduct: Product | null = null;

  productForm = {
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active' as 'active' | 'inactive' | 'out-of-stock',
    image: '📱'
  };

  ngOnInit() {
    this.filteredProducts = [...this.products];
  }

  getTotalStock(): number {
    return this.products.reduce((sum, p) => sum + p.stock, 0);
  }

  getTotalSales(): number {
    return this.products.reduce((sum, p) => sum + p.sales, 0);
  }

  getTotalRevenue(): number {
    return this.products.reduce((sum, p) => sum + p.revenue, 0);
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      if (this.filterCategory && product.category !== this.filterCategory) return false;
      if (this.filterStatus && product.status !== this.filterStatus) return false;
      if (this.searchTerm && !product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) 
                         && !product.sku.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (this.sortBy === 'bestselling') {
      this.filteredProducts.sort((a, b) => b.sales - a.sales);
    } else if (this.sortBy === 'price-high') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'price-low') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'rating') {
      this.filteredProducts.sort((a, b) => b.rating - a.rating);
    }
  }

  resetFilters() {
    this.filterCategory = '';
    this.filterStatus = '';
    this.sortBy = 'newest';
    this.searchTerm = '';
    this.filteredProducts = [...this.products];
  }

  getStatusBgColor(status: string): string {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'inactive') return 'bg-gray-100 text-gray-700';
    return 'bg-red-100 text-red-700';
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm = {
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status as any,
      image: product.image
    };
    this.showAddProduct = true;
  }

  saveProduct() {
    if (!this.productForm.name || !this.productForm.sku || !this.productForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingProduct) {
      const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          ...this.productForm,
          lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        };
        alert('✅ Product updated!');
      }
    } else {
      const newProduct: Product = {
        id: String(Date.now()),
        ...this.productForm,
        rating: 0,
        reviews: 0,
        sales: 0,
        revenue: 0,
        lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      this.products.push(newProduct);
      alert('✅ Product created!');
    }

    this.applyFilters();
    this.closeProductForm();
  }

  deleteProduct(product: Product) {
    if (confirm(`Delete "${product.name}"?`)) {
      this.products = this.products.filter(p => p.id !== product.id);
      alert('✅ Product deleted!');
      this.applyFilters();
    }
  }

  closeProductForm() {
    this.showAddProduct = false;
    this.editingProduct = null;
    this.productForm = {
      name: '',
      sku: '',
      category: '',
      price: 0,
      stock: 0,
      status: 'active',
      image: '📱'
    };
  }
}
