# Premium Membership UI Components

Comprehensive Angular 18+ standalone components for premium membership showcase, rewards management, and subscription plans in the Alexandria multi-vendor ecommerce platform.

## 📋 Table of Contents

- [Components Overview](#components-overview)
- [Installation](#installation)
- [Component Details](#component-details)
- [Usage Examples](#usage-examples)
- [Styling & Theming](#styling--theming)
- [API Integration](#api-integration)
- [Best Practices](#best-practices)

## 🎯 Components Overview

### 1. **MembershipShowcaseComponent**
Displays all membership tiers with benefits, rewards structure, and tier comparisons.

**Features:**
- 5-tier membership system visualization (Bronze, Silver, Gold, Platinum, Pharaoh)
- Interactive tier cards with hover effects
- Benefits comparison table
- Current membership status display
- Responsive grid layout (1-5 columns)

### 2. **PremiumBenefitsCardComponent**
Showcases individual premium benefits with detailed descriptions and value indicators.

**Features:**
- 6 main benefit cards with icons
- Tier-specific benefits sections
- Pharaoh tier exclusive showcase
- Step-by-step path to unlock benefits
- Smooth animations and transitions

### 3. **RewardsDashboardComponent**
Comprehensive dashboard for managing gold rewards and redemptions.

**Features:**
- Real-time gold balance tracking
- Pending and expiring rewards display
- Quick action buttons for earning more rewards
- Redemption options (vouchers, charity)
- Transaction history with filtering
- Status indicators (completed, pending, failed)

### 4. **TierUpgradeCardComponent**
Displays user's current tier and progress toward the next tier.

**Features:**
- Current tier display with achievements
- Visual progress bar to next tier
- Current vs upcoming benefits comparison
- Spending analytics
- Mobile-responsive design

### 5. **MembershipStatsWidgetComponent**
High-level statistics widgets for quick membership overview.

**Features:**
- 4 main stat cards (Tier, Spending, Gold, Perks)
- Animated entries with staggered delays
- Trending indicators
- Quick stats section
- Progress visualization

### 6. **SubscriptionPlanCardComponent**
Full subscription plan comparison and purchase interface.

**Features:**
- 5-tier subscription plan cards
- Monthly/Annual billing toggle with savings display
- Detailed comparison table
- Popular plan highlighting
- FAQ section with expandable items
- Dynamic pricing calculations

## 📦 Installation

### Prerequisites
- Angular 18+
- @angular/common
- @angular/forms
- @angular/router
- @angular/animations

### Setup

1. **Place components in your project:**
```
src/app/components/membership/
├── membership-showcase.component.ts
├── premium-benefits-card.component.ts
├── rewards-dashboard.component.ts
├── tier-upgrade-card.component.ts
├── membership-stats-widget.component.ts
└── subscription-plan-card.component.ts
```

2. **Import required services:**
```typescript
// Create/update wallet-subscription.service.ts
import { Injectable } from '@angular/core';

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'pharaoh';

export interface MembershipTierInfo {
  tier: MembershipTier;
  displayName: string;
  minSpent: number;
  discountPercentage: number;
  goldRewardRate: number;
  businessDays: number;
  birthdayBonus: number;
  benefits: string[];
  color: string;
}

export interface GoldTransaction {
  type: string;
  description: string;
  date: Date;
  amount: number;
  status: string;
  orderId: string;
}

@Injectable({ providedIn: 'root' })
export class WalletSubscriptionService {
  private tiers: MembershipTierInfo[] = [
    // ... tier definitions
  ];

  getAllMembershipTiers(): any[] { }
  getMembershipTierInfo(tier: MembershipTier): MembershipTierInfo | null { }
}
```

## 🔑 Component Details

### MembershipShowcaseComponent

**Inputs:**
- None (uses service data)

**Outputs:**
- Emits tier selection via `selectTier()` method

**Template Variables:**
```typescript
membershipTiers: any[] // from service
currentTierIndex: number = 2
currentTier: string = 'Gold'
comparisonFeatures: any[]
```

**Key Methods:**
```typescript
selectTier(tier: MembershipTier): void
```

**Styling:**
- Uses Tailwind CSS with custom gradients
- Alexandria theme colors (pharaonic gradient)
- Glassmorphism effects with backdrop blur

---

### RewardsDashboardComponent

**Inputs:**
- None

**Template Variables:**
```typescript
totalGold: number = 4230
pendingGold: number = 890
redeemedThisMonth: number = 1500
expiringGold: number = 245
tierLevel: number = 30
```

**Two-way Binding:**
```typescript
[(ngModel)]="charityAmount" // For charity donation input
```

**Key Methods:**
```typescript
loadUserRewards(): void
executeAction(action: RewardAction): void
getTransactionIcon(type: string): string
getStatusClass(status: string): string
```

**Features:**
- Real-time balance updates
- Transaction filtering
- Charity donation tracking
- Expiration warnings

---

### SubscriptionPlanCardComponent

**Inputs:**
```typescript
@Input() currentUserPlan: MembershipTier = 'bronze';
```

**Outputs:**
```typescript
@Output() planSelected = new EventEmitter<SubscriptionPlan>();
```

**State Management:**
```typescript
billingPeriod: 'monthly' | 'annual' = 'monthly'
subscriptionPlans: SubscriptionPlan[]
```

**Key Methods:**
```typescript
toggleBilling(): void
getCurrentPrice(plan: SubscriptionPlan): number
selectPlan(plan: SubscriptionPlan): void
toggleFAQ(faq: any): void
```

---

## 💻 Usage Examples

### Basic Page Setup

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { MembershipShowcaseComponent } from './components/membership/membership-showcase.component';
import { PremiumBenefitsCardComponent } from './components/membership/premium-benefits-card.component';

@Component({
  selector: 'app-root',
  template: `
    <app-membership-showcase></app-membership-showcase>
    <app-premium-benefits-card></app-premium-benefits-card>
  `,
  standalone: true,
  imports: [MembershipShowcaseComponent, PremiumBenefitsCardComponent]
})
export class AppComponent {}
```

### With User Data

```typescript
import { Component, OnInit } from '@angular/core';
import { TierUpgradeCardComponent } from './components/membership/tier-upgrade-card.component';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-membership-page',
  template: `
    <app-tier-upgrade-card 
      [currentTier]="userTier"
      [nextTier]="nextTier"
      [currentSpending]="currentSpending"
      [nextThreshold]="nextThreshold"
      (continueShopping)="navigateToShop()">
    </app-tier-upgrade-card>
  `,
  standalone: true,
  imports: [TierUpgradeCardComponent]
})
export class MembershipPageComponent implements OnInit {
  userTier = 'gold';
  nextTier = 'platinum';
  currentSpending = 2500;
  nextThreshold = 5000;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.getCurrentUser().subscribe(user => {
      this.userTier = user.membershipTier;
      this.currentSpending = user.totalSpending;
    });
  }

  navigateToShop() {
    // Navigate to shop
  }
}
```

### Dashboard Integration

```typescript
// dashboard.component.ts
import { Component } from '@angular/core';
import { MembershipStatsWidgetComponent } from './components/membership/membership-stats-widget.component';
import { RewardsDashboardComponent } from './components/membership/rewards-dashboard.component';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="grid gap-6">
      <app-membership-stats-widget [currentTier]="'gold'"></app-membership-stats-widget>
      <app-rewards-dashboard></app-rewards-dashboard>
    </div>
  `,
  standalone: true,
  imports: [MembershipStatsWidgetComponent, RewardsDashboardComponent]
})
export class DashboardComponent {}
```

## 🎨 Styling & Theming

### Color Scheme (Alexandria Theme)

```css
/* Pharaonic Gradient */
background: linear-gradient(135deg, rgb(251, 191, 36), rgb(217, 119, 6));

/* Primary Colors */
--primary-pharaonic: #FBB324
--secondary-egypt: #D97706
--nile-gradient: linear-gradient(180deg, #0a2e4a, #1e1f2e)

/* Tier Colors */
--bronze: rgb(180, 83, 9)
--silver: rgb(107, 114, 128)
--gold: rgb(251, 191, 36)
--platinum: rgb(168, 85, 247)
--pharaoh: rgb(236, 72, 153)
```

### Tailwind Configuration

Add to `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'gradient-nile': 'linear-gradient(180deg, #0a2e4a, #1e1f2e)',
        'gradient-pharaonic': 'linear-gradient(135deg, #FBB324, #D97706)'
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out'
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  }
}
```

## 🔌 API Integration

### Service Integration Template

```typescript
// wallet-subscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletSubscriptionService {
  private userTier$ = new BehaviorSubject<MembershipTier>('bronze');
  private userGold$ = new BehaviorSubject<number>(0);
  private tierSnapshots = new Map<MembershipTier, MembershipTierInfo>();

  constructor(private http: HttpClient) {
    this.initializeTiers();
  }

  // Get user's current membership tier
  getUserMembershipTier(): Observable<MembershipTier> {
    return this.http.get<MembershipTier>('/api/user/membership/tier');
  }

  // Get user's gold balance
  getUserGoldBalance(): Observable<number> {
    return this.http.get<number>('/api/user/wallet/gold');
  }

  // Get transaction history
  getTransactionHistory(limit: number = 10): Observable<GoldTransaction[]> {
    return this.http.get<GoldTransaction[]>(`/api/user/wallet/transactions?limit=${limit}`);
  }

  // Redeem gold for voucher
  redeemGoldVoucher(amount: number): Observable<any> {
    return this.http.post('/api/user/wallet/redeem', { amount });
  }

  // Upgrade subscription
  upgradeSubscription(plan: SubscriptionPlan): Observable<any> {
    return this.http.post('/api/user/subscription/upgrade', plan);
  }

  // Donate gold to charity
  donateGoldToCharity(amount: number, charity: string): Observable<any> {
    return this.http.post('/api/user/wallet/charity-donate', { amount, charity });
  }
}
```

### HTTP Endpoints Expected

```
GET    /api/user/membership/tier
GET    /api/user/wallet/gold
GET    /api/user/wallet/transactions
POST   /api/user/wallet/redeem
POST   /api/user/subscription/upgrade
POST   /api/user/wallet/charity-donate
GET    /api/membership/tiers
GET    /api/membership/tier/{tierName}
```

## ✅ Best Practices

### 1. **Performance Optimization**
```typescript
// Use OnPush change detection for better performance
@Component({
  selector: 'app-membership-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipShowcaseComponent {}
```

### 2. **Lazy Loading**
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'membership',
    loadComponent: () => import('./components/membership/membership-showcase.component')
      .then(m => m.MembershipShowcaseComponent)
  }
];
```

### 3. **Error Handling**
```typescript
loadUserRewards(): void {
  this.walletService.getUserGoldBalance().subscribe({
    next: (balance) => {
      this.totalGold = balance;
    },
    error: (error) => {
      console.error('Failed to load rewards:', error);
      this.showErrorNotification('Could not load rewards. Please try again.');
    }
  });
}
```

### 4. **Accessibility**
- All buttons have `aria-label` attributes
- Color contrast meets WCAG AA standards
- Keyboard navigation supported
- Screen reader friendly

### 5. **Mobile Responsiveness**
- Tested on screens from 320px to 2560px
- Uses Tailwind responsive prefixes (md:, lg:)
- Touch-friendly tap targets (min 44x44px)

### 6. **Animations**
- Use `@angular/animations` for smooth transitions
- Implement staggered animations for lists
- Respect `prefers-reduced-motion` preference

```typescript
@HostBinding('style.--stagger-delay') 
get staggerDelay(): string {
  return `${this.index * 0.1}s`;
}
```

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | 1 column |
| Tablet | 768-1024px | 2-3 columns |
| Desktop | > 1024px | 4-5 columns |

## 🐛 Common Issues & Solutions

**Issue:** Components not displaying
```typescript
// Solution: Ensure WalletSubscriptionService is provided
providers: [WalletSubscriptionService]
```

**Issue:** Styles not applying
```typescript
// Solution: Import CommonModule and FormsModule
imports: [CommonModule, FormsModule]
```

**Issue:** Gold balance not updating
```typescript
// Solution: Implement proper change detection
private cdr: ChangeDetectorRef;
loadRewards() {
  // ... load data
  this.cdr.markForCheck();
}
```

## 📚 Additional Resources

- [Angular 18 Documentation](https://angular.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [RxJS Operators](https://rxjs.dev/guide/operators)

## 📝 License

These components are part of the Alexandria Multi-Vendor Ecommerce Platform.

## 🤝 Contributing

To contribute improvements:
1. Follow the established code style
2. Add unit tests for new features
3. Update documentation
4. Submit a pull request

---

**Last Updated:** 2024
**Version:** 1.0.0
**Angular Version:** 18+
