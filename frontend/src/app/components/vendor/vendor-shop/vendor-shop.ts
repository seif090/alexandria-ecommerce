import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-vendor-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20">
      <!-- Shop Header -->
      <div class="h-64 bg-blue-900 relative">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl shadow-blue-500/20">🏪</div>
            <div>
              <h1 class="text-4xl font-black text-white italic tracking-tighter uppercase">{{ shop?.shopName || 'Marketplace Vendor' }}</h1>
              <p class="text-blue-200 font-bold">{{ products.length }} Active Clearance Offers</p>
            </div>
          </div>
        </div>
      </div>

      <main class="max-w-7xl mx-auto px-4 mt-12">
        <div class="bg-white p-8 rounded-[40px] shadow-sm border mb-12 border-gray-100">
           <h3 class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">About this Shop</h3>
           <p class="text-gray-600 font-medium italic text-lg leading-relaxed">"{{ shop?.shopDescription || 'Specializing in high-quality clearance and liquidations in Alexandria.' }}"</p>
        </div>

        <h2 class="text-2xl font-black text-gray-900 mb-8 px-4 flex items-center gap-2">
           <span class="w-8 h-1 bg-orange-500 rounded-full"></span>
           Current Deals at this Location
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div *ngFor="let product of products" class="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 p-4 transition-all hover:scale-105">
             <div class="relative h-48 mb-4 rounded-2xl overflow-hidden shadow-inner bg-gray-50">
                <img [src]="product.images[0] || 'https://via.placeholder.com/400'" class="w-full h-full object-cover">
                <div class="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">
                   -{{ Math.round(((product.originalPrice - product.discountPrice)/product.originalPrice)*100) }}%
                </div>
             </div>
             <h3 class="font-bold text-gray-800 mb-2 truncate group-hover:text-blue-600">{{ product.name }}</h3>
             <div class="flex justify-between items-center mb-4">
                <span class="text-xl font-black text-orange-600 tracking-tighter">{{ product.discountPrice }} EGP</span>
                <span class="text-xs text-gray-400 line-through">{{ product.originalPrice }} EGP</span>
             </div>
             <button (click)="addToCart(product)" class="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95">Add to Cart</button>
          </div>
        </div>

        <div *ngIf="products.length === 0" class="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200">
           <p class="text-gray-400 font-bold italic">No active offers for this location right now.</p>
        </div>
      </main>
    </div>
  `
})
export class VendorShopComponent implements OnInit {
  shop: any = null;
  products: any[] = [];
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const vendorId = this.route.snapshot.paramMap.get('id');
    if (vendorId) {
      this.productService.getProducts().subscribe(all => {
        this.products = all.filter((p: any) => (p.vendor?._id === vendorId) || (p.vendor === vendorId));
        if (this.products.length > 0) {
          this.shop = this.products[0].vendor;
        }
      });
    }
  }

  addToCart(p: any) {
    this.cartService.addToCart(p);
  }
}
