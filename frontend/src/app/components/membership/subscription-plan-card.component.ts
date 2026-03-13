import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipTier, WalletSubscriptionService } from '../../services/wallet-subscription.service';

interface PlanFeature {
  icon: string;
  title: string;
  description: string;
}

interface SubscriptionPlan {
  id: string;
  tier: MembershipTier;
  name: string;
  icon: string;
  monthlyPrice: number;
  annualPrice: number;
  discount: number;
  benefits: PlanFeature[];
  popular: boolean;
  color: string;
}

@Component({
  selector: 'app-subscription-plan-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-nile py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-pharaonic mb-4 uppercase">
            Premium Subscription Plans
          </h1>
          <p class="text-xl text-white/70 mb-8">Choose your membership and start enjoying exclusive benefits</p>

          <!-- Billing Toggle -->
          <div class="flex justify-center items-center gap-4 mb-8">
            <span class="text-white font-bold" [class.opacity-50]="billingPeriod === 'annual'">Monthly</span>
            <button (click)="toggleBilling()" class="toggle-button" [class.annual]="billingPeriod === 'annual'">
              <span></span>
            </button>
            <span class="text-white font-bold" [class.opacity-50]="billingPeriod === 'monthly'">
              Annual
              <span class="text-yellow-400 text-sm font-black ml-2">SAVE 20%</span>
            </span>
          </div>
        </div>

        <!-- Plans Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          <div *ngFor="let plan of subscriptionPlans; let i = index" 
               class="plan-card-wrapper" 
               [style.animation-delay]="(i * 0.1) + 's'"
               [class.popular]="plan.popular">
            
            <!-- Popular Badge -->
            <div *ngIf="plan.popular" class="popular-badge">
              ⭐ MOST POPULAR
            </div>

            <!-- Card -->
            <div class="plan-card" [style.borderColor]="plan.color">
              <!-- Icon & Name -->
              <div class="text-center mb-6">
                <div class="text-5xl mb-3">{{ plan.icon }}</div>
                <h2 class="text-2xl font-black text-white">{{ plan.name }}</h2>
                <p class="text-white/60 text-sm mt-1">Tier: {{ plan.tier }}</p>
              </div>

              <!-- Price -->
              <div class="text-center mb-8 p-4 bg-white/5 rounded-lg">
                <div class="text-4xl font-black text-transparent bg-clip-text" [style.backgroundImage]="getGradient(plan.color)">
                  {{ getCurrentPrice(plan) }} EGP
                </div>
                <p class="text-white/60 text-sm mt-2">
                  {{ billingPeriod === 'monthly' ? 'per month' : 'per year' }}
                </p>
                <div *ngIf="billingPeriod === 'annual'" class="text-green-400 text-xs font-bold mt-2">
                  💰 Save {{ plan.discount * 12 }} EGP/year
                </div>
              </div>

              <!-- Features List -->
              <div class="space-y-3 mb-8">
                <div *ngFor="let benefit of getPlanBenefits(plan)" class="flex items-start gap-2">
                  <span class="text-green-400 font-black mt-1">✓</span>
                  <span class="text-white/80 text-sm">{{ benefit }}</span>
                </div>
              </div>

              <!-- CTA Button -->
              <button (click)="selectPlan(plan)" 
                      [style.backgroundColor]="plan.color"
                      class="w-full py-3 font-black rounded-lg text-black transition-all hover:shadow-lg active:scale-95 uppercase text-sm tracking-wider">
                {{ isCurrentPlan(plan) ? '✓ Current Plan' : 'Subscribe Now' }}
              </button>

              <!-- Annual Savings Info -->
              <div *ngIf="billingPeriod === 'annual'" class="mt-4 text-center">
                <p class="text-xs text-white/60">
                  <span class="font-bold text-yellow-400">Best Value!</span>
                  {{ ((plan.discount / plan.monthlyPrice) * 100).toFixed(0) }}% savings
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Table -->
        <div class="bg-slate-900/50 backdrop-blur rounded-3xl border border-white/10 p-8 overflow-hidden">
          <h2 class="text-3xl font-black text-white mb-8">Complete Plan Comparison</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full text-white">
              <thead>
                <tr class="border-b-2 border-white/20">
                  <th class="text-left py-4 px-4 font-black uppercase text-yellow-400">Feature</th>
                  <th *ngFor="let plan of subscriptionPlans" class="text-center py-4 px-4 font-black uppercase text-sm text-yellow-400">
                    {{ plan.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-white/10" *ngFor="let feature of comparisonFeatures">
                  <td class="py-4 px-4 font-bold text-white/80 sticky left-0 bg-slate-900/50">{{ feature.name }}</td>
                  <td *ngFor="let plan of subscriptionPlans" class="text-center py-4 px-4">
                    <span class="text-green-400 font-black" *ngIf="getFeatureValue(plan, feature)">
                      {{ getFeatureValue(plan, feature) }}
                    </span>
                    <span class="text-white/40 font-black" *ngIf="!getFeatureValue(plan, feature)">
                      —
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-16 max-w-3xl mx-auto">
          <h2 class="text-3xl font-black text-white mb-8 text-center">Questions?</h2>
          
          <div class="space-y-4">
            <div class="faq-item" *ngFor="let faq of faqs">
              <button class="w-full text-left p-4 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-white/10 hover:border-white/30 transition"
                      (click)="toggleFAQ(faq)">
                <div class="flex items-center justify-between">
                  <span class="font-black text-white">{{ faq.question }}</span>
                  <span class="text-yellow-400 font-black transition" [class.rotate-180]="faq.open">
                    ▼
                  </span>
                </div>
              </button>
              <div *ngIf="faq.open" class="p-4 bg-slate-900/20 border-l-2 border-yellow-400/50">
                <p class="text-white/80">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-card-wrapper {
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
      position: relative;
    }

    .plan-card-wrapper.popular {
      transform: scale(1.05);
    }

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

    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgb(251, 191, 36), rgb(217, 119, 6));
      color: black;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: 900;
      font-size: 0.75rem;
      z-index: 10;
    }

    .plan-card {
      padding: 2rem;
      border: 2px solid;
      border-radius: 1.5rem;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(10px);
      h-full;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .plan-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(251, 191, 36, 0.1);
    }

    .toggle-button {
      width: 3rem;
      height: 1.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 2rem;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .toggle-button span {
      position: absolute;
      top: 0.25rem;
      left: 0.25rem;
      width: 1.25rem;
      height: 1.25rem;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .toggle-button.annual {
      background: rgba(251, 191, 36, 0.2);
      border-color: rgb(251, 191, 36);
    }

    .toggle-button.annual span {
      transform: translateX(1.25rem);
    }

    .faq-item {
      animation: slideUp 0.6s ease-out;
    }
  `]
})
export class SubscriptionPlanCardComponent implements OnInit {
  @Input() currentUserPlan: MembershipTier = MembershipTier.BRONZE;
  @Output() planSelected = new EventEmitter<SubscriptionPlan>();

  billingPeriod: 'monthly' | 'annual' = 'monthly';

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'bronze',
      tier: MembershipTier.BRONZE,
      name: 'Bronze',
      icon: '🥉',
      monthlyPrice: 0,
      annualPrice: 0,
      discount: 0,
      popular: false,
      color: 'rgb(180, 83, 9)',
      benefits: []
    },
    {
      id: 'silver',
      tier: MembershipTier.SILVER,
      name: 'Silver',
      icon: '🥈',
      monthlyPrice: 29,
      annualPrice: 290,
      discount: 58,
      popular: false,
      color: 'rgb(107, 114, 128)',
      benefits: []
    },
    {
      id: 'gold',
      tier: MembershipTier.GOLD,
      name: 'Gold',
      icon: '🥇',
      monthlyPrice: 59,
      annualPrice: 590,
      discount: 118,
      popular: true,
      color: 'rgb(251, 191, 36)',
      benefits: []
    },
    {
      id: 'platinum',
      tier: MembershipTier.PLATINUM,
      name: 'Platinum',
      icon: '💎',
      monthlyPrice: 99,
      annualPrice: 990,
      discount: 198,
      popular: false,
      color: 'rgb(168, 85, 247)',
      benefits: []
    },
    {
      id: 'pharaoh',
      tier: MembershipTier.PHARAOH,
      name: 'Pharaoh',
      icon: '👑',
      monthlyPrice: 199,
      annualPrice: 1990,
      discount: 398,
      popular: false,
      color: 'rgb(236, 72, 153)',
      benefits: []
    }
  ];

  comparisonFeatures = [
    { name: 'Monthly Price', icon: '💰' },
    { name: 'Discount Rate', icon: '✂️' },
    { name: 'Rewards Rate', icon: '⭐' },
    { name: 'Free Shipping', icon: '🚚' },
    { name: 'Express Checkout', icon: '⚡' },
    { name: 'Support', icon: '🎧' },
    { name: 'Birthday Bonus', icon: '🎂' },
    { name: 'VIP Events', icon: '🎉' },
    { name: 'Personal Assistant', icon: '👤' }
  ];

  faqs = [
    {
      question: 'Can I change my subscription anytime?',
      answer: 'Yes! You can upgrade or downgrade your subscription at any time. Changes take effect immediately for upgrades or at the end of your billing cycle for downgrades.',
      open: false
    },
    {
      question: 'What happens to my rewards when I upgrade?',
      answer: 'All your existing rewards transfer to your new tier. You\'ll continue earning at the higher rate immediately after upgrading.',
      open: false
    },
    {
      question: 'Is there a long-term commitment?',
      answer: 'No! All subscriptions are flexible. You can cancel anytime without penalties. If you cancel, your benefits continue until the end of your billing period.',
      open: false
    },
    {
      question: 'Do you offer corporate plans?',
      answer: 'Yes! We offer customized corporate plans for businesses. Contact our sales team at corporate@alexandria.com for more information.',
      open: false
    }
  ];

  constructor(private walletService: WalletSubscriptionService) {}

  ngOnInit(): void {
    // Initialize plans with benefits from service
    this.loadPlanBenefits();
  }

  loadPlanBenefits(): void {
    // Load benefits for each tier from the service
  }

  toggleBilling(): void {
    this.billingPeriod = this.billingPeriod === 'monthly' ? 'annual' : 'monthly';
  }

  getCurrentPrice(plan: SubscriptionPlan): number {
    if (plan.tier === 'bronze') return 0;
    return this.billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  }

  getPlanBenefits(plan: SubscriptionPlan): string[] {
    const tierInfo = this.walletService.getMembershipTierInfo(plan.tier);
    if (!tierInfo) return [];
    return tierInfo.benefits.slice(0, 5).map(b => b.name);
  }

  getFeatureValue(plan: SubscriptionPlan, feature: any): string {
    const tierInfo = this.walletService.getMembershipTierInfo(plan.tier);
    if (!tierInfo) return '';

    switch (feature.name) {
      case 'Monthly Price':
        return plan.tier === 'bronze' ? 'Free' : `${plan.monthlyPrice} EGP`;
      case 'Discount Rate':
        return `${tierInfo.discountPercentage}%`;
      case 'Rewards Rate':
        return `${tierInfo.goldRewardRate}x`;
      case 'Free Shipping':
        return tierInfo.tier !== 'bronze' ? '✓' : '';
      case 'Express Checkout':
        return ['platinum', 'pharaoh'].includes(plan.tier) ? '✓' : '';
      case 'Support':
        return ['platinum', 'pharaoh'].includes(plan.tier) ? '24/7' : 'Business Hours';
      case 'VIP Events':
        return ['gold', 'platinum', 'pharaoh'].includes(plan.tier) ? '✓' : '';
      case 'Personal Assistant':
        return ['platinum', 'pharaoh'].includes(plan.tier) ? '✓' : '';
      default:
        return '';
    }
  }

  isCurrentPlan(plan: SubscriptionPlan): boolean {
    return plan.tier === this.currentUserPlan;
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.planSelected.emit(plan);
    // TODO: Navigate to payment page
  }

  toggleFAQ(faq: any): void {
    faq.open = !faq.open;
  }

  getGradient(color: string): string {
    return `linear-gradient(135deg, ${color}, ${color}cc)`;
  }
}
