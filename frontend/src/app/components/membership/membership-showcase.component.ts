import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletSubscriptionService, MembershipTier } from '../../services/wallet-subscription.service';
import { ThemeService } from '../../services/theme.service';
import { TranslatePipe } from '../../services/translate.pipe';

@Component({
  selector: 'app-membership-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gradient-nile py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16 animate-fade-in">
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-pharaonic mb-4 italic tracking-tighter uppercase">
            ✦ Premium Membership ✦
          </h1>
          <p class="text-xl text-white font-bold mb-2">Unlock Exclusive Benefits with Alexandria Royalty</p>
          <p class="text-white opacity-80">Join the elite circle of discriminating shoppers</p>
          <div class="mt-8 flex justify-center gap-6">
            <span class="flex items-center gap-2 text-white font-bold">
              <span class="text-2xl">👑</span> Tier Benefits
            </span>
            <span class="flex items-center gap-2 text-white font-bold">
              <span class="text-2xl">💎</span> Exclusive Perks
            </span>
            <span class="flex items-center gap-2 text-white font-bold">
              <span class="text-2xl">🎁</span> Rewards
            </span>
          </div>
        </div>

        <!-- Tiers Grid (Scrollable) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16 overflow-x-auto pb-6">
          <ng-container *ngFor="let tier of membershipTiers; let i = index">
            <div [ngClass]="'tier-card tier-' + i" 
                 class="relative group cursor-pointer transition-all duration-300 min-w-[280px]"
                 [style.transform]="currentTierIndex === i ? 'scale(1.05)' : 'scale(1)'">
              
              <!-- Card Background -->
              <div class="absolute inset-0 rounded-2xl blur-xl transition-all" 
                   [ngClass]="currentTierIndex === i ? 'opacity-100' : 'opacity-50'"
                   [style.background]="tier.color"></div>

              <!-- Card Content -->
              <div class="relative bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 h-full flex flex-col hover:border-white/20 transition-all">
                
                <!-- Tier Badge -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-4xl">{{ ['🥉', '🥈', '🥇', '💎', '👑'][i] }}</span>
                    <div>
                      <h3 class="text-lg font-black text-white uppercase">{{ tier.displayName }}</h3>
                      <p class="text-xs text-white/60">{{ tier.minSpent }}+ EGP spent</p>
                    </div>
                  </div>
                </div>

                <div class="my-4 h-px bg-gradient-pharaonic opacity-30"></div>

                <!-- Benefits List -->
                <div class="flex-1 mb-6">
                  <p class="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Exclusive Benefits</p>
                  <ul class="space-y-2">
                    <li *ngFor="let benefit of tier.benefits.slice(0, 3)" class="text-sm text-white/80 flex gap-2">
                      <span class="text-yellow-400">✓</span>
                      <span>{{ benefit }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Tier Perks -->
                <div class="space-y-3 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div class="flex justify-between text-sm">
                    <span class="text-white/70">Discount:</span>
                    <span class="font-black text-yellow-400">{{ tier.discountPercentage }}%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-white/70">Rewards Rate:</span>
                    <span class="font-black text-green-400">{{ tier.goldRewardRate }}x</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-white/70">Shipping Days:</span>
                    <span class="font-black text-blue-400">{{ tier.businessDays === 0 ? '24hr' : tier.businessDays + ' days' }}</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <button class="w-full py-3 bg-gradient-pharaonic text-black font-black rounded-lg transition-all hover:shadow-lg active:scale-95 uppercase text-sm tracking-wider"
                        (click)="selectTier(tier.tier)">
                  {{ currentTierIndex === i ? '✓ Your Tier' : 'Upgrade' }}
                </button>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Current Tier Status -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl border-2 border-yellow-400/50 p-8 mb-16 card-premium">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <p class="text-white/70 text-sm uppercase mb-2">Current Tier</p>
              <p class="text-4xl font-black text-white mb-2">{{ currentTier }}</p>
              <p class="text-white/60">You're in the top tier</p>
            </div>
            <div class="text-center border-l border-r border-white/20">
              <p class="text-white/70 text-sm uppercase mb-2">Total Spent</p>
              <p class="text-4xl font-black text-green-400 mb-2">2,500 EGP</p>
              <p class="text-white/60">This membership period</p>
            </div>
            <div class="text-center">
              <p class="text-white/70 text-sm uppercase mb-2">Rewards Balance</p>
              <p class="text-4xl font-black text-blue-400 mb-2">4,230</p>
              <p class="text-white/60 cursor-pointer hover:text-white transition">Redeem →</p>
            </div>
          </div>
        </div>

        <!-- Benefits Comparison Table -->
        <div class="bg-slate-900/50 backdrop-blur rounded-3xl border border-white/10 p-8 overflow-hidden">
          <h2 class="text-3xl font-black text-white mb-8">Complete Benefits Comparison</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-white">
              <thead>
                <tr class="border-b border-white/20">
                  <th class="text-left py-4 px-4 font-black uppercase text-yellow-400">Feature</th>
                  <ng-container *ngFor="let tier of membershipTiers">
                    <th class="text-center py-4 px-4 font-black uppercase text-sm">{{ tier.displayName }}</th>
                  </ng-container>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-white/10" *ngFor="let feature of comparisonFeatures">
                  <td class="py-4 px-4 font-bold text-white/80">{{ feature.name }}</td>
                  <td *ngFor="let tier of membershipTiers" class="text-center py-4 px-4">
                    <span class="text-green-400 font-black" *ngIf="feature.values[tier.tier]">
                      {{ feature.values[tier.tier] }}
                    </span>
                    <span class="text-white/40" *ngIf="!feature.values[tier.tier]">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tier-card {
      animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tier-card:nth-child(2) {
      animation-delay: 0.1s;
    }

    .tier-card:nth-child(3) {
      animation-delay: 0.2s;
    }

    .tier-card:nth-child(4) {
      animation-delay: 0.3s;
    }

    .tier-card:nth-child(5) {
      animation-delay: 0.4s;
    }
  `]
})
export class MembershipShowcaseComponent implements OnInit {
  membershipTiers: any[] = [];
  currentTier = 'Gold';
  currentTierIndex = 2;

  comparisonFeatures = [
    {
      name: 'Discount on All Orders',
      values: {
        bronze: '2%',
        silver: '5%',
        gold: '8%',
        platinum: '12%',
        pharaoh: '20%'
      }
    },
    {
      name: 'Free Shipping',
      values: {
        bronze: 'Over 200 EGP',
        silver: 'All Orders',
        gold: 'Express',
        platinum: 'Worldwide',
        pharaoh: 'Priority'
      }
    },
    {
      name: 'Rewards Rate',
      values: {
        bronze: '1x',
        silver: '1.5x',
        gold: '2x',
        platinum: '3x',
        pharaoh: '5%'
      }
    },
    {
      name: 'Birthday Bonus',
      values: {
        bronze: '500 EGP',
        silver: '750 EGP',
        gold: '1,000 EGP',
        platinum: '2,000 EGP',
        pharaoh: 'Custom'
      }
    },
    {
      name: 'Priority Support',
      values: {
        gold: '24/7',
        platinum: '24/7 Concierge',
        pharaoh: 'Personal'
      }
    },
    {
      name: 'VIP Events Access',
      values: {
        gold: '✓',
        platinum: '✓ Exclusive',
        pharaoh: '✓ Private'
      }
    }
  ];

  constructor(
    private walletService: WalletSubscriptionService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.membershipTiers = this.walletService.getAllMembershipTiers();
  }

  selectTier(tier: MembershipTier): void {
    const tierInfo = this.walletService.getMembershipTierInfo(tier);
    if (tierInfo) {
      alert(`Congratulations! You've selected ${tierInfo.displayName}`);
      // TODO: Redirect to subscription page
    }
  }
}
