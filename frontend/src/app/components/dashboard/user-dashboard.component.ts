import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-12">
          <div>
            <h1 class="text-4xl font-black text-slate-900 mb-2 italic">Alexandria Rewards</h1>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Member-Only Benefits</p>
          </div>
          <div class="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl">
               <i class="fas fa-gem"></i>
            </div>
            <div>
               <p class="text-[10px] font-black text-slate-400 uppercase">Current Tier</p>
               <p class="text-lg font-black text-blue-900">{{user()?.loyalty?.tier || 'Bronze'}}</p>
            </div>
          </div>
        </div>

        <!-- Loyalty Card -->
        <div class="grid md:grid-cols-3 gap-8">
          <div class="md:col-span-2 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
             <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
             
             <div class="relative z-10">
                <p class="text-blue-200 font-bold uppercase tracking-tighter mb-8">Points Balance</p>
                <div class="flex items-end gap-3 mb-12">
                   <h2 class="text-7xl font-black leading-none tracking-tighter">{{user()?.loyalty?.points || 0}}</h2>
                   <span class="text-2xl font-bold text-blue-300 mb-2">PST</span>
                </div>

                <div class="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-4">
                   <div class="bg-blue-400 h-full transition-all duration-1000" [style.width.%]="pointsProgress"></div>
                </div>
                <p class="text-sm font-bold text-blue-100 italic">{{pointsToNextTier}} more points to unlock Silver perks</p>
             </div>
          </div>

          <!-- Referral Sidebar -->
          <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-center">
             <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🤝</div>
             <h3 class="text-2xl font-black text-slate-900 mb-4">Refer & Earn</h3>
             <p class="text-slate-500 text-sm mb-8 font-medium">Give 50 EGP, Get 50 EGP when your friend buys their first item.</p>
             
             <div class="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-6">
                <p class="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Your Code</p>
                <p class="text-2xl font-black text-slate-900 tracking-widest">{{user()?.loyalty?.referralCode || 'ALEX-592'}}</p>
             </div>
             <button class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-colors uppercase text-sm tracking-widest">Share Now</button>
          </div>
        </div>

        <!-- Tier Perks -->
        <div class="mt-16">
          <h3 class="text-2xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Next Level Perks</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
             <div *ngFor="let perk of perks" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div class="text-3xl mb-4">{{perk.icon}}</div>
                <h4 class="font-black text-slate-900 text-sm mb-1 uppercase">{{perk.title}}</h4>
                <p class="text-[11px] text-slate-400 font-bold tracking-tight">{{perk.desc}}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserDashboardComponent implements OnInit {
  user = signal<any>(null);
  pointsProgress = 45; // Simulated for demo
  pointsToNextTier = 500;

  perks = [
    { icon: '🚚', title: 'Free Shippng', desc: 'On orders over 200 EGP' },
    { icon: '🕙', title: 'Early Access', desc: 'Flash sales start 1h early' },
    { icon: '📈', title: 'Double Pts', desc: 'Earn 2x points on Fridays' },
    { icon: '🏷️', title: 'VIP Support', desc: '24/7 dedicated line' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.user.set(currentUser);
      // Realistic logic: calc progress to next tier (500, 2000, 5000)
    }
  }
}
