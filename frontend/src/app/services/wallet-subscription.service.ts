import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Membership Tier Structure
 */
export enum MembershipTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  PHARAOH = 'pharaoh'
}

export interface MembershipBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface MembershipTierInfo {
  tier: MembershipTier;
  displayName: string;
  minSpent: number;
  maxSpent: number;
  color: string;
  goldRewardRate: number; // % cashback
  discountPercentage: number;
  benefits: MembershipBenefit[];
  businessDays: number; // Expedited shipping days
}

/**
 * Wallet Structure
 */
export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'reward' | 'refund' | 'cashback';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
  referenceNumber?: string;
}

/**
 * Subscription Plan
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number;
  annualPrice: number;
  tier: MembershipTier;
  features: string[];
  perks: string[];
  cancelable: boolean;
}

/**
 * User Subscription
 */
export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  renewalDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  autoRenew: boolean;
  paymentMethod: string;
}

/**
 * Rewards Program
 */
export interface RewardsProgram {
  userId: string;
  totalPointsEarned: number;
  currentPoints: number;
  tier: MembershipTier;
  nextTierThreshold: number;
  redeemableRewards: number;
}

/**
 * Referral Program
 */
export interface ReferralReward {
  referrerId: string;
  refereeId: string;
  bonusAmount: number;
  status: 'pending' | 'completed';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WalletSubscriptionService {
  private apiUrl = 'http://localhost:3000/api';

  // Observable Subjects
  private walletBalance$ = new BehaviorSubject<WalletBalance | null>(null);
  private subscription$ = new BehaviorSubject<UserSubscription | null>(null);
  private rewards$ = new BehaviorSubject<RewardsProgram | null>(null);
  private transactions$ = new BehaviorSubject<WalletTransaction[]>([]);

  // Membership Tiers Configuration
  private readonly membershipTiers: Map<MembershipTier, MembershipTierInfo> = new Map([
    [MembershipTier.BRONZE, {
      tier: MembershipTier.BRONZE,
      displayName: 'Bronze Member',
      minSpent: 0,
      maxSpent: 499,
      color: '#CD7F32',
      goldRewardRate: 1,
      discountPercentage: 2,
      businessDays: 5,
      benefits: [
        { id: '1', name: 'Welcome Bonus', description: '50 EGP on signup', icon: '🎁' },
        { id: '2', name: 'Free Shipping', description: 'On orders over 200 EGP', icon: '🚚' },
        { id: '3', name: 'Birthday Discount', description: '10% off in birthday month', icon: '🎂' }
      ]
    }],
    [MembershipTier.SILVER, {
      tier: MembershipTier.SILVER,
      displayName: 'Silver Member',
      minSpent: 500,
      maxSpent: 1499,
      color: '#C0C0C0',
      goldRewardRate: 1.5,
      discountPercentage: 5,
      businessDays: 3,
      benefits: [
        { id: '1', name: 'Welcome Bonus', description: '150 EGP on tier upgrade', icon: '✨' },
        { id: '2', name: 'Free Shipping', description: 'On all orders', icon: '🚚' },
        { id: '3', name: 'Early Access', description: 'Flash sales 1 hour early', icon: '⏰' },
        { id: '4', name: 'Priority Support', description: 'Dedicated support', icon: '📞' }
      ]
    }],
    [MembershipTier.GOLD, {
      tier: MembershipTier.GOLD,
      displayName: 'Gold Member',
      minSpent: 1500,
      maxSpent: 4999,
      color: '#D4AF37',
      goldRewardRate: 2,
      discountPercentage: 8,
      businessDays: 2,
      benefits: [
        { id: '1', name: 'Welcome Bonus', description: '500 EGP on tier upgrade', icon: '👑' },
        { id: '2', name: 'Free Shipping', description: 'Express shipping included', icon: '🚀' },
        { id: '3', name: 'VIP Events', description: 'Exclusive product launches', icon: '🎭' },
        { id: '4', name: 'Personal Shopper', description: 'AI-powered recommendations', icon: '🧠' },
        { id: '5', name: 'Concierge Support', description: '24/7 premium support', icon: '🎀' }
      ]
    }],
    [MembershipTier.PLATINUM, {
      tier: MembershipTier.PLATINUM,
      displayName: 'Platinum Member',
      minSpent: 5000,
      maxSpent: 9999,
      color: '#E5E4E2',
      goldRewardRate: 3,
      discountPercentage: 12,
      businessDays: 1,
      benefits: [
        { id: '1', name: 'Welcome Bonus', description: '1,500 EGP on tier upgrade', icon: '💎' },
        { id: '2', name: 'Worldwide Shipping', description: 'Free express shipping', icon: '✈️' },
        { id: '3', name: 'Private Shopping', description: 'Exclusive collections access', icon: '🏪' },
        { id: '4', name: 'Concierge Service', description: 'Personal shopping assistant', icon: '👔' },
        { id: '5', name: 'Lounge Access', description: 'VIP lounge at select locations', icon: '🏨' },
        { id: '6', name: 'Birthday Treat', description: '20% off entire month', icon: '🎂' }
      ]
    }],
    [MembershipTier.PHARAOH, {
      tier: MembershipTier.PHARAOH,
      displayName: 'Pharaoh Member',
      minSpent: 10000,
      maxSpent: Infinity,
      color: '#D4AF37',
      goldRewardRate: 5,
      discountPercentage: 20,
      businessDays: 0,
      benefits: [
        { id: '1', name: 'Unlimited Welcome', description: '5,000 EGP annual bonus', icon: '👑' },
        { id: '2', name: 'White Glove Service', description: 'Dedicated concierge team', icon: '🤝' },
        { id: '3', name: 'Private Auctions', description: 'Access to rare items', icon: '🎨' },
        { id: '4', name: 'Custom Experiences', description: 'Bespoke shopping experiences', icon: '🎪' },
        { id: '5', name: 'Priority Everything', description: 'Priority support & delivery', icon: '⭐' },
        { id: '6', name: 'Lifetime Warranty', description: 'On all luxury items', icon: '🛡️' },
        { id: '7', name: 'Exclusive Events', description: 'Monthly private events', icon: '🎯' }
      ]
    }]
  ]);

  // Subscription Plans
  private readonly subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly-basic',
      name: 'monthly_basic',
      displayName: 'Monthly - Silver Benefits',
      monthlyPrice: 49,
      annualPrice: 0,
      tier: MembershipTier.SILVER,
      features: ['5% discount on all orders', 'Free shipping', 'Early access to sales'],
      perks: ['2x rewards on purchases', 'Monthly gift bonus'],
      cancelable: true
    },
    {
      id: 'monthly-premium',
      name: 'monthly_premium',
      displayName: 'Monthly - Gold Benefits',
      monthlyPrice: 99,
      annualPrice: 0,
      tier: MembershipTier.GOLD,
      features: ['8% discount on all orders', 'Express shipping', 'VIP events access'],
      perks: ['3x rewards on purchases', 'Weekly gift bonuses', 'Personal shopper'],
      cancelable: true
    },
    {
      id: 'annual-premium',
      name: 'annual_premium',
      displayName: 'Annual - Platinum Benefits',
      monthlyPrice: 0,
      annualPrice: 999,
      tier: MembershipTier.PLATINUM,
      features: ['12% discount on all orders', 'Worldwide shipping', 'Private shopping'],
      perks: ['5x rewards on purchases', 'Concierge service', 'Lounge access'],
      cancelable: true
    },
    {
      id: 'annual-elite',
      name: 'annual_elite',
      displayName: 'Annual - Pharaoh Benefits',
      monthlyPrice: 0,
      annualPrice: 2499,
      tier: MembershipTier.PHARAOH,
      features: ['20% discount on all orders', 'White glove service', 'Private auctions'],
      perks: ['5% cashback', 'Dedicated concierge', 'Exclusive events'],
      cancelable: false // Premium tier can't cancel easily
    }
  ];

  constructor(private http: HttpClient) {
    this.initializeWallet();
  }

  /**
   * Initialize wallet on service creation
   */
  private initializeWallet(): void {
    // Will be called after authentication
  }

  /**
   * Get wallet balance observable
   */
  getWalletBalance(): Observable<WalletBalance | null> {
    return this.walletBalance$.asObservable();
  }

  /**
   * Get wallet balance value
   */
  getWalletBalanceValue(): WalletBalance | null {
    return this.walletBalance$.getValue();
  }

  /**
   * Load wallet from backend
   */
  loadWallet(): void {
    this.http.get<any>(`${this.apiUrl}/wallet/balance`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).subscribe({
      next: (response) => {
        this.walletBalance$.next(response.data);
      },
      error: (error) => console.error('Failed to load wallet:', error)
    });
  }

  /**
   * Add funds to wallet
   */
  addFundsToWallet(amount: number, paymentMethod: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/add-funds`, {
      amount,
      paymentMethod
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Withdraw from wallet
   */
  withdrawFromWallet(amount: number, bankAccount: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/withdraw`, {
      amount,
      bankAccount
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get wallet transactions
   */
  getWalletTransactions(limit: number = 50): Observable<WalletTransaction[]> {
    return this.http.get<any>(`${this.apiUrl}/wallet/transactions?limit=${limit}`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get membership tier
   */
  getMembershipTier(): MembershipTier {
    const rewards = this.rewards$.getValue();
    return rewards?.tier || MembershipTier.BRONZE;
  }

  /**
   * Get membership tier info
   */
  getMembershipTierInfo(tier: MembershipTier): MembershipTierInfo | undefined {
    return this.membershipTiers.get(tier);
  }

  /**
   * Get all membership tiers
   */
  getAllMembershipTiers(): MembershipTierInfo[] {
    return Array.from(this.membershipTiers.values());
  }

  /**
   * Get rewards program
   */
  getRewardsProgram(): Observable<RewardsProgram | null> {
    return this.rewards$.asObservable();
  }

  /**
   * Load rewards from backend
   */
  loadRewards(): void {
    this.http.get<any>(`${this.apiUrl}/rewards/program`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).subscribe({
      next: (response) => {
        this.rewards$.next(response.data);
      },
      error: (error) => console.error('Failed to load rewards:', error)
    });
  }

  /**
   * Redeem rewards points
   */
  redeemRewards(points: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rewards/redeem`, {
      points
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.subscriptionPlans;
  }

  /**
   * Get current subscription
   */
  getCurrentSubscription(): Observable<UserSubscription | null> {
    return this.subscription$.asObservable();
  }

  /**
   * Load subscription from backend
   */
  loadSubscription(): void {
    this.http.get<any>(`${this.apiUrl}/subscription/current`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).subscribe({
      next: (response) => {
        this.subscription$.next(response.data);
      },
      error: (error) => console.error('Failed to load subscription:', error)
    });
  }

  /**
   * Subscribe to a plan
   */
  subscribeToPlan(planId: string, paymentMethod: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscription/subscribe`, {
      planId,
      paymentMethod
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscription/cancel`, {
      reason
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Pause subscription
   */
  pauseSubscription(months: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscription/pause`, {
      months
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get referral rewards
   */
  getReferralRewards(): Observable<ReferralReward[]> {
    return this.http.get<any>(`${this.apiUrl}/referral/rewards`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Share referral link
   */
  shareReferralLink(): Observable<{ referralCode: string; referralLink: string }> {
    return this.http.post<any>(`${this.apiUrl}/referral/generate-link`, {}, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Apply referral code
   */
  applyReferralCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/referral/apply`, {
      code
    }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get tier-specific benefits
   */
  getTierBenefits(tier: MembershipTier): MembershipBenefit[] {
    return this.membershipTiers.get(tier)?.benefits || [];
  }

  /**
   * Calculate discount for tier
   */
  calculateDiscount(tier: MembershipTier, amount: number): number {
    const tierInfo = this.membershipTiers.get(tier);
    if (!tierInfo) return 0;
    return (amount * tierInfo.discountPercentage) / 100;
  }

  /**
   * Calculate rewards earned
   */
  calculateRewardsEarned(tier: MembershipTier, amount: number): number {
    const tierInfo = this.membershipTiers.get(tier);
    if (!tierInfo) return 0;
    return (amount * tierInfo.goldRewardRate) / 100;
  }

  /**
   * Get next tier threshold
   */
  getNextTierThreshold(currentTier: MembershipTier): number | null {
    const tiers = Array.from(this.membershipTiers.values())
      .sort((a, b) => a.minSpent - b.minSpent);
    
    const currentIndex = tiers.findIndex(t => t.tier === currentTier);
    if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;
    
    return tiers[currentIndex + 1].minSpent;
  }
}
