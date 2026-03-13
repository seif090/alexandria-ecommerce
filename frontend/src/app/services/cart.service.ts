import { Injectable, signal } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendorName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart = signal<CartItem[]>([]);
  
  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) this.cart.set(JSON.parse(savedCart));
  }

  addToCart(product: any) {
    const current = this.cart();
    const existing = current.find(item => item.id === product._id);
    
    if (existing) {
      existing.quantity += 1;
      this.cart.set([...current]);
    } else {
      this.cart.set([...current, {
        id: product._id,
        name: product.name,
        price: product.discountPrice,
        quantity: 1,
        image: product.images[0] || '',
        vendorName: product.vendor?.shopName || 'Local Shop'
      }]);
    }
    this.save();
  }

  removeFromCart(id: string) {
    this.cart.set(this.cart().filter(item => item.id !== id));
    this.save();
  }

  getTotal() {
    return this.cart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  private save() {
    localStorage.setItem('cart', JSON.stringify(this.cart()));
  }

  clear() {
    this.cart.set([]);
    localStorage.removeItem('cart');
  }
}
