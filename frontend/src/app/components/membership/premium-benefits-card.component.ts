import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipTier } from '../../services/wallet-subscription.service';

interface BenefitCard {
  icon: string;
  title: string;
  description: string;
  value?: string;
  color: string;
  badge?: string;
}

@Component({
  selector: 'app-premium-benefits-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-nile py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-16">
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-pharaonic mb-4 uppercase tracking-tighter">
            Premium Member Benefits
          </h1>
          <p class="text-xl text-white/80 font-semibold">Experience Excellence with Every Purchase</p>
        </div>

        <!-- Benefits Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <ng-container *ngFor="let benefit of benefitCards; let i = index">
            <div class="benefit-card-wrapper group cursor-pointer" [style.animation-delay]="(i * 0.1) + 's'">
              <!-- Glow Effect -->
              <div class="absolute -inset-0.5 bg-gradient-pharaonic rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-300"></div>
              
              <!-- Card -->
              <div class="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-white/10 group-hover:border-white/30 transition-all duration-300 h-full flex flex-col">
                
                <!-- Icon & Badge -->
                <div class="flex justify-between items-start mb-6">
                  <div class="text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition">{{ benefit.icon }}</div>
                  <span *ngIf="benefit.badge" class="px-3 py-1 bg-gradient-pharaonic text-black font-black text-xs rounded-full uppercase">{{ benefit.badge }}</span>
                </div>

                <!-- Content -->
                <h3 class="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-pharaonic transition">
                  {{ benefit.title }}
                </h3>
                <p class="text-white/70 flex-1 mb-4 leading-relaxed">{{ benefit.description }}</p>

                <!-- Value Display -->
                <div *ngIf="benefit.value" class="pt-4 border-t border-white/10">
                  <p class="text-sm text-white/60 mb-2 uppercase font-bold">Value</p>
                  <p class="text-3xl font-black text-transparent bg-clip-text" [style.backgroundImage]="getGradient(benefit.color)">
                    {{ benefit.value }}
                  </p>
                </div>

                <!-- Footer Line -->
                <div class="mt-4 h-1 w-0 group-hover:w-full transition-all duration-300 rounded" [style.background]="benefit.color"></div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Tier-Specific Benefits -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <!-- Bronze/Silver -->
          <div class="tier-section bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-white/10">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-5xl">🥉</span>
              <div>
                <h2 class="text-2xl font-black text-white">Bronze & Silver Tiers</h2>
                <p class="text-white/60">Great starter benefits</p>
              </div>
            </div>
            <ul class="space-y-3">
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-green-400 font-black mt-1">▪</span>
                <span>Early access to seasonal sales</span>
              </li>
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-green-400 font-black mt-1">▪</span>
                <span>Birthday discounts (500-750 EGP)</span>
              </li>
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-green-400 font-black mt-1">▪</span>
                <span>Exclusive member-only products</span>
              </li>
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-green-400 font-black mt-1">▪</span>
                <span>Priority customer support</span>
              </li>
            </ul>
          </div>

          <!-- Gold/Platinum -->
          <div class="tier-section bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-yellow-400/30">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-5xl">🥇</span>
              <div>
                <h2 class="text-2xl font-black text-white">Gold & Platinum</h2>
                <p class="text-yellow-400/80">Premium tier privileges</p>
              </div>
            </div>
            <ul class="space-y-3">
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-yellow-400 font-black mt-1">▪</span>
                <span>Express shipping (2-3 business days)</span>
              </li>
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-yellow-400 font-black mt-1">▪</span>
                <span>Exclusive VIP events & previews</span>
              </li>
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-yellow-400 font-black mt-1">▪</span>
                <span>Personal shopping assistant</span>
              </li>
              <li class="text-white/80 flex gap-3 items-start">
                <span class="text-yellow-400 font-black mt-1">▪</span>
                <span>Higher rewards multiplier</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Pharaoh Tier Special -->
        <div class="bg-gradient-to-r from-yellow-600/20 via-purple-600/20 to-yellow-600/20 rounded-3xl p-10 border-2 border-yellow-400/50 mb-16 overflow-hidden relative">
          <div class="absolute top-0 right-0 text-9xl opacity-10 font-black">👑</div>
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-8">
              <span class="text-7xl">👑</span>
              <div>
                <h2 class="text-4xl font-black text-white uppercase">Pharaoh Tier Exclusive</h2>
                <p class="text-yellow-400 font-bold">The Ultimate Alexandria Experience</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="benefit-pharaoh">
                <p class="text-sm text-white/60 uppercase mb-2 font-bold">Maximum Discount</p>
                <p class="text-4xl font-black text-yellow-400">20%</p>
                <p class="text-white/70 text-sm mt-2">On all purchases, always</p>
              </div>

              <div class="benefit-pharaoh border-l border-r border-white/20">
                <p class="text-sm text-white/60 uppercase mb-2 font-bold">Rewards Rate</p>
                <p class="text-4xl font-black text-green-400">5%</p>
                <p class="text-white/70 text-sm mt-2">Earn on every transaction</p>
              </div>

              <div class="benefit-pharaoh">
                <p class="text-sm text-white/60 uppercase mb-2 font-bold">Shipping</p>
                <p class="text-4xl font-black text-blue-400">24 hrs</p>
                <p class="text-white/70 text-sm mt-2">Priority expedited delivery</p>
              </div>

              <div class="benefit-pharaoh">
                <p class="text-sm text-white/60 uppercase mb-2 font-bold">Annual Bonus</p>
                <p class="text-4xl font-black text-purple-400">Custom</p>
                <p class="text-white/70 text-sm mt-2">Personalized luxury rewards</p>
              </div>

              <div class="benefit-pharaoh border-l border-r border-white/20">
                <p class="text-sm text-white/60 uppercase mb-2 font-bold">Personal Agent</p>
                <p class="text-xl font-black text-white">✓</p>
                <p class="text-white/70 text-sm mt-2">Dedicated shopping concierge</p>
              </div>

              <div class="benefit-pharaoh">
                <p class="text-sm text-white/60 uppercase mb-2 font-bold">VIP Support</p>
                <p class="text-xl font-black text-white">✓</p>
                <p class="text-white/70 text-sm mt-2">24/7 private concierge</p>
              </div>
            </div>
          </div>
        </div>

        <!-- How to Unlock Section -->
        <div class="bg-slate-900/50 backdrop-blur rounded-3xl border border-white/10 p-10">
          <h2 class="text-3xl font-black text-white mb-8">How to Unlock Premium Tiers</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div class="step-card" *ngFor="let step of unlockedSteps; let i = index">
              <div class="flex flex-col h-full">
                <!-- Step Number -->
                <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-pharaonic mb-4">
                  {{ i + 1 }}
                </div>
                
                <!-- Step Content -->
                <h3 class="text-lg font-black text-white mb-3">{{ step.title }}</h3>
                <p class="text-white/70 flex-1">{{ step.description }}</p>
                
                <!-- CTA -->
                <button class="mt-4 py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition text-sm">
                  {{ step.cta }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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

    .benefit-card-wrapper {
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
    }

    .tier-section {
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .benefit-pharaoh {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 1rem;
      transition: all 0.3s ease;
    }

    .benefit-pharaoh:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-4px);
    }

    .step-card {
      padding: 2rem;
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(75, 85, 99, 0.1));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
    }

    .step-card:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2));
      transform: translateY(-4px);
    }
  `]
})
export class PremiumBenefitsCardComponent implements OnInit {
  @Input() userTier: MembershipTier = MembershipTier.BRONZE;

  benefitCards: BenefitCard[] = [
    {
      icon: '🎁',
      title: 'Exclusive Rewards',
      description: 'Earn points on every purchase and redeem for exclusive items, discounts, or donate to charity',
      value: 'Up to 5%',
      color: 'rgb(34, 197, 94)',
      badge: 'TOP VALUE'
    },
    {
      icon: '🚚',
      title: 'Fast & Free Shipping',
      description: 'Enjoy free shipping on orders over 200 EGP, with express 24-hour delivery for premium tiers',
      value: 'Save 50+ EGP',
      color: 'rgb(59, 130, 246)',
      badge: 'NEW'
    },
    {
      icon: '💎',
      title: 'Exclusive Access',
      description: 'Early access to new collections, limited-edition items, and members-only sales events',
      value: '24+ Events/Year',
      color: 'rgb(168, 85, 247)',
      badge: undefined
    },
    {
      icon: '🎂',
      title: 'Birthday Bonus',
      description: 'Receive personalized birthday credits ranging from 500 to unlimited EGP based on your tier',
      value: 'Up to 5,000 EGP',
      color: 'rgb(249, 115, 22)',
      badge: undefined
    },
    {
      icon: '👥',
      title: 'Personal Assistant',
      description: 'Get help from a dedicated shopping consultant who knows your preferences and style',
      value: 'Available 24/7',
      color: 'rgb(236, 72, 153)',
      badge: 'PLATINUM+'
    },
    {
      icon: '⭐',
      title: 'VIP Priority Support',
      description: 'Skip the queue with dedicated support channels and priority response times',
      value: 'Under 2 Hours',
      color: 'rgb(251, 191, 36)',
      badge: undefined
    }
  ];

  unlockedSteps = [
    {
      title: 'Create Account',
      description: 'Join Alexandria and start your membership journey as Bronze tier',
      cta: 'Sign Up →'
    },
    {
      title: 'Make Purchases',
      description: 'Shop regularly and accumulate spending to unlock higher tiers',
      cta: 'Start Shopping →'
    },
    {
      title: 'Reach Milestone',
      description: 'Hit spending targets (200, 500, 2000, 10000 EGP) to advance tiers',
      cta: 'My Progress →'
    },
    {
      title: 'Enjoy Benefits',
      description: 'Access all tier benefits including discounts, rewards, and exclusive events',
      cta: 'View Benefits →'
    },
    {
      title: 'Stay Active',
      description: 'Maintain your tier status by continuing to shop and engage with Alexandria',
      cta: 'Shop Now →'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Initialize component with user tier if needed
  }

  getGradient(color: string): string {
    return `linear-gradient(135deg, ${color}, ${color}99)`;
  }
}
