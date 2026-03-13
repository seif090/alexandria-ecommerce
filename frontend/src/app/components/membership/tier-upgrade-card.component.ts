import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MembershipTier, WalletSubscriptionService } from '../../services/wallet-subscription.service';

interface TierUpgradeCard {
  currentTier: MembershipTier;
  nextTier: MembershipTier;
  currentSpending: number;
  nextThreshold: number;
  progress: number;
  daysUntilUpgrade: number;
}

@Component({
  selector: 'app-tier-upgrade-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full animate-slide-up">
      <!-- Main Upgrade Card -->
      <div class="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-3xl border-2 border-gradient-pharaonic p-8 backdrop-blur-xl overflow-hidden relative">
        
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-pharaonic/10 rounded-full blur-3xl -z-10"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl -z-10"></div>

        <!-- Header Section -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div class="flex items-center gap-4">
            <div class="text-5xl">
              <span *ngIf="currentTier === 'bronze'">🥉</span>
              <span *ngIf="currentTier === 'silver'">🥈</span>
              <span *ngIf="currentTier === 'gold'">🥇</span>
              <span *ngIf="currentTier === 'platinum'">💎</span>
              <span *ngIf="currentTier === 'pharaoh'">👑</span>
            </div>
            <div>
              <h2 class="text-3xl font-black text-white uppercase">You're {{ getTierDisplayName(currentTier) }}</h2>
              <p class="text-white/60 font-semibold">Member since {{ memberSince | date: 'MMM yyyy' }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-white/60 uppercase font-bold">Next Milestone</p>
            <p class="text-3xl font-black text-transparent bg-clip-text bg-gradient-pharaonic">
              {{ getNextTierDisplayName(nextTier) }}
            </p>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-white font-bold">Spending Progress</p>
              <p class="text-white/60 text-sm">{{ currentSpending | number: '1.0-0' }} EGP / {{ nextThreshold | number: '1.0-0' }} EGP</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-black text-transparent bg-clip-text bg-gradient-pharaonic">{{ progress }}%</p>
              <p class="text-white/60 text-sm">{{ remainingSpend | number: '1.0-0' }} EGP to go</p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div class="h-full bg-gradient-pharaonic transition-all duration-500 rounded-full"
                 [style.width.%]="progress">
            </div>
          </div>

          <!-- Timeline Info -->
          <div class="mt-4 flex items-center justify-between text-white/60 text-sm">
            <span>Current Tier: {{ currentSpending | number: '1.0-0' }} EGP</span>
            <span>Estimated: {{ daysUntilUpgrade }} days</span>
            <span>Next Tier: {{ nextThreshold | number: '1.0-0' }} EGP</span>
          </div>
        </div>

        <!-- Current Benefits Showcase -->
        <div class="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h3 class="text-lg font-black text-white mb-4">✨ Your Current Benefits</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3" *ngFor="let benefit of currentBenefits">
              <span class="text-xl mt-1">{{ benefit.icon }}</span>
              <div>
                <p class="font-bold text-white text-sm">{{ benefit.title }}</p>
                <p class="text-white/60 text-xs">{{ benefit.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Benefits Teaser -->
        <div class="mb-8 p-6 bg-gradient-to-r from-yellow-400/10 to-purple-400/10 rounded-2xl border border-yellow-400/30">
          <h3 class="text-lg font-black text-white mb-4">🎁 Coming at {{ getNextTierDisplayName(nextTier) }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3" *ngFor="let benefit of upcomingBenefits">
              <span class="text-xl mt-1">{{ benefit.icon }}</span>
              <div>
                <p class="font-bold text-white text-sm">{{ benefit.title }}</p>
                <p class="text-white/60 text-xs">{{ benefit.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <p class="text-2xl font-black text-green-400 mb-1">{{ discountPercentage }}%</p>
            <p class="text-white/70 text-sm font-bold">Discount Rate</p>
          </div>
          <div class="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <p class="text-2xl font-black text-blue-400 mb-1">{{ rewardRate }}x</p>
            <p class="text-white/70 text-sm font-bold">Rewards Earned</p>
          </div>
          <div class="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <p class="text-2xl font-black text-yellow-400 mb-1">{{ shippingDays }}</p>
            <p class="text-white/70 text-sm font-bold">Shipping Days</p>
          </div>
        </div>

        <!-- Action Button -->
        <button (click)="onContinueShopping()" 
                class="w-full py-4 bg-gradient-pharaonic text-black font-black text-lg rounded-xl transition-all hover:shadow-2xl active:scale-95 uppercase tracking-wider">
          💳 Continue Shopping to {{ getNextTierDisplayName(nextTier) }}
        </button>

        <!-- Info Text -->
        <p class="text-center text-white/60 text-sm mt-4">
          <span *ngIf="remainingSpend > 0">Spend {{ remainingSpend | number: '1.0-0' }} more EGP to unlock</span>
          <span *ngIf="remainingSpend <= 0">Congratulations! You've reached</span>
          <span class="font-black text-transparent bg-clip-text bg-gradient-pharaonic">{{ getNextTierDisplayName(nextTier) }}</span>
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-up {
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bg-gradient-pharaonic {
      background: linear-gradient(135deg, rgb(251, 191, 36), rgb(217, 119, 6));
    }
  `]
})
export class TierUpgradeCardComponent implements OnInit {
  @Input() currentTier: MembershipTier = MembershipTier.BRONZE;
  @Input() nextTier: MembershipTier = MembershipTier.SILVER;
  @Input() currentSpending: number = 150;
  @Input() nextThreshold: number = 500;
  @Output() continueShopping = new EventEmitter<void>();

  memberSince = new Date('2024-01-15');
  daysUntilUpgrade = 45;
  remainingSpend = 0;
  progress = 0;
  discountPercentage = 5;
  rewardRate = 1.5;
  shippingDays = '3-5';

  currentBenefits = [
    { icon: '💰', title: '5% Discount', description: 'On all purchases' },
    { icon: '🎁', title: '1.5x Rewards', description: 'Earn faster' },
    { icon: '🚚', title: 'Free Shipping', description: 'On orders 200+ EGP' },
    { icon: '🎂', title: 'Birthday Bonus', description: '750 EGP gift' }
  ];

  upcomingBenefits = [
    { icon: '💎', title: '8% Discount', description: 'Upgraded savings' },
    { icon: '⭐', title: '2x Rewards', description: 'Double rewards rate' },
    { icon: '🚀', title: 'Express Shipping', description: '2-3 business days' },
    { icon: '👑', title: 'VIP Events', description: 'Exclusive access' }
  ];

  constructor(
    private walletService: WalletSubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.calculateProgress();
    this.loadTierInfo();
  }

  calculateProgress(): void {
    this.progress = Math.min(Math.round((this.currentSpending / this.nextThreshold) * 100), 100);
    this.remainingSpend = Math.max(this.nextThreshold - this.currentSpending, 0);
  }

  loadTierInfo(): void {
    const tierInfo = this.walletService.getMembershipTierInfo(this.currentTier);
    if (tierInfo) {
      this.discountPercentage = tierInfo.discountPercentage;
      this.rewardRate = tierInfo.goldRewardRate;
      this.shippingDays = tierInfo.businessDays === 0 ? '24hr' : `${tierInfo.businessDays}`;
    }
  }

  getTierDisplayName(tier: MembershipTier): string {
    const names: { [key in MembershipTier]: string } = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
      pharaoh: 'Pharaoh'
    };
    return names[tier];
  }

  getNextTierDisplayName(tier: MembershipTier): string {
    const names: { [key in MembershipTier]: string } = {
      bronze: 'Silver',
      silver: 'Gold',
      gold: 'Platinum',
      platinum: 'Pharaoh',
      pharaoh: 'Pharaoh Elite'
    };
    return names[tier];
  }

  onContinueShopping(): void {
    this.continueShopping.emit();
    // Navigate to shop
    this.router.navigate(['/shop']);
  }
}
