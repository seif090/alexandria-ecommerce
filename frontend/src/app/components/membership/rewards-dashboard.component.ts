import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletSubscriptionService } from '../../services/wallet-subscription.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '../../services/translate.pipe';

interface RewardAction {
  icon: string;
  title: string;
  description: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-rewards-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gradient-nile py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-pharaonic mb-2 uppercase">
            🏆 Rewards Dashboard
          </h1>
          <p class="text-white/70">Manage your loyalty points and exclusive rewards</p>
        </div>

        <!-- Main Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <!-- Total Gold -->
          <div class="stat-card bg-gradient-to-br from-green-600/20 to-green-400/10 border border-green-400/30">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-green-400/80 text-sm uppercase font-bold">Total Gold</p>
                <p class="text-4xl font-black text-green-400 mt-2">{{ totalGold }}</p>
              </div>
              <span class="text-4xl">💰</span>
            </div>
            <div class="h-1 bg-green-400/30 rounded-full overflow-hidden">
              <div class="h-full bg-green-400" style="width: 75%"></div>
            </div>
          </div>

          <!-- Pending -->
          <div class="stat-card bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-400/30">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-blue-400/80 text-sm uppercase font-bold">Pending</p>
                <p class="text-4xl font-black text-blue-400 mt-2">{{ pendingGold }}</p>
              </div>
              <span class="text-4xl">⏳</span>
            </div>
            <p class="text-blue-400/60 text-xs mt-4">Pending for {{ tierLevel }} days</p>
          </div>

          <!-- Redeemed This Month -->
          <div class="stat-card bg-gradient-to-br from-orange-600/20 to-orange-400/10 border border-orange-400/30">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-orange-400/80 text-sm uppercase font-bold">Redeemed</p>
                <p class="text-4xl font-black text-orange-400 mt-2">{{ redeemedThisMonth }}</p>
              </div>
              <span class="text-4xl">✓</span>
            </div>
            <p class="text-orange-400/60 text-xs mt-4">This month</p>
          </div>

          <!-- Expiring Soon -->
          <div class="stat-card bg-gradient-to-br from-red-600/20 to-red-400/10 border border-red-400/30">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-red-400/80 text-sm uppercase font-bold">Expiring</p>
                <p class="text-4xl font-black text-red-400 mt-2">{{ expiringGold }}</p>
              </div>
              <span class="text-4xl">⚠️</span>
            </div>
            <p class="text-red-400/60 text-xs mt-4">In 30 days</p>
          </div>
        </div>

        <!-- Rewards Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ng-container *ngFor="let action of quickActions">
            <div class="action-card group cursor-pointer"
                 [style.borderColor]="action.color"
                 (click)="executeAction(action)">
              <div class="absolute inset-0 rounded-xl blur opacity-20 group-hover:opacity-40 transition"
                   [style.backgroundColor]="action.color"></div>
              
              <div class="relative flex items-center justify-between h-full">
                <div class="flex-1">
                  <p class="text-3xl mb-2">{{ action.icon }}</p>
                  <h3 class="text-lg font-black text-white mb-1">{{ action.title }}</h3>
                  <p class="text-white/60 text-sm">{{ action.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-black text-white opacity-50 group-hover:opacity-100 transition">+{{ action.value }}</p>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Redemption Options -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Vouchers/Discounts -->
          <div class="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-4xl">🎟️</span>
              <div>
                <h2 class="text-2xl font-black text-white">Redeem for Vouchers</h2>
                <p class="text-white/60">Convert gold to shopping vouchers</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="redemption-option" data-value="100">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-black text-white">50 EGP Voucher</p>
                    <p class="text-white/60 text-sm">Use on any purchase</p>
                  </div>
                  <div class="text-right">
                    <p class="font-black text-green-400">100 Gold</p>
                    <button class="mt-2 px-4 py-1 bg-green-400/20 hover:bg-green-400/40 text-green-400 font-bold rounded text-sm transition">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>

              <div class="redemption-option" data-value="250">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-black text-white">150 EGP Voucher</p>
                    <p class="text-white/60 text-sm">Premium tier benefit</p>
                  </div>
                  <div class="text-right">
                    <p class="font-black text-blue-400">250 Gold</p>
                    <button class="mt-2 px-4 py-1 bg-blue-400/20 hover:bg-blue-400/40 text-blue-400 font-bold rounded text-sm transition">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>

              <div class="redemption-option" data-value="500">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-black text-white">400 EGP Voucher</p>
                    <p class="text-white/60 text-sm">Best value!</p>
                  </div>
                  <div class="text-right">
                    <p class="font-black text-yellow-400">500 Gold</p>
                    <button class="mt-2 px-4 py-1 bg-yellow-400/20 hover:bg-yellow-400/40 text-yellow-400 font-bold rounded text-sm transition">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charity/Special -->
          <div class="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-4xl">❤️</span>
              <div>
                <h2 class="text-2xl font-black text-white">Make a Difference</h2>
                <p class="text-white/60">Donate your rewards to charity</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="charity-card">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">🏥</span>
                  <div class="flex-1">
                    <p class="font-black text-white">Healthcare Initiative</p>
                    <p class="text-white/60 text-sm">Your donation provides medical care to those in need</p>
                    <div class="mt-3 flex items-center justify-between">
                      <input [(ngModel)]="charityAmount" type="number" min="100" step="50" 
                             class="w-20 px-2 py-1 bg-white/10 text-white font-bold rounded text-center"
                             placeholder="100">
                      <button class="px-4 py-1 bg-red-400/20 hover:bg-red-400/40 text-red-400 font-bold rounded text-sm transition">
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="charity-card">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">📚</span>
                  <div class="flex-1">
                    <p class="font-black text-white">Education Fund</p>
                    <p class="text-white/60 text-sm">Help underprivileged children access quality education</p>
                    <div class="mt-3 flex items-center justify-between">
                      <input type="number" min="100" step="50" 
                             class="w-20 px-2 py-1 bg-white/10 text-white font-bold rounded text-center"
                             placeholder="100">
                      <button class="px-4 py-1 bg-blue-400/20 hover:bg-blue-400/40 text-blue-400 font-bold rounded text-sm transition">
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-8">
          <h2 class="text-2xl font-black text-white mb-6">Recent Activity</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full text-white">
              <thead>
                <tr class="border-b border-white/20">
                  <th class="text-left py-4 px-4 font-black uppercase text-yellow-400 text-sm">Type</th>
                  <th class="text-left py-4 px-4 font-black uppercase text-yellow-400 text-sm">Description</th>
                  <th class="text-left py-4 px-4 font-black uppercase text-yellow-400 text-sm">Date</th>
                  <th class="text-right py-4 px-4 font-black uppercase text-yellow-400 text-sm">Amount</th>
                  <th class="text-left py-4 px-4 font-black uppercase text-yellow-400 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-white/10 hover:bg-white/5 transition" *ngFor="let trans of recentTransactions">
                  <td class="py-4 px-4">
                    <span class="text-xl">{{ getTransactionIcon(trans.type) }}</span>
                  </td>
                  <td class="py-4 px-4 text-white/80">{{ trans.description }}</td>
                  <td class="py-4 px-4 text-white/60 text-sm">{{ trans.date | date: 'short' }}</td>
                  <td class="py-4 px-4 text-right">
                    <span class="text-lg font-black" 
                          [ngClass]="trans.amount > 0 ? 'text-green-400' : 'text-red-400'">
                      {{ trans.amount > 0 ? '+' : '' }}{{ trans.amount }}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold"
                          [ngClass]="getStatusClass(trans.status)">
                      {{ trans.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Load More -->
          <div class="text-center mt-6">
            <button class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition">
              Load More History
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.5rem;
      border-radius: 1rem;
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .action-card {
      padding: 2rem;
      border: 1px solid;
      border-radius: 1rem;
      background: rgba(30, 41, 59, 0.5);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .action-card:hover {
      transform: translateY(-4px);
      border-color: currentColor;
      background: rgba(30, 41, 59, 0.8);
    }

    .redemption-option,
    .charity-card {
      padding: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }

    .redemption-option:hover,
    .charity-card:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
    }

    input {
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    input:focus {
      border-color: rgba(255, 255, 255, 0.5) !important;
      outline: none;
    }
  `]
})
export class RewardsDashboardComponent implements OnInit, OnDestroy {
  totalGold = 4230;
  pendingGold = 890;
  redeemedThisMonth = 1500;
  expiringGold = 245;
  tierLevel = 30;
  charityAmount = 100;

  quickActions: RewardAction[] = [
    {
      icon: '🛍️',
      title: 'Shop More',
      description: 'Earn 2x rewards this week',
      value: 1000,
      color: 'rgb(34, 197, 94)'
    },
    {
      icon: '👥',
      title: 'Refer Friend',
      description: 'Get bonus when they join',
      value: 500,
      color: 'rgb(59, 130, 246)'
    },
    {
      icon: '⭐',
      title: 'Write Review',
      description: 'Bonus for your feedback',
      value: 250,
      color: 'rgb(249, 115, 22)'
    }
  ];

  recentTransactions: GoldTransaction[] = [
    {
      type: 'purchase',
      description: 'Purchase: Summer Collection',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      amount: 500,
      status: 'completed',
      orderId: 'ORD-2024-001'
    },
    {
      type: 'referral',
      description: 'Referral Bonus: Friend joined',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      amount: 250,
      status: 'completed',
      orderId: 'REF-2024-042'
    },
    {
      type: 'redemption',
      description: 'Redeemed for 100 EGP Voucher',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      amount: -200,
      status: 'completed',
      orderId: 'RED-2024-015'
    },
    {
      type: 'birthday',
      description: 'Birthday Bonus',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      amount: 800,
      status: 'completed',
      orderId: 'BDAY-2024-001'
    },
    {
      type: 'purchase',
      description: 'Purchase: Electronics',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      amount: 850,
      status: 'pending',
      orderId: 'ORD-2024-002'
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(private walletService: WalletSubscriptionService) {}

  ngOnInit(): void {
    this.loadUserRewards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserRewards(): void {
    // Load user's gold balance and transactions
  }

  executeAction(action: RewardAction): void {
    alert(`${action.title}: +${action.value} Gold!`);
    this.totalGold += action.value;
  }

  getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      purchase: '🛍️',
      referral: '👥',
      redemption: '🎟️',
      birthday: '🎂',
      bonus: '⭐'
    };
    return icons[type] || '📝';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      completed: 'bg-green-400/20 text-green-400',
      pending: 'bg-yellow-400/20 text-yellow-400',
      failed: 'bg-red-400/20 text-red-400'
    };
    return classes[status] || 'bg-white/20 text-white';
  }
}

// Type for transaction in history
interface GoldTransaction {
  type: string;
  description: string;
  date: Date;
  amount: number;
  status: string;
  orderId: string;
}
