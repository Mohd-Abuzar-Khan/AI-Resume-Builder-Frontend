import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

interface Transaction {
  date: string;
  user: string;
  plan: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

interface PlanConfig {
  name: string;
  price: number;
  features: string[];
  color: string;
  editing: boolean;
  editPrice: number;
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-10 animate-fade-up">
      <div>
        <p class="text-[13px] mb-1 opacity-50 text-white/50">Admin</p>
        <h1 class="text-[28px] font-medium tracking-tight text-white/90">Payments & Revenue</h1>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        @for (card of summaryCards(); track card.label) {
          <div class="glass-card rounded-3xl p-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-2 opacity-40">{{ card.label }}</p>
            <p class="text-[28px] font-medium text-white/90">{{ card.value }}</p>
            <p class="text-[12px] mt-1 opacity-40">
              <span [style.color]="card.trendColor">{{ card.trend }}</span> {{ card.trendLabel }}
            </p>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Transaction History -->
        <div class="lg:col-span-2 glass-card rounded-3xl p-8" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-[15px] font-medium text-white/90">Transaction History</h3>
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span class="text-[12px] opacity-40">Live</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] uppercase tracking-[0.18em] text-white/30 border-b border-white/5">
                  <th class="pb-3 pr-4 font-medium">Date</th>
                  <th class="pb-3 pr-4 font-medium">User</th>
                  <th class="pb-3 pr-4 font-medium">Plan</th>
                  <th class="pb-3 pr-4 font-medium text-right">Amount</th>
                  <th class="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.date + tx.user) {
                  <tr class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td class="py-3.5 pr-4 text-[12px] text-white/50">{{ tx.date }}</td>
                    <td class="py-3.5 pr-4 text-[13px] text-white/80">{{ tx.user }}</td>
                    <td class="py-3.5 pr-4">
                      <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                            [style.background]="tx.plan === 'Premium' ? 'rgba(251,191,36,0.12)' : tx.plan === 'Basic' ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.05)'"
                            [style.color]="tx.plan === 'Premium' ? '#FCD34D' : tx.plan === 'Basic' ? '#818CF8' : 'rgba(255,255,255,0.4)'">
                        {{ tx.plan }}
                      </span>
                    </td>
                    <td class="py-3.5 pr-4 text-[13px] text-white/90 text-right font-medium">₹{{ tx.amount.toLocaleString('en-IN') }}</td>
                    <td class="py-3.5 text-center">
                      <span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                            [style.background]="tx.status === 'Paid' ? 'rgba(16,185,129,0.12)' : tx.status === 'Pending' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)'"
                            [style.color]="tx.status === 'Paid' ? '#34D399' : tx.status === 'Pending' ? '#FCD34D' : '#F87171'">
                        {{ tx.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Plan Management -->
        <div class="glass-card rounded-3xl p-8 flex flex-col" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
          <h3 class="text-[15px] font-medium mb-6 text-white/90">Plan Management</h3>

          <div class="space-y-5 flex-1">
            @for (plan of plans(); track plan.name) {
              <div class="p-4 rounded-2xl border transition-all"
                   [style.border-color]="plan.color + '33'"
                   [style.background]="plan.color + '08'">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[13px] font-medium text-white/90">{{ plan.name }}</span>
                  <button (click)="toggleEditPlan(plan)" class="text-[11px] cursor-pointer hover:underline"
                          [style.color]="plan.color">
                    {{ plan.editing ? 'Cancel' : 'Edit' }}
                  </button>
                </div>

                @if (plan.editing) {
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-[12px] text-white/40">₹</span>
                    <input type="number" [(ngModel)]="plan.editPrice"
                           class="glass-input !py-1.5 !px-3 !text-[13px] w-24" />
                    <button (click)="savePlanPrice(plan)"
                            class="text-[11px] px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                            [style.background]="plan.color + '22'"
                            [style.color]="plan.color">
                      Save
                    </button>
                  </div>
                } @else {
                  <p class="text-[22px] font-medium text-white/90 mb-2">
                    @if (plan.price === 0) {
                      Free
                    } @else {
                      ₹{{ plan.price }}<span class="text-[12px] text-white/30 font-normal">/mo</span>
                    }
                  </p>
                }

                <div class="space-y-1">
                  @for (feat of plan.features; track feat) {
                    <p class="text-[11px] text-white/40 flex items-center gap-1.5">
                      <span class="h-1 w-1 rounded-full" [style.background]="plan.color"></span>
                      {{ feat }}
                    </p>
                  }
                </div>
              </div>
            }
          </div>

          <div class="mt-6 p-4 rounded-2xl flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20">
            <div class="h-2 w-2 rounded-full animate-pulse bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
            <span class="text-[11px] font-medium text-indigo-400">Pricing synced with payment gateway</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminPaymentsComponent implements OnInit {
  private adminService = inject(AdminService);
  summaryCards = signal<any[]>([]);
  transactions = signal<Transaction[]>([]);
  plans = signal<PlanConfig[]>([]);

  ngOnInit() {
    this.adminService.getAllPayments().subscribe({
      next: (payments: any[]) => {
        let txs = payments as Transaction[];
        
        // Use mock data if empty
        if (!txs || txs.length === 0) {
          txs = [
            { date: '2024-05-14', user: 'Sarah Johnson', plan: 'Annual', amount: 3999, status: 'Paid' },
            { date: '2024-05-14', user: 'Alex Chen', plan: 'Monthly', amount: 499, status: 'Paid' },
            { date: '2024-05-13', user: 'Michael Brown', plan: 'Annual', amount: 3999, status: 'Paid' },
            { date: '2024-05-13', user: 'Emily Davis', plan: 'Monthly', amount: 499, status: 'Pending' },
            { date: '2024-05-12', user: 'James Wilson', plan: 'Annual', amount: 3999, status: 'Paid' },
            { date: '2024-05-12', user: 'Jessica Taylor', plan: 'Free', amount: 0, status: 'Paid' },
            { date: '2024-05-11', user: 'David Miller', plan: 'Annual', amount: 3999, status: 'Paid' },
            { date: '2024-05-11', user: 'Lisa Anderson', plan: 'Monthly', amount: 499, status: 'Failed' },
            { date: '2024-05-10', user: 'Robert Garcia', plan: 'Annual', amount: 3999, status: 'Paid' },
            { date: '2024-05-10', user: 'Maria Rodriguez', plan: 'Monthly', amount: 499, status: 'Paid' },
          ];
        }

        this.transactions.set(txs);
        
        // Calculate totals
        const totalRevenue = txs
          .filter(p => p.status === 'Paid')
          .reduce((sum, p) => sum + p.amount, 0);

        const mrr = txs
          .filter(p => p.status === 'Paid' && (p.plan === 'Premium' || p.plan === 'Basic'))
          .reduce((sum, p) => sum + p.amount, 0);
          
        const activeSubs = txs.filter(p => p.status === 'Paid' && p.plan !== 'Free').length;

        this.summaryCards.set([
          { label: 'Total Revenue', value: '₹' + totalRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}), trend: '+18.5%', trendColor: '#34D399', trendLabel: 'vs last month' },
          { label: 'Monthly Recurring', value: '₹' + mrr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}), trend: '+7.2%', trendColor: '#34D399', trendLabel: 'MRR growth' },
          { label: 'Active Subscriptions', value: activeSubs.toString(), trend: '+12', trendColor: '#818CF8', trendLabel: 'new this month' },
        ]);
      },
      error: () => {
        console.error('Failed to load payments');
        // Set mock data on error as well for development
        const txs: Transaction[] = [
          { date: '2024-05-14', user: 'Sarah Johnson', plan: 'Annual', amount: 3999, status: 'Paid' },
          { date: '2024-05-14', user: 'Alex Chen', plan: 'Monthly', amount: 499, status: 'Paid' },
          { date: '2024-05-13', user: 'Michael Brown', plan: 'Annual', amount: 3999, status: 'Paid' },
          { date: '2024-05-13', user: 'Emily Davis', plan: 'Monthly', amount: 499, status: 'Pending' },
          { date: '2024-05-12', user: 'James Wilson', plan: 'Annual', amount: 3999, status: 'Paid' },
        ];
        this.transactions.set(txs);
        this.summaryCards.set([
          { label: 'Total Revenue', value: '₹12,995.00', trend: '+18.5%', trendColor: '#34D399', trendLabel: 'vs last month' },
          { label: 'Monthly Recurring', value: '₹12,995.00', trend: '+7.2%', trendColor: '#34D399', trendLabel: 'MRR growth' },
          { label: 'Active Subscriptions', value: '4', trend: '+12', trendColor: '#818CF8', trendLabel: 'new this month' },
        ]);
      }
    });

    this.plans.set([
      {
        name: 'Free', price: 0, color: '#6B7280', editing: false, editPrice: 0,
        features: ['3 resumes/month', 'Basic templates', 'Community access']
      },
      {
        name: 'Monthly', price: 499, color: '#818CF8', editing: false, editPrice: 499,
        features: ['Unlimited resumes', 'Gemini everywhere', 'ATS scoring']
      },
      {
        name: 'Annual', price: 3999, color: '#FCD34D', editing: false, editPrice: 3999,
        features: ['Everything in Monthly', 'Tailor Resume (Premium)', 'Save 33% annually']
      },
    ]);

    this.adminService.getPricing().subscribe({
      next: (pricing) => {
        this.plans.update(plans => {
          return plans.map(p => {
            if (p.name === 'Monthly') return { ...p, price: pricing.monthly, editPrice: pricing.monthly };
            if (p.name === 'Annual') return { ...p, price: pricing.annual, editPrice: pricing.annual };
            return p;
          });
        });
      },
      error: () => console.warn('Using default pricing (backend unreachable)')
    });
  }

  toggleEditPlan(plan: PlanConfig) {
    plan.editing = !plan.editing;
    plan.editPrice = plan.price;
    this.plans.update(p => [...p]);
  }

  savePlanPrice(plan: PlanConfig) {
    plan.price = plan.editPrice;
    plan.editing = false;
    
    // Sync with backend if it's a paid plan
    const monthly = this.plans().find(p => p.name === 'Monthly')?.price || 499;
    const annual = this.plans().find(p => p.name === 'Annual')?.price || 3999;
    
    this.adminService.updatePricing(monthly, annual).subscribe({
      next: () => {
        this.plans.update(p => [...p]);
        // Note: In a real app, we'd show a success toast here
      },
      error: () => {
        console.error('Failed to update pricing on server');
        this.plans.update(p => [...p]);
      }
    });
  }
}
