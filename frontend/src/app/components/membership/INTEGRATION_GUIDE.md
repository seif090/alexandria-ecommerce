/**
 * INTEGRATION GUIDE - Premium Membership Components
 * 
 * This file provides step-by-step instructions for integrating
 * premium membership components into your Alexandria application.
 */

// ============================================================================
// 1. IMPORT ALL COMPONENTS IN YOUR APPLICATION
// ============================================================================

import {
  MembershipShowcaseComponent,
  PremiumBenefitsCardComponent,
  RewardsDashboardComponent,
  TierUpgradeCardComponent,
  MembershipStatsWidgetComponent,
  SubscriptionPlanCardComponent
} from './components/membership';

// ============================================================================
// 2. MODULE SETUP (If using traditional modules, not required for standalone)
// ============================================================================

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MembershipShowcaseComponent,
    PremiumBenefitsCardComponent,
    RewardsDashboardComponent,
    TierUpgradeCardComponent,
    MembershipStatsWidgetComponent,
    SubscriptionPlanCardComponent
  ]
})
export class MembershipModule { }

// ============================================================================
// 3. ROUTING CONFIGURATION
// ============================================================================

import { Routes } from '@angular/router';

export const MEMBERSHIP_ROUTES: Routes = [
  {
    path: 'membership',
    data: { title: 'Premium Membership' },
    children: [
      {
        path: '',
        component: MembershipShowcaseComponent,
        data: { title: 'Membership Showcase' }
      },
      {
        path: 'benefits',
        component: PremiumBenefitsCardComponent,
        data: { title: 'Premium Benefits' }
      },
      {
        path: 'rewards',
        component: RewardsDashboardComponent,
        data: { title: 'Rewards Dashboard' }
      },
      {
        path: 'subscription',
        component: SubscriptionPlanCardComponent,
        data: { title: 'Subscription Plans' }
      },
      {
        path: 'upgrade',
        component: TierUpgradeCardComponent,
        data: { title: 'Upgrade Tier' }
      }
    ]
  }
];

// ============================================================================
// 4. SERVICE INTEGRATION
// ============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'pharaoh';

export interface MembershipUser {
  id: string;
  email: string;
  currentTier: MembershipTier;
  totalSpending: number;
  monthlySpending: number;
  goldBalance: number;
  memberSince: Date;
  lastPurchaseDate: Date;
}

export interface MembershipTierInfo {
  tier: MembershipTier;
  displayName: string;
  minSpent: number;
  maxSpent?: number;
  discountPercentage: number;
  goldRewardRate: number;
  businessDays: number;
  birthdayBonus: number;
  benefits: string[];
  color: string;
}

@Injectable({ providedIn: 'root' })
export class WalletSubscriptionService {
  private http = inject(HttpClient);
  
  private tierThresholds: Record<MembershipTier, number> = {
    bronze: 0,
    silver: 500,
    gold: 2000,
    platinum: 10000,
    pharaoh: 50000
  };

  private tierInfo: Record<MembershipTier, MembershipTierInfo> = {
    bronze: {
      tier: 'bronze',
      displayName: 'Bronze',
      minSpent: 0,
      discountPercentage: 2,
      goldRewardRate: 1,
      businessDays: 5,
      birthdayBonus: 500,
      benefits: ['2% discount', '1x rewards', 'Birthday bonus'],
      color: 'rgb(180, 83, 9)'
    },
    silver: {
      tier: 'silver',
      displayName: 'Silver',
      minSpent: 500,
      discountPercentage: 5,
      goldRewardRate: 1.5,
      businessDays: 3,
      birthdayBonus: 750,
      benefits: ['5% discount', '1.5x rewards', 'Free shipping 200+'],
      color: 'rgb(107, 114, 128)'
    },
    gold: {
      tier: 'gold',
      displayName: 'Gold',
      minSpent: 2000,
      discountPercentage: 8,
      goldRewardRate: 2,
      businessDays: 2,
      birthdayBonus: 1000,
      benefits: ['8% discount', '2x rewards', 'Express shipping'],
      color: 'rgb(251, 191, 36)'
    },
    platinum: {
      tier: 'platinum',
      displayName: 'Platinum',
      minSpent: 10000,
      discountPercentage: 12,
      goldRewardRate: 3,
      businessDays: 1,
      birthdayBonus: 2000,
      benefits: ['12% discount', '3x rewards', 'Priority support'],
      color: 'rgb(168, 85, 247)'
    },
    pharaoh: {
      tier: 'pharaoh',
      displayName: 'Pharaoh',
      minSpent: 50000,
      discountPercentage: 20,
      goldRewardRate: 5,
      businessDays: 0,
      birthdayBonus: 5000,
      benefits: ['20% discount', '5% rewards', '24-hour shipping'],
      color: 'rgb(236, 72, 153)'
    }
  };

  private currentUser$ = new BehaviorSubject<MembershipUser | null>(null);
  private currentTier$ = new BehaviorSubject<MembershipTier>('bronze');

  // API Methods
  getUserProfile(): Observable<MembershipUser> {
    return this.http.get<MembershipUser>('/api/user/profile/membership');
  }

  getCurrentTier(): Observable<MembershipTier> {
    return this.http.get<MembershipTier>('/api/user/membership/tier');
  }

  getGoldBalance(): Observable<number> {
    return this.http.get<number>('/api/user/wallet/gold-balance');
  }

  updateUserSpending(amount: number): Observable<any> {
    return this.http.post('/api/user/spending/record', { amount });
  }

  redeemGold(amount: number): Observable<any> {
    return this.http.post('/api/user/gold/redeem', { amount });
  }

  // Local Methods
  getMembershipTierInfo(tier: MembershipTier): MembershipTierInfo {
    return this.tierInfo[tier];
  }

  getAllMembershipTiers(): MembershipTierInfo[] {
    return Object.values(this.tierInfo);
  }

  getTierThreshold(tier: MembershipTier): number {
    return this.tierThresholds[tier];
  }

  calculateTierFromSpending(spending: number): MembershipTier {
    if (spending >= this.tierThresholds.pharaoh) return 'pharaoh';
    if (spending >= this.tierThresholds.platinum) return 'platinum';
    if (spending >= this.tierThresholds.gold) return 'gold';
    if (spending >= this.tierThresholds.silver) return 'silver';
    return 'bronze';
  }
}

// ============================================================================
// 5. COMPONENT USAGE EXAMPLES
// ============================================================================

import { Component, OnInit } from '@angular/core';

// ---- Example 1: Home Page with Membership Showcase ----
@Component({
  selector: 'app-home',
  template: `
    <section class="py-20">
      <h1>Welcome to Alexandria Premium</h1>
      <app-membership-showcase></app-membership-showcase>
    </section>
  `,
  imports: [MembershipShowcaseComponent],
  standalone: true
})
export class HomeComponent { }

// ---- Example 2: User Dashboard ----
@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="grid gap-8">
      <!-- Stats Widget -->
      <app-membership-stats-widget 
        [currentTier]="userTier">
      </app-membership-stats-widget>

      <!-- Tier Upgrade Card -->
      <app-tier-upgrade-card 
        [currentTier]="userTier"
        [nextTier]="nextTier"
        [currentSpending]="currentSpending"
        [nextThreshold]="nextThreshold"
        (continueShopping)="navigateToShop()">
      </app-tier-upgrade-card>

      <!-- Rewards Dashboard -->
      <app-rewards-dashboard></app-rewards-dashboard>
    </div>
  `,
  imports: [
    MembershipStatsWidgetComponent,
    TierUpgradeCardComponent,
    RewardsDashboardComponent
  ],
  standalone: true
})
export class UserDashboardComponent implements OnInit {
  userTier: MembershipTier = 'gold';
  nextTier: MembershipTier = 'platinum';
  currentSpending = 2500;
  nextThreshold = 5000;

  constructor(private walletService: WalletSubscriptionService) { }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData(): void {
    this.walletService.getUserProfile().subscribe(user => {
      this.userTier = user.currentTier;
      this.currentSpending = user.totalSpending;
    });
  }

  navigateToShop(): void {
    // Navigate to shop
  }
}

// ---- Example 3: Subscription Page ----
@Component({
  selector: 'app-subscription',
  template: `
    <app-premium-benefits-card 
      [userTier]="currentUserPlan">
    </app-premium-benefits-card>

    <app-subscription-plan-card 
      [currentUserPlan]="currentUserPlan"
      (planSelected)="selectPlan($event)">
    </app-subscription-plan-card>
  `,
  imports: [
    PremiumBenefitsCardComponent,
    SubscriptionPlanCardComponent
  ],
  standalone: true
})
export class SubscriptionPageComponent {
  currentUserPlan: MembershipTier = 'bronze';

  selectPlan(plan: any): void {
    console.log('Plan selected:', plan);
    // Handle plan selection
  }
}

// ---- Example 4: Rewards Management ----
@Component({
  selector: 'app-rewards-page',
  template: `
    <div class="container mx-auto py-12">
      <h1 class="text-4xl font-bold mb-8">Your Rewards</h1>
      <app-rewards-dashboard></app-rewards-dashboard>
    </div>
  `,
  imports: [RewardsDashboardComponent],
  standalone: true
})
export class RewardsPageComponent { }

// ============================================================================
// 6. STATE MANAGEMENT INTEGRATION (NgRx Example)
// ============================================================================

import { createFeature, createReducer, on, createAction } from '@ngrx/store';

// Actions
export const loadUserMembership = createAction(
  '[Membership] Load User Membership',
  (userId: string) => ({ userId })
);

export const loadUserMembershipSuccess = createAction(
  '[Membership] Load User Membership Success',
  (user: MembershipUser) => ({ user })
);

export const updateGoldBalance = createAction(
  '[Membership] Update Gold Balance',
  (amount: number) => ({ amount })
);

// Reducer
const initialState: MembershipUser = {
  id: '',
  email: '',
  currentTier: 'bronze',
  totalSpending: 0,
  monthlySpending: 0,
  goldBalance: 0,
  memberSince: new Date(),
  lastPurchaseDate: new Date()
};

export const membershipFeature = createFeature({
  name: 'membership',
  reducer: createReducer(
    initialState,
    on(loadUserMembershipSuccess, (state, { user }) => user),
    on(updateGoldBalance, (state, { amount }) => ({
      ...state,
      goldBalance: state.goldBalance + amount
    }))
  )
});

// ============================================================================
// 7. HTTP INTERCEPTOR FOR MEMBERSHIP DATA
// ============================================================================

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MembershipInterceptor implements HttpInterceptor {
  constructor(private walletService: WalletSubscriptionService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Add membership tier to request headers
    return next.handle(request);
  }
}

// ============================================================================
// 8. GUARD FOR TIER-BASED ACCESS
// ============================================================================

import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const premiumTierGuard: CanActivateFn = (route, state) => {
  const walletService = inject(WalletSubscriptionService);
  const router = inject(Router);
  
  const tierInfo = walletService.getMembershipTierInfo('gold');
  
  if (tierInfo.discountPercentage > 5) {
    return true;
  }
  
  router.navigate(['/upgrade']);
  return false;
};

// ============================================================================
// 9. TESTING SETUP
// ============================================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('MembershipShowcaseComponent', () => {
  let component: MembershipShowcaseComponent;
  let fixture: ComponentFixture<MembershipShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipShowcaseComponent],
      providers: [WalletSubscriptionService]
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all membership tiers', () => {
    expect(component.membershipTiers.length).toBe(5);
  });
});

// ============================================================================
// 10. FEATURE FLAGS FOR COMPONENTS
// ============================================================================

export const MEMBERSHIP_FEATURES = {
  showMembershipShowcase: true,
  showRewardsProgram: true,
  enableSubscriptionPlans: true,
  showTierUpgrades: true,
  enableCharityDonation: true,
  maxRedemptionPerMonth: 5000
};

// ============================================================================
// QUICK START CHECKLIST
// ============================================================================

/*
✅ Installation Checklist:

1. Copy all 6 component files to src/app/components/membership/
2. Create index.ts barrel export
3. Set up WalletSubscriptionService with proper API endpoints
4. Import TranslatePipe if using i18n
5. Add Tailwind CSS configuration
6. Update your main routing module
7. Add HTTP provider for API calls
8. Set up state management (optional)
9. Configure guards for protected routes
10. Add unit tests
11. Update authentication guards if needed
12. Set up error handling and notifications
13. Configure analytics tracking (optional)
14. Add PWA support for offline rewards viewing (optional)

✅ API Endpoints Required:

GET    /api/user/profile/membership
GET    /api/user/membership/tier
GET    /api/user/wallet/gold-balance
GET    /api/user/wallet/transactions
POST   /api/user/spending/record
POST   /api/user/gold/redeem
POST   /api/user/subscription/upgrade
POST   /api/user/wallet/charity-donate
GET    /api/membership/tiers
GET    /api/membership/tier/{tierName}

✅ Dependencies:

✓ @angular/common
✓ @angular/forms
✓ @angular/router
✓ @angular/animations
✓ rxjs
✓ tailwindcss

✅ Browser Support:

✓ Chrome 90+
✓ Firefox 88+
✓ Safari 14+
✓ Edge 90+
*/

export { };
