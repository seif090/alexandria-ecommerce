/**
 * QUICK REFERENCE CARD - Premium Membership Components
 * 
 * Print this file or keep it handy for quick lookups during development.
 */

// =============================================================================
// COMPONENT SELECTOR REFERENCE
// =============================================================================

<app-membership-showcase></app-membership-showcase>
// Displays: All 5 membership tiers with benefits comparison table

<app-premium-benefits-card [userTier]="'gold'"></app-premium-benefits-card>
// Displays: 6 benefit cards + tier-specific benefits + pharaoh showcase

<app-rewards-dashboard></app-rewards-dashboard>
// Displays: Gold balance, pending, redeemed, expiring + transaction history

<app-tier-upgrade-card 
  [currentTier]="'gold'"
  [nextTier]="'platinum'"
  [currentSpending]="2500"
  [nextThreshold]="5000"
  (continueShopping)="navigateToShop()">
</app-tier-upgrade-card>
// Displays: Progress to next tier with benefits comparison

<app-membership-stats-widget [currentTier]="'gold'"></app-membership-stats-widget>
// Displays: 4 stat cards + progress + benefits list + quick stats

<app-subscription-plan-card 
  [currentUserPlan]="'bronze'"
  (planSelected)="selectPlan($event)">
</app-subscription-plan-card>
// Displays: 5 plan cards + comparison table + FAQ

// =============================================================================
// IMPORT STATEMENTS
// =============================================================================

// Option 1: Import all from barrel
import {
  MembershipShowcaseComponent,
  PremiumBenefitsCardComponent,
  RewardsDashboardComponent,
  TierUpgradeCardComponent,
  MembershipStatsWidgetComponent,
  SubscriptionPlanCardComponent
} from './components/membership';

// Option 2: Individual imports
import { MembershipShowcaseComponent } from './components/membership/membership-showcase.component';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'pharaoh';

interface MembershipTierInfo {
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

interface MembershipUser {
  id: string;
  email: string;
  currentTier: MembershipTier;
  totalSpending: number;
  monthlySpending: number;
  goldBalance: number;
}

// =============================================================================
// TIER CONSTANTS
// =============================================================================

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 10000,
  pharaoh: 50000
};

const TIER_ICONS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  pharaoh: '👑'
};

const TIER_NAMES = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  pharaoh: 'Pharaoh'
};

// =============================================================================
// SERVICE USAGE PATTERNS
// =============================================================================

// Constructor injection
constructor(private walletService: WalletSubscriptionService) {}

// Load user tier
ngOnInit() {
  this.walletService.getUserMembershipTier().subscribe(tier => {
    this.userTier = tier;
  });
}

// Get tier info
const tierInfo = this.walletService.getMembershipTierInfo('gold');
console.log(tierInfo.discountPercentage); // 8

// Calculate tier from spending
const tier = this.walletService.calculateTierFromSpending(3000); // 'gold'

// Redeem gold
this.walletService.redeemGold(500).subscribe({
  next: (result) => console.log('Redeemed:', result),
  error: (err) => console.error('Redemption failed:', err)
});

// =============================================================================
// ROUTING CONFIGURATION
// =============================================================================

const routes: Routes = [
  {
    path: 'membership',
    loadComponent: () => import('./components/membership/membership-showcase.component')
      .then(m => m.MembershipShowcaseComponent),
    data: { title: 'Premium Membership' }
  },
  {
    path: 'rewards',
    component: RewardsDashboardComponent,
    canActivate: [premiumTierGuard]
  }
];

// =============================================================================
// BINDING PATTERNS
// =============================================================================

// Property binding
<app-tier-upgrade-card [currentTier]="userTier"></app-tier-upgrade-card>

// Event binding
<app-rewards-dashboard (redemptionComplete)="onRedemption($event)"></app-rewards-dashboard>

// Two-way binding (in rewards dashboard for charity donation)
<input [(ngModel)]="charityAmount" />

// Interpolation
{{ currentTier }} // 'gold'
{{ tierProgress }}% // '65%'

// =============================================================================
// ANIMATION TRIGGERS
// =============================================================================

// Components use @angular/animations with:
@component({
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.4s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})

// Applied in templates with
[@fadeIn]

// =============================================================================
// TAILWIND CSS UTILITIES USED
// =============================================================================

// Spacing
py-16, px-6, gap-6, mb-8, mt-4

// Typography
text-5xl, font-black, font-bold, uppercase, tracking-wider

// Display & Layout
grid, grid-cols-1, md:grid-cols-2, lg:grid-cols-5
flex, flex-1, items-center, justify-between, gap-4

// Background & Borders
bg-gradient-nile, rounded-2xl, border, border-white/10
bg-slate-900/50, backdrop-blur, overflow-hidden

// Text & Colors
text-white, text-white/80, text-white/60
text-yellow-400, text-green-400, text-blue-400

// Interactions
hover:shadow-lg, transition-all, active:scale-95, cursor-pointer

// =============================================================================
// CUSTOM COLORS (ALEXANDRIA THEME)
// =============================================================================

Primary Gradient: linear-gradient(135deg, rgb(251, 191, 36), rgb(217, 119, 6))
Nile Background: linear-gradient(180deg, #0a2e4a, #1e1f2e)

Tier Colors:
- Bronze: rgb(180, 83, 9)
- Silver: rgb(107, 114, 128)
- Gold: rgb(251, 191, 36)
- Platinum: rgb(168, 85, 247)
- Pharaoh: rgb(236, 72, 153)

// =============================================================================
// COMMON METHODS REFERENCE
// =============================================================================

// Check if user reached tier
if (currentSpending >= TIER_THRESHOLDS.gold) { /* is Gold */ }

// Get next tier name
const nextTier = getNextTierName('gold'); // 'Platinum'

// Calculate upgrade progress
progress = Math.min((currentSpending / nextThreshold) * 100, 100);

// Format currency
{{ amount | number: '1.0-0' }} EGP

// Get tier icon
getTierIcon('gold'); // '🥇'

// =============================================================================
// ERROR HANDLING
// =============================================================================

loadRewards() {
  this.walletService.getUserGoldBalance().subscribe({
    next: (balance) => {
      this.goldBalance = balance;
    },
    error: (error) => {
      console.error('Failed to load rewards:', error);
      this.showErrorNotification('Could not load rewards');
    },
    complete: () => {
      console.log('Load complete');
    }
  });
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

private destroy$ = new Subject<void>();

ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(...);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// =============================================================================
// TESTING SETUP
// =============================================================================

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

  it('should display all 5 tiers', () => {
    expect(component.membershipTiers.length).toBe(5);
  });
});

// =============================================================================
// API ENDPOINTS QUICK REFERENCE
// =============================================================================

// Profile
GET  /api/user/profile/membership
GET  /api/user/membership/tier

// Wallet
GET  /api/user/wallet/gold-balance
GET  /api/user/wallet/transactions
POST /api/user/wallet/redeem
POST /api/user/wallet/charity-donate

// Subscription
POST /api/user/subscription/upgrade
POST /api/user/spending/record

// Tier Info
GET  /api/membership/tiers
GET  /api/membership/tier/gold

// =============================================================================
// PERFORMANCE TIPS
// =============================================================================

1. Use OnPush change detection
   changeDetection: ChangeDetectionStrategy.OnPush

2. Lazy load components in routing
   loadComponent: () => import('./component').then(m => m.MyComponent)

3. Unsubscribe with takeUntil
   .pipe(takeUntil(this.destroy$))

4. Use trackBy in *ngFor
   *ngFor="let item of items; trackBy: trackByFn"

5. Memoize tier lookups
   private tierCache = new Map<MembershipTier, TierInfo>();

6. Defer expensive operations
   @defer (on immediate) { expensive content }

// =============================================================================
// ACCESSIBILITY CHECKLIST
// =============================================================================

☑ ARIA labels on interactive elements
☑ Color contrast > 4.5:1 for text
☑ Keyboard navigation support
☑ Focus visible on all buttons
☑ Alt text for icons/images
☑ Semantic HTML elements
☑ Proper heading hierarchy
☑ Form labels associated
☑ Screen reader tested
☑ Mobile tap targets 44x44px minimum

// =============================================================================
// RESPONSIVE BREAKPOINT REFERENCE
// =============================================================================

Mobile:  < 768px  | 1 column         | max-w-sm
Tablet:  768-1024px | 2-3 columns   | max-w-2xl
Desktop: > 1024px | 4-5 columns     | max-w-7xl

Tailwind prefixes: sm:, md:, lg:, xl:, 2xl:

// =============================================================================
// FILES CHECKLIST
// =============================================================================

✓ membership-showcase.component.ts
✓ premium-benefits-card.component.ts
✓ rewards-dashboard.component.ts
✓ tier-upgrade-card.component.ts
✓ membership-stats-widget.component.ts
✓ subscription-plan-card.component.ts
✓ index.ts (barrel export)
✓ README.md
✓ INTEGRATION_GUIDE.ts
✓ PROJECT_SUMMARY.md
✓ QUICK_REFERENCE.ts (this file)

// =============================================================================
// ONE-LINER CHEAT SHEET
// =============================================================================

Import all     → import { ...Components } from './components/membership'
Get tier info  → this.walletService.getMembershipTierInfo('gold')
Load rewards   → this.walletService.getUserGoldBalance().subscribe(...)
Redeem gold    → this.walletService.redeemGold(amount).subscribe(...)
Format money   → {{ amount | number: '1.0-0' }} EGP
Get tier name  → this.tierNames[tier]
Check tier     → tier === 'gold' ? true : false

// =============================================================================
// DEBUGGING TIPS
// =============================================================================

1. Check NetworkTag: Look for API calls in browser DevTools
2. Verify imports: Ensure all modules imported
3. Test in dev mode: ng serve --poll=2000
4. Check console: console.log() for debugging
5. Use DevTools: Chrome DevTools Angular tab
6. Inspect DOM: Right-click → Inspect Element
7. Test accessibility: axe DevTools extension
8. Check responsive: Chrome DevTools device toolbar

// =============================================================================
// KEYBOARD SHORTCUTS (VS Code with Angular Extensions)
// =============================================================================

Ctrl+Space    → IntelliSense
Alt+F2        → Go to Definition
Shift+F12     → Find All References
F2            → Rename Symbol
Ctrl+H        → Find and Replace
Ctrl+Shift+F  → Find in Files
Ctrl+'        → Toggle Terminal

// =============================================================================

End of Quick Reference Card
Save this file for quick lookups during development!

Version: 1.0
Last Updated: 2024
