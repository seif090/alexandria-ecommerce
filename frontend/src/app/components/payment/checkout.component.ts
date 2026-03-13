import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentMethod, Card } from '../../services/payment.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../services/translate.pipe';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-black text-gray-900 mb-2 italic">{{ 'payment.checkoutProcess' | translate }}</h1>
          <p class="text-gray-500 font-bold">{{ 'payment.subtitle' | translate }}</p>
        </div>

        <!-- Checkout Steps -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
          <div class="flex justify-between items-center mb-12">
            <div *ngFor="let step of checkoutSteps; let i = index" class="flex-1 flex items-center">
              <div [ngClass]="currentStep >= i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'" 
                   class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2">
                {{ i + 1 }}
              </div>
              <div *ngIf="i < checkoutSteps.length - 1" [ngClass]="currentStep > i + 1 ? 'bg-blue-600' : 'bg-gray-200'" 
                   class="flex-1 h-1 mx-4"></div>
            </div>
          </div>

          <div class="text-center mb-8">
            <p class="text-lg font-black text-gray-900">{{ checkoutSteps[currentStep - 1] | translate }}</p>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left: Checkout Form -->
          <div class="lg:col-span-2">
            <!-- Step 1: Cart Items -->
            <div *ngIf="currentStep === 1" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 class="text-2xl font-black text-gray-900 mb-6">{{ 'payment.orderSummary' | translate }}</h2>
              
              <div class="space-y-4 mb-8">
                <div *ngFor="let item of orderItems" class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div class="text-4xl">{{ item.image }}</div>
                  <div class="flex-1">
                    <p class="font-bold text-gray-900">{{ item.name }}</p>
                    <p class="text-sm text-gray-600">{{ 'orders.qtyLabel' | translate }}: {{ item.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-black text-blue-600">{{ item.price * item.quantity }} {{ currency }}</p>
                    <p class="text-xs text-gray-500">{{ item.price }} {{ currency }}/{{ 'common.add' | translate }}</p>
                  </div>
                </div>
              </div>

              <button (click)="nextStep()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-colors">
                {{ 'payment.proceedToPayment' | translate }}
              </button>
            </div>

            <!-- Step 2: Payment Method Selection -->
            <div *ngIf="currentStep === 2" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 class="text-2xl font-black text-gray-900 mb-6">{{ 'payment.paymentMethod' | translate }}</h2>
              
              <div class="space-y-4 mb-8">
                <label *ngFor="let method of paymentMethods" class="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all" 
                       [ngClass]="selectedPaymentMethod?.id === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                  <input type="radio" [value]="method.id" [(ngModel)]="selectedPaymentMethod" class="mr-4"
                         (change)="selectPaymentMethod(method)">
                  <div class="flex-1">
                    <p class="font-bold text-gray-900">{{ method.name }}</p>
                    <p *ngIf="method.lastFour" class="text-sm text-gray-600">•••• •••• •••• {{ method.lastFour }}</p>
                  </div>
                  <span *ngIf="method.isDefault" class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                    {{ 'common.confirm' | translate }}
                  </span>
                </label>

                <!-- Add New Card -->
                <div (click)="showNewCardForm = true" class="p-4 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors text-center">
                  <p class="font-bold text-blue-600">+ {{ 'payment.creditCard' | translate }}</p>
                </div>
              </div>

              <!-- Wallet Option -->
              <div class="p-6 bg-green-50 border border-green-200 rounded-2xl mb-8">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-black text-green-900">{{ 'payment.walletPayment' | translate }}</p>
                    <p class="text-sm text-green-700">{{ 'common.balance' | translate }}: {{ walletBalance }} {{ currency }}</p>
                  </div>
                  <button *ngIf="walletBalance >= orderTotal" (click)="selectWalletPayment()" 
                          class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-black transition-colors">
                    {{ 'common.select' | translate }}
                  </button>
                </div>
              </div>

              <div class="flex gap-4">
                <button (click)="previousStep()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-2xl font-black transition-colors">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="nextStep()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-colors">
                  {{ 'common.confirm' | translate }}
                </button>
              </div>
            </div>

            <!-- Step 3: Enter Card Details -->
            <div *ngIf="currentStep === 3 && !useWallet" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 class="text-2xl font-black text-gray-900 mb-6">{{ 'payment.cardNumber' | translate }}</h2>
              
              <div class="space-y-6 mb-8">
                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">{{ 'payment.cardholderName' | translate }} *</label>
                  <input 
                    [(ngModel)]="cardData.cardholderName" 
                    placeholder="John Doe"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                </div>

                <div>
                  <label class="block text-sm font-black text-gray-900 mb-2">{{ 'payment.cardNumber' | translate }} *</label>
                  <input 
                    [(ngModel)]="cardData.cardNumber" 
                    placeholder="4532 1234 5678 9010"
                    maxlength="19"
                    (input)="formatCardNumber($event)"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                  <p *ngIf="!isCardValid && cardData.cardNumber" class="text-xs text-red-600 font-bold mt-1">{{ 'payment.invalidCard' | translate }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">{{ 'payment.expiryDate' | translate }} *</label>
                    <input 
                      [(ngModel)]="cardData.expiryDate" 
                      placeholder="MM/YY"
                      maxlength="5"
                      (input)="formatExpiryDate($event)"
                      class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                  </div>
                  <div>
                    <label class="block text-sm font-black text-gray-900 mb-2">{{ 'payment.cvv' | translate }} *</label>
                    <input 
                      [(ngModel)]="cardData.cvv" 
                      placeholder="123"
                      maxlength="4"
                      type="password"
                      class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold">
                  </div>
                </div>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="saveCardForFuture" class="w-4 h-4">
                  <span class="text-sm font-bold text-gray-700">{{ 'payment.saveCard' | translate }}</span>
                </label>
              </div>

              <div class="p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-8">
                <p class="text-xs text-blue-700 font-bold flex items-center gap-2">
                  🔒 {{ 'payment.secure' | translate }} - {{ 'payment.ssl' | translate }}
                </p>
              </div>

              <div class="flex gap-4">
                <button (click)="previousStep()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-2xl font-black transition-colors">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="processPayment()" [disabled]="isProcessing || !isCardValid" 
                        [ngClass]="isProcessing ? 'opacity-50 cursor-not-allowed' : ''"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-colors">
                  {{ isProcessing ? ('common.loading' | translate) : ('payment.proceedToPayment' | translate) }}
                </button>
              </div>
            </div>

            <!-- Step 3: Wallet Payment Confirmation -->
            <div *ngIf="currentStep === 3 && useWallet" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 class="text-2xl font-black text-gray-900 mb-6">{{ 'payment.walletPayment' | translate }}</h2>
              
              <div class="p-6 bg-green-50 border border-green-200 rounded-2xl mb-8">
                <p class="text-lg font-black text-green-900 mb-4">⏱ {{ 'payment.walletPaymentMsg' | translate }}</p>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="font-bold text-green-700">{{ 'payment.balance' | translate }}:</span>
                    <span class="font-black text-green-900">{{ walletBalance }} {{ currency }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-bold text-green-700">{{ 'payment.orderAmount' | translate }}:</span>
                    <span class="font-black text-green-900">{{ orderTotal }} {{ currency }}</span>
                  </div>
                  <div class="flex justify-between border-t border-green-300 pt-3">
                    <span class="font-bold text-green-700">{{ 'payment.remainingBalance' | translate }}:</span>
                    <span class="font-black text-green-900">{{ walletBalance - orderTotal }} {{ currency }}</span>
                  </div>
                </div>
              </div>

              <div class="flex gap-4">
                <button (click)="previousStep()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-2xl font-black transition-colors">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="processWalletPayment()" [disabled]="isProcessing"
                        [ngClass]="isProcessing ? 'opacity-50 cursor-not-allowed' : ''"
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black transition-colors">
                  {{ isProcessing ? ('common.loading' | translate) : ('payment.confirmPayment' | translate) }}
                </button>
              </div>
            </div>

            <!-- Step 4: Payment Result -->
            <div *ngIf="currentStep === 4" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
              <div *ngIf="paymentSuccess" class="space-y-6">
                <div class="text-6xl">✅</div>
                <p class="text-3xl font-black text-green-600">{{ 'payment.paymentSuccessful' | translate }}</p>
                <p class="text-gray-600 font-bold">{{ 'payment.transactionID' | translate }}: <span class="text-gray-900 font-black">{{ transactionId }}</span></p>
                <button (click)="downloadReceipt()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black transition-colors">
                  📄 {{ 'payment.downloadInvoice' | translate }}
                </button>
              </div>

              <div *ngIf="!paymentSuccess" class="space-y-6">
                <div class="text-6xl">❌</div>
                <p class="text-3xl font-black text-red-600">{{ 'payment.paymentFailed' | translate }}</p>
                <p class="text-gray-700 font-bold">{{ paymentError }}</p>
                <button (click)="previousStep()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black transition-colors">
                  {{ 'common.tryAgain' | translate }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Order Summary Sidebar -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
            <h3 class="text-xl font-black text-gray-900 mb-6">{{ 'payment.orderSummary' | translate }}</h3>
            
            <div class="space-y-4 mb-8 pb-8 border-b border-gray-200">
              <div *ngFor="let item of orderItems" class="flex justify-between items-start">
                <div>
                  <p class="font-black text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-600">x{{ item.quantity }}</p>
                </div>
                <p class="font-bold text-gray-900">{{ item.price * item.quantity }} {{ currency }}</p>
              </div>
            </div>

            <div class="space-y-3 mb-8">
              <div class="flex justify-between">
                <span class="text-gray-700 font-bold">{{ 'payment.subtotal' | translate }}:</span>
                <span class="font-black text-gray-900">{{ subtotal }} {{ currency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700 font-bold">{{ 'payment.tax' | translate }}:</span>
                <span class="font-black text-gray-900">{{ tax }} {{ currency }}</span>
              </div>
              <div *ngIf="discount > 0" class="flex justify-between text-green-600">
                <span class="font-bold">{{ 'payment.discount' | translate }}:</span>
                <span class="font-black">-{{ discount }} {{ currency }}</span>
              </div>
            </div>

            <div class="p-4 bg-blue-50 rounded-2xl mb-8">
              <div class="flex justify-between items-center">
                <span class="text-lg font-black text-blue-900">{{ 'payment.total' | translate }}:</span>
                <span class="text-2xl font-black text-blue-600">{{ orderTotal }} {{ currency }}</span>
              </div>
            </div>

            <!-- Promo Code Section -->
            <div class="mb-6">
              <p class="text-sm font-black text-gray-900 mb-2">{{ 'payment.applyCode' | translate }}</p>
              <div class="flex gap-2">
                <input 
                  [(ngModel)]="promoCode"
                  placeholder="PROMO2026"
                  class="flex-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-bold">
                <button (click)="validatePromo()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-black transition-colors">
                  ✓
                </button>
              </div>
            </div>

            <!-- Security Badge -->
            <div class="p-4 bg-gray-50 rounded-2xl text-center">
              <p class="text-xs text-gray-600 font-bold">🔒 {{ 'payment.secure' | translate }}</p>
              <p class="text-xs text-gray-500 font-bold">{{ 'payment.ssl' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CheckoutComponent implements OnInit {
  orderItems: OrderItem[] = [
    { id: '1', name: 'Premium Wireless Headphones', price: 450, quantity: 1, image: '🎧' },
    { id: '2', name: 'Phone Case & Screen Protector', price: 120, quantity: 1, image: '📱' },
    { id: '3', name: 'Fast Charger Cable', price: 80, quantity: 2, image: '⚡' }
  ];

  currentStep = 1;
  checkoutSteps = [
    'payment.orderSummary',
    'payment.selectPaymentMethod',
    'payment.enterCardDetails',
    'payment.paymentConfirmation'
  ];

  selectedPaymentMethod: PaymentMethod | null = null;
  paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'credit_card',
      name: 'Visa •••• 4242',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'debit_card',
      name: 'Mastercard •••• 5555',
      lastFour: '5555',
      expiryDate: '08/26',
      isDefault: false
    }
  ];

  cardData = {
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  };

  saveCardForFuture = false;
  showNewCardForm = false;
  useWallet = false;
  walletBalance = 2500;
  currency = 'EGP';
  promoCode = '';
  discount = 0;

  isProcessing = false;
  paymentSuccess = false;
  paymentError = '';
  transactionId = '';

  isCardValid = false;

  constructor(
    private paymentService: PaymentService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.selectedPaymentMethod = this.paymentMethods[0];
  }

  get subtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.14 * 100) / 100;
  }

  get orderTotal(): number {
    return this.subtotal + this.tax - this.discount;
  }

  nextStep() {
    if (this.currentStep < this.checkoutSteps.length) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    this.useWallet = false;
  }

  selectWalletPayment() {
    this.useWallet = true;
    this.selectedPaymentMethod = null;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    this.cardData.cardNumber = formatted;
    this.isCardValid = this.paymentService.validateCard({
      ...this.cardData,
      cardNumber: value
    });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardData.expiryDate = value;
  }

  validatePromo() {
    this.paymentService.validatePromoCode(this.promoCode, this.subtotal).subscribe({
      next: (result) => {
        this.discount = result.discountAmount || 0;
        alert('✅ Promo applied! Discount: ' + this.discount + ' ' + this.currency);
      },
      error: () => {
        alert('❌ Invalid promo code');
        this.promoCode = '';
      }
    });
  }

  processPayment() {
    if (!this.isCardValid) {
      alert('❌ Invalid card number');
      return;
    }

    this.isProcessing = true;

    this.paymentService.processCardPayment(
      this.cardData,
      this.orderTotal,
      'ORD-' + Date.now(),
      this.currency
    ).subscribe({
      next: (transaction) => {
        this.paymentSuccess = true;
        this.transactionId = transaction.id;
        this.currentStep = 4;
        this.isProcessing = false;
      },
      error: (error) => {
        this.paymentSuccess = false;
        this.paymentError = error.error?.message || 'Payment processing failed';
        this.currentStep = 4;
        this.isProcessing = false;
      }
    });
  }

  processWalletPayment() {
    this.isProcessing = true;

    this.paymentService.payFromWallet(
      this.orderTotal,
      'ORD-' + Date.now(),
      'Purchase from marketplace'
    ).subscribe({
      next: (transaction) => {
        this.paymentSuccess = true;
        this.transactionId = transaction.id;
        this.currentStep = 4;
        this.isProcessing = false;
      },
      error: (error) => {
        this.paymentSuccess = false;
        this.paymentError = error.error?.message || 'Wallet payment failed';
        this.currentStep = 4;
        this.isProcessing = false;
      }
    });
  }

  downloadReceipt() {
    this.paymentService.downloadReceipt(this.transactionId);
  }
}
