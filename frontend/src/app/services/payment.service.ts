import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'wallet' | 'bank_transfer';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Card {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  paymentMethod: PaymentMethod;
  timestamp: string;
  receiptUrl?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  createdAt: string;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  reason: 'purchase' | 'refund' | 'bonus' | 'transfer';
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payment';
  private paymentMethods$ = new BehaviorSubject<PaymentMethod[]>([]);
  private wallet$ = new BehaviorSubject<Wallet | null>(null);
  private transactions$ = new BehaviorSubject<Transaction[]>([]);

  constructor(private http: HttpClient) {
    this.initializePaymentMethods();
    this.loadWallet();
  }

  // ============ Payment Methods ============
  private initializePaymentMethods(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<PaymentMethod[]>(`${this.apiUrl}/methods`, {
        headers: { 'x-auth-token': token }
      }).subscribe(methods => this.paymentMethods$.next(methods));
    }
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$.asObservable();
  }

  addPaymentMethod(method: PaymentMethod): Observable<PaymentMethod> {
    const token = localStorage.getItem('token') || '';
    return this.http.post<PaymentMethod>(`${this.apiUrl}/methods`, method, {
      headers: { 'x-auth-token': token }
    }).pipe(tap(newMethod => {
      const current = this.paymentMethods$.value;
      this.paymentMethods$.next([...current, newMethod]);
    }));
  }

  deletePaymentMethod(methodId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.delete(`${this.apiUrl}/methods/${methodId}`, {
      headers: { 'x-auth-token': token }
    }).pipe(tap(() => {
      const current = this.paymentMethods$.value.filter(m => m.id !== methodId);
      this.paymentMethods$.next(current);
    }));
  }

  setDefaultPaymentMethod(methodId: string): Observable<PaymentMethod> {
    const token = localStorage.getItem('token') || '';
    return this.http.put<PaymentMethod>(`${this.apiUrl}/methods/${methodId}/default`, {}, {
      headers: { 'x-auth-token': token }
    });
  }

  // ============ Card Processing (Stripe-like) ============
  processCardPayment(card: Card, amount: number, orderId: string, currency: string = 'EGP'): Observable<Transaction> {
    const token = localStorage.getItem('token') || '';
    
    // Encrypt sensitive data before sending
    const encryptedCard = this.encryptCardData(card);
    
    return this.http.post<Transaction>(`${this.apiUrl}/charge/card`, {
      card: encryptedCard,
      amount,
      orderId,
      currency,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    }).pipe(tap(transaction => {
      this.addToTransactionHistory(transaction);
    }));
  }

  validateCard(card: Card): boolean {
    // Luhn algorithm for card validation
    const cardNumber = card.cardNumber.replace(/\D/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) return false;

    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  private encryptCardData(card: Card): any {
    // Mock encryption (in production, use proper encryption like libsodium or TweetNaCl)
    return {
      cardNumber: this.maskCardNumber(card.cardNumber),
      cardholderName: card.cardholderName,
      expiryDate: card.expiryDate,
      cvv: '***' // Never send actual CVV
    };
  }

  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
  }

  // ============ Wallet Management ============
  loadWallet(): void {
    const token = localStorage.getItem('token') || '';
    if (token) {
      this.http.get<Wallet>(`${this.apiUrl}/wallet`, {
        headers: { 'x-auth-token': token }
      }).subscribe(wallet => this.wallet$.next(wallet));
    }
  }

  getWallet(): Observable<Wallet | null> {
    return this.wallet$.asObservable();
  }

  preloadWallet(amount: number, paymentMethod: PaymentMethod): Observable<Transaction> {
    const token = localStorage.getItem('token') || '';
    return this.http.post<Transaction>(`${this.apiUrl}/wallet/preload`, {
      amount,
      paymentMethod,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    }).pipe(tap(transaction => {
      this.loadWallet();
      this.addToTransactionHistory(transaction);
    }));
  }

  payFromWallet(amount: number, orderId: string, description: string = ''): Observable<Transaction> {
    const token = localStorage.getItem('token') || '';
    return this.http.post<Transaction>(`${this.apiUrl}/wallet/pay`, {
      amount,
      orderId,
      description,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    }).pipe(tap(transaction => {
      this.loadWallet();
      this.addToTransactionHistory(transaction);
    }));
  }

  // ============ Bank Transfer ============
  initiateBankTransfer(amount: number, orderId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.apiUrl}/bank-transfer/initiate`, {
      amount,
      orderId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    });
  }

  getBankTransferDetails(): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${this.apiUrl}/bank-transfer/details`, {
      headers: { 'x-auth-token': token }
    });
  }

  // ============ Transaction History ============
  getTransactionHistory(): Observable<Transaction[]> {
    return this.transactions$.asObservable();
  }

  loadTransactionHistory(): void {
    const token = localStorage.getItem('token') || '';
    if (token) {
      this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, {
        headers: { 'x-auth-token': token }
      }).subscribe(transactions => this.transactions$.next(transactions));
    }
  }

  private addToTransactionHistory(transaction: Transaction): void {
    const current = this.transactions$.value;
    this.transactions$.next([transaction, ...current]);
  }

  getTransaction(transactionId: string): Observable<Transaction> {
    const token = localStorage.getItem('token') || '';
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${transactionId}`, {
      headers: { 'x-auth-token': token }
    });
  }

  // ============ Refunds ============
  requestRefund(transactionId: string, reason: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.apiUrl}/refunds`, {
      transactionId,
      reason,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    });
  }

  getRefundStatus(refundId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${this.apiUrl}/refunds/${refundId}`, {
      headers: { 'x-auth-token': token }
    });
  }

  // ============ Invoice & Receipt ============
  generateInvoice(transactionId: string): Observable<Blob> {
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${this.apiUrl}/invoice/${transactionId}`, {
      headers: { 'x-auth-token': token },
      responseType: 'blob'
    }) as Observable<Blob>;
  }

  downloadReceipt(transactionId: string): void {
    this.generateInvoice(transactionId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${transactionId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // ============ Payment Verification ============
  verifyPayment(transactionId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.apiUrl}/verify`, {
      transactionId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    });
  }

  // ============ Discount & Promo Codes ============
  validatePromoCode(code: string, amount: number): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.apiUrl}/promo/validate`, {
      code,
      amount,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    });
  }

  applyPromoCode(code: string, orderId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.apiUrl}/promo/apply`, {
      code,
      orderId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'x-auth-token': token }
    });
  }
}
