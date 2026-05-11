import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStats } from '../../core/services/admin.service';
import { UsageLimitsService } from '../../core/services/usage-limits.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
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
          <!-- Bar chart -->
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

        <!-- Server Health -->
        <div class="glass-card rounded-3xl p-8 flex flex-col justify-between" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
          <div>
            <h3 class="text-[15px] font-medium mb-8 text-white/90">Server Health</h3>
            <div class="space-y-6">
              @for (metric of serverMetrics; track metric.label) {
                <div>
                  <div class="flex justify-between text-[12px] mb-2">
                    <span class="opacity-50 text-white/60">{{ metric.label }}</span>
                    <span class="text-white/90">{{ metric.value }}%</span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-white/10">
                    <div class="h-full rounded-full transition-all duration-1000" [style.width.%]="metric.value" [style.background]="metric.color" [style.boxShadow]="'0 0 10px ' + metric.color + '44'"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="mt-8 p-4 rounded-2xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20">
            <div class="h-2 w-2 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span class="text-[11px] font-medium text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private usage = inject(UsageLimitsService);
  statCards = signal<any[]>([]);

  apiSeries = computed(() => {
    this.usage.changed();
    return this.usage.getCurrentMonthApiCallsByWeek();
  });

  serverMetrics = [
    { label: 'CPU Usage', value: 24, color: '#818CF8' },
    { label: 'Memory', value: 58, color: '#4FD1C5' },
    { label: 'Database IO', value: 12, color: '#F6AD55' },
  ];

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe(data => {
      this.statCards.set([
        { label: 'Total Users', value: data.totalUsers },
        { label: 'Resumes Created', value: data.totalResumes },
        { label: 'Premium Users', value: data.premiumUsers },
        { label: 'Public Gallery', value: data.publicResumes },
      ]);
    });
  }

  getChartHeight(value: number): number {
    const series = this.apiSeries();
    const peak = Math.max(...series.values, 1);
    return Math.max(8, Math.round((value / peak) * 100));
  }
}
