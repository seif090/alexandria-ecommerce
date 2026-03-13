import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipTier, WalletSubscriptionService } from '../../services/wallet-subscription.service';

interface StatWidget {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-membership-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Tier Status Widget -->
      <div class="stat-widget tier-widget" [ngClass]="'tier-' + tierLevel">
        <div class="stat-header">
          <div class="stat-icon">{{ getTierIcon(currentTier) }}</div>
          <div>
            <p class="stat-label">Current Tier</p>
            <p class="stat-value">{{ getTierName(currentTier) }}</p>
          </div>
        </div>
        <div class="stat-footer">
          <p class="text-xs text-white/60">{{ tierDescription }}</p>
          <p class="text-xs font-bold text-green-400 mt-1">Member since {{ memberSinceDate | date: 'MMM yyyy' }}</p>
        </div>
      </div>

      <!-- Total Spending Widget -->
      <div class="stat-widget spending-widget" style="animation-delay: 0.1s;">
        <div class="stat-header">
          <div class="stat-icon">💰</div>
          <div class="flex-1">
            <p class="stat-label">Total Spending</p>
            <p class="stat-value">{{ totalSpending | number: '1.0-0' }}</p>
          </div>
          <div class="trend-badge" [ngClass]="'trend-up'">
            <span>↑ 12%</span>
          </div>
        </div>
        <div class="stat-footer">
          <div class="flex justify-between items-center text-xs">
            <span class="text-white/60">This month</span>
            <span class="font-bold text-blue-400">{{ monthlySpending | number: '1.0-0' }} EGP</span>
          </div>
        </div>
      </div>

      <!-- Gold Rewards Widget -->
      <div class="stat-widget rewards-widget" style="animation-delay: 0.2s;">
        <div class="stat-header">
          <div class="stat-icon">✨</div>
          <div class="flex-1">
            <p class="stat-label">Gold Balance</p>
            <p class="stat-value">{{ goldBalance | number: '1.0-0' }}</p>
          </div>
        </div>
        <div class="stat-footer">
          <div class="reward-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="goldProgress"></div>
            </div>
            <p class="text-xs text-white/60 mt-2">{{ goldProgress }}% to next level</p>
          </div>
        </div>
      </div>

      <!-- Perks Available Widget -->
      <div class="stat-widget perks-widget" style="animation-delay: 0.3s;">
        <div class="stat-header">
          <div class="stat-icon">🎁</div>
          <div class="flex-1">
            <p class="stat-label">Perks Available</p>
            <p class="stat-value">{{ availablePerks }}</p>
          </div>
        </div>
        <div class="stat-footer">
          <div class="flex gap-2 flex-wrap">
            <span class="perk-badge">Free Shipping</span>
            <span class="perk-badge">Birthday Bonus</span>
          </div>
          <p class="text-xs text-white/60 mt-2">✓ 2 active this month</p>
        </div>
      </div>
    </div>

    <!-- Detailed Stats Section -->
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Progress to Next Tier -->
      <div class="detail-card">
        <h3 class="text-lg font-black text-white mb-4">Progress to {{ getNextTierName(currentTier) }}</h3>
        <div class="space-y-4">
          <div class="progress-item">
            <div class="flex justify-between items-center mb-2">
              <span class="text-white font-bold">{{ currentSpending | number: '1.0-0' }} EGP</span>
              <span class="text-white/60 text-sm">of {{ nextThreshold | number: '1.0-0' }} EGP</span>
            </div>
            <div class="tier-progress-bar">
              <div class="tier-progress-fill" [style.width.%]="tierProgress"></div>
            </div>
            <p class="text-xs text-white/60 mt-2">{{ remainingForNextTier | number: '1.0-0' }} EGP remaining</p>
          </div>
        </div>
      </div>

      <!-- Membership Benefits -->
      <div class="detail-card">
        <h3 class="text-lg font-black text-white mb-4">Current Benefits</h3>
        <ul class="space-y-2">
          <li class="flex items-center gap-2 text-white/80" *ngFor="let benefit of currentBenefits">
            <span class="text-green-400">✓</span>
            <span class="text-sm">{{ benefit }}</span>
          </li>
        </ul>
      </div>

      <!-- Quick Stats -->
      <div class="detail-card">
        <h3 class="text-lg font-black text-white mb-4">Quick Stats</h3>
        <div class="space-y-3">
          <div class="quick-stat">
            <span class="text-white/60 text-sm">Discount Rate</span>
            <span class="text-2xl font-black text-yellow-400">{{ discountRate }}%</span>
          </div>
          <div class="quick-stat border-t border-white/10 pt-3">
            <span class="text-white/60 text-sm">Shipping Days</span>
            <span class="text-2xl font-black text-blue-400">{{ shippingDays }}</span>
          </div>
          <div class="quick-stat border-t border-white/10 pt-3">
            <span class="text-white/60 text-sm">Rewards Multiplier</span>
            <span class="text-2xl font-black text-green-400">{{ rewardsMultiplier }}x</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-widget {
      padding: 1.5rem;
      border-radius: 1.25rem;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .stat-widget::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, rgb(251, 191, 36), rgb(217, 119, 6));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .stat-widget:hover {
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(251, 191, 36, 0.1);
    }

    .stat-widget:hover::before {
      transform: scaleX(1);
    }

    .stat-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      uppercase;
      font-weight: bold;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 900;
      color: white;
    }

    .stat-footer {
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .trend-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .trend-badge.trend-up {
      background: rgba(34, 197, 94, 0.2);
      color: rgb(34, 197, 94);
    }

    .reward-progress {
      margin-top: 0.5rem;
    }

    .progress-bar {
      height: 0.5rem;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: rgb(59, 130, 246);
      transition: width 0.3s ease;
    }

    .perk-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(34, 197, 94, 0.2);
      color: rgb(34, 197, 94);
      border-radius: 0.5rem;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .detail-card {
      padding: 1.5rem;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      transition: all 0.3s ease;
    }

    .detail-card:hover {
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-4px);
    }

    .progress-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0.75rem;
    }

    .tier-progress-bar {
      height: 0.75rem;
      background: rgba(251, 191, 36, 0.2);
      border-radius: 0.375rem;
      overflow: hidden;
    }

    .tier-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, rgb(251, 191, 36), rgb(217, 119, 6));
      transition: width 0.3s ease;
    }

    .quick-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tier-widget {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05));
      border-color: rgba(168, 85, 247, 0.3);
    }

    .spending-widget {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
      border-color: rgba(59, 130, 246, 0.3);
    }

    .rewards-widget {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
      border-color: rgba(34, 197, 94, 0.3);
    }

    .perks-widget {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
      border-color: rgba(251, 191, 36, 0.3);
    }
  `]
})
export class MembershipStatsWidgetComponent implements OnInit {
  @Input() currentTier: MembershipTier = MembershipTier.GOLD;
  @Input() userEmail: string = 'user@example.com';

  // Stats
  totalSpending = 2500;
  monthlySpending = 450;
  goldBalance = 4230;
  goldProgress = 65;
  availablePerks = 4;
  currentSpending = 2500;
  nextThreshold = 5000;
  tierProgress = 50;
  remainingForNextTier = 2500;
  discountRate = 8;
  shippingDays = '2-3';
  rewardsMultiplier = 2;
  memberSinceDate = new Date('2024-01-15');
  tierDescription = 'Premium member with VIP benefits';

  currentBenefits = [
    '8% discount on all purchases',
    '2x rewards multiplier',
    'Express shipping (2-3 days)',
    'Free shipping on all orders',
    'VIP event access',
    'Birthday bonus (1,000 EGP)',
    'Personal shopping assistant',
    '24/7 priority support'
  ];

  constructor(private walletService: WalletSubscriptionService) {}

  ngOnInit(): void {
    this.loadMembershipStats();
  }

  loadMembershipStats(): void {
    const tierInfo = this.walletService.getMembershipTierInfo(this.currentTier);
    if (tierInfo) {
      this.discountRate = tierInfo.discountPercentage;
      this.rewardsMultiplier = tierInfo.goldRewardRate;
      this.shippingDays = tierInfo.businessDays === 0 ? '24 hrs' : `${tierInfo.businessDays}`;
    }
  }

  getTierIcon(tier: MembershipTier): string {
    const icons: { [key in MembershipTier]: string } = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      pharaoh: '👑'
    };
    return icons[tier];
  }

  getTierName(tier: MembershipTier): string {
    const names: { [key in MembershipTier]: string } = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
      pharaoh: 'Pharaoh'
    };
    return names[tier];
  }

  getNextTierName(tier: MembershipTier): string {
    const names: { [key in MembershipTier]: string } = {
      bronze: 'Silver',
      silver: 'Gold',
      gold: 'Platinum',
      platinum: 'Pharaoh',
      pharaoh: 'Pharaoh Elite'
    };
    return names[tier];
  }
}
