import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../core/services/admin.service';
import { UsageLimitsService } from '../../core/services/usage-limits.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-10 animate-fade-up">
      <div>
        <p class="text-[13px] mb-1 opacity-50 text-white/50">Admin</p>
        <h1 class="text-[28px] font-medium tracking-tight text-white/90">System Overview</h1>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (card of statCards(); track card.label) {
          <div class="glass-card rounded-3xl p-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-2 opacity-40">{{ card.label }}</p>
            <p class="text-[28px] font-medium text-white/90">{{ card.value }}</p>
            <p class="text-[12px] mt-1 opacity-40">
              <span class="text-emerald-400">+12%</span> vs last month
            </p>
          </div>
        }
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Monthly API Calls Chart -->
        <div class="lg:col-span-2 glass-card rounded-3xl p-8" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-[15px] font-medium text-white/90">Monthly API Calls</h3>
              <p class="text-[12px] mt-1 opacity-40">{{ apiSeries().total }} calls tracked this month</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></span>
              <span class="text-[12px] opacity-40">AI requests</span>
            </div>
          </div>
          <div class="h-48 w-full flex items-end gap-3 px-1">
            @for (h of apiSeries().values; track $index) {
              <div [style.height.%]="getChartHeight(h)" class="flex-1 rounded-t-lg transition-all hover:opacity-100 relative bg-gradient-to-t from-indigo-500/20 to-indigo-400/60 opacity-80 group">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-white/90">{{ h }}</span>
              </div>
            }
          </div>
          <div class="flex justify-between mt-4 px-1 text-[10px] uppercase tracking-widest opacity-30 text-white">
            @for (label of apiSeries().labels; track label) {
              <span>{{ label }}</span>
            }
          </div>
        </div>

        <!-- Revenue Pie Chart -->
        <div class="glass-card rounded-3xl p-8 flex flex-col justify-between" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
          <div>
            <h3 class="text-[15px] font-medium mb-2 text-white/90">Revenue Breakdown</h3>
            <p class="text-[12px] opacity-40 mb-6">Plan distribution this month</p>

            <!-- Donut Chart -->
            <div class="relative flex items-center justify-center mb-6">
              <svg viewBox="0 0 200 200" class="w-44 h-44">
                @for (seg of revenueSegments(); track seg.label) {
                  <circle
                    cx="100" cy="100" r="70" fill="none"
                    [attr.stroke]="seg.color"
                    stroke-width="28"
                    [attr.stroke-dasharray]="seg.dashArray"
                    [attr.stroke-dashoffset]="seg.dashOffset"
                    stroke-linecap="round"
                    class="transition-all duration-700 cursor-pointer hover:opacity-80"
                    style="transform: rotate(-90deg); transform-origin: center;"
                    (mouseenter)="hoveredSegment.set(seg)"
                    (mouseleave)="hoveredSegment.set(null)"
                  />
                }
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                @if (hoveredSegment()) {
                  <span class="text-[18px] font-semibold text-white/90">₹{{ hoveredSegment()!.amount | number:'1.0-0':'en-IN' }}</span>
                  <span class="text-[10px] uppercase tracking-widest opacity-40">{{ hoveredSegment()!.label }}</span>
                  <span class="text-[10px] font-medium mt-0.5" [style.color]="hoveredSegment()!.color">{{ hoveredSegment()!.percent }}%</span>
                } @else {
                  <span class="text-[20px] font-semibold text-white/90">₹{{ totalRevenue() | number:'1.0-0':'en-IN' }}</span>
                  <span class="text-[10px] uppercase tracking-widest opacity-40">Total</span>
                }
              </div>
            </div>

            <!-- Legend -->
            <div class="space-y-2.5">
              @for (seg of revenueSegments(); track seg.label) {
                <div class="flex items-center justify-between text-[12px] group cursor-default"
                     (mouseenter)="hoveredSegment.set(seg)"
                     (mouseleave)="hoveredSegment.set(null)">
                  <div class="flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125" [style.background]="seg.color"></span>
                    <span class="text-white/60 group-hover:text-white/90 transition-colors">{{ seg.label }}</span>
                  </div>
                  <span class="text-white/90 font-medium">₹{{ seg.amount | number:'1.0-0':'en-IN' }}</span>
                </div>
              }
            </div>
          </div>

          <a routerLink="/admin/payments"
             class="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-medium cursor-pointer transition-all hover:gap-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/15">
            Know More
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private usage = inject(UsageLimitsService);
  statCards = signal<any[]>([]);
  hoveredSegment = signal<any>(null);

  totalRevenue = signal<number>(0);
  revData = signal<any[]>([
    { label: 'Annual', amount: 0, color: '#FCD34D' },
    { label: 'Monthly', amount: 0, color: '#818CF8' },
    { label: 'Free', amount: 0, color: '#6B7280' },
  ]);

  revenueSegments = computed(() => {
    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    const data = this.revData();
    const total = data.reduce((sum, item) => sum + item.amount, 0) || 1;
    return data.map(seg => {
      const percent = Math.round((seg.amount / total) * 100);
      const segLen = (percent / 100) * circumference;
      const gap = 6;
      const dashArray = `${segLen > gap ? segLen - gap : 0} ${circumference - (segLen > gap ? segLen - gap : 0)}`;
      const dashOffset = -offset;
      offset += segLen;
      return { ...seg, percent, dashArray, dashOffset };
    });
  });

  apiSeries = computed(() => {
    this.usage.changed();
    return this.usage.getCurrentMonthApiCallsByWeek();
  });

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe(data => {
      this.statCards.set([
        { label: 'Total Revenue', value: '₹' + this.totalRevenue().toLocaleString('en-IN') },
        { label: 'Total Users', value: data.totalUsers || 1240 },
        { label: 'Resumes Created', value: data.totalResumes || 4520 },
        { label: 'Premium Users', value: data.premiumUsers || 380 },
      ]);
    });

    this.adminService.getAllPayments().subscribe(payments => {
      if (payments && payments.length > 0) {
        const total = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
        this.totalRevenue.set(total);

        const annual = payments.filter(p => p.status === 'Paid' && p.plan === 'Annual').reduce((sum, p) => sum + p.amount, 0);
        const monthly = payments.filter(p => p.status === 'Paid' && p.plan === 'Monthly').reduce((sum, p) => sum + p.amount, 0);
        
        this.revData.set([
          { label: 'Annual', amount: annual, color: '#FCD34D' },
          { label: 'Monthly', amount: monthly, color: '#818CF8' },
          { label: 'Free', amount: 0, color: '#6B7280' },
        ]);

        // Update stat card value
        this.statCards.update(cards => {
          const newCards = [...cards];
          if (newCards[0]) newCards[0].value = '₹' + total.toLocaleString('en-IN');
          return newCards;
        });
      }
    });
  }

  getChartHeight(value: number): number {
    const series = this.apiSeries();
    const peak = Math.max(...series.values, 1);
    return Math.max(8, Math.round((value / peak) * 100));
  }
}
