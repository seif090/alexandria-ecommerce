import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-black text-gray-900 mb-10 text-center" *ngIf="!orderSuccess">Finalize Your Savings</h1>
        
        <!-- Order Success View with QR -->
        <div *ngIf="orderSuccess" class="bg-white p-12 rounded-[50px] shadow-2xl border-4 border-green-100 text-center animate-in zoom-in duration-500">
           <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">✓</div>
           <h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Order Confirmed!</h2>
           <p class="text-gray-500 mb-10 font-bold max-w-md mx-auto">Your clearance items are reserved. Present the QR code below at the store for pickup.</p>
           
           <div class="bg-gray-50 p-10 rounded-[40px] border-2 border-dashed border-gray-200 inline-block mb-10 group relative">
              <img [src]="qrCode" class="w-64 h-64 mx-auto rounded-2xl shadow-xl transition-transform group-hover:scale-105" alt="Pickup QR Code">
              <div class="absolute -top-4 -right-4 bg-orange-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">Scan to Pickup</div>
           </div>

           <!-- Alex-Chain Blockchain Proof -->
           <div class="mt-8 mb-12 p-6 bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 text-left max-w-lg mx-auto overflow-hidden relative group">
              <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div class="flex items-center gap-4 mb-4">
                 <div class="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                    <span class="text-xl">⛓️</span>
                 </div>
                 <div>
                    <h4 class="text-xs font-black uppercase tracking-widest text-slate-400">Alex-Chain Ledger</h4>
                    <p class="text-[10px] text-blue-400 font-bold italic">Immutable Proof of Pickup</p>
                 </div>
              </div>
              <div class="font-mono text-[9px] break-all text-slate-400 leading-tight">
                 <span class="text-blue-500">HASH:</span> {{ proofOfPickup }}
              </div>
              <p class="mt-4 text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Verified by Alexandria Merchant Distributed Network</p>
           </div>

           <div class="flex flex-col gap-4 max-w-sm mx-auto">
              <button routerLink="/" class="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest">Continue Shopping</button>
              <button (click)="orderSuccess = false" class="w-full text-gray-400 font-bold text-[10px] uppercase hover:text-gray-600 transition-colors">View Order Details</button>
           </div>
        </div>

        <div *ngIf="!orderSuccess" class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <!-- Item List -->
          <div class="lg:col-span-2 space-y-4">
            <div *ngFor="let item of cartService.cart()" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden">
                  <img [src]="item.image || 'https://via.placeholder.com/100'" class="w-full h-full object-cover">
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ item.name }}</h3>
                  <p class="text-xs text-gray-400 font-bold uppercase">{{ item.vendorName }}</p>
                </div>
              </div>
              <div class="text-right font-black text-blue-800">
                {{ item.price }} EGP <span class="text-xs text-gray-400">x {{ item.quantity }}</span>
              </div>
            </div>
            
            <div *ngIf="cartService.cart().length === 0" class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <p class="text-gray-400 font-bold">Your bag is empty.</p>
               <a routerLink="/" class="text-blue-600 font-bold hover:underline mt-2 inline-block">Back to Deals</a>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-blue-800 text-white p-8 rounded-[40px] shadow-2xl h-fit">
            <h2 class="text-xl font-black mb-8 border-b border-blue-700 pb-4">Order Summary</h2>
            <div class="space-y-4 mb-10">
              <div class="flex justify-between items-center text-blue-200">
                <span>Subtotal</span>
                <span>{{ cartService.getTotal() }} EGP</span>
              </div>
              <div class="flex justify-between items-center text-blue-200">
                <span>Local Delivery</span>
                <span>20 EGP</span>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-blue-700 text-2xl font-black">
                <span>Total</span>
                <span>{{ cartService.getTotal() + 20 }} EGP</span>
              </div>
            </div>

            <button (click)="submitOrder()" 
                    [disabled]="cartService.cart().length === 0"
                    class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-xl">
              PLACE ORDER NOW
            </button>
            <p class="text-center text-[10px] text-blue-300 font-bold uppercase mt-6 tracking-widest">Pay on Delivery &bull; Secure Checkout</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent {
  orderSuccess = false;
  qrCode: string = '';
  proofOfPickup: string = '';

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  submitOrder() {
    if (!this.authService.isLoggedIn()) {
      alert('Please log in to complete your purchase');
      this.router.navigate(['/login']);
      return;
    }

    const items = this.cartService.cart().map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    // In a multi-vendor setup, we'd group orders by vendor, but for simplicity:
    const vendorId = '65f0a...'; // This should come from product data normally

    this.orderService.placeOrder({
      items,
      totalAmount: this.cartService.getTotal(),
      vendorId // Simplified
    }).subscribe({
      next: (res: any) => {
        this.orderSuccess = true;
        this.qrCode = res.qrCode;
        this.proofOfPickup = res.proofOfPickup;
        this.cartService.clear();
      },
      error: (err: any) => alert('Order failed. Please try again.')
    });
  }
}
