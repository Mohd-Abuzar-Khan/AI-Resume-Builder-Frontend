import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../core/services/payment.service';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { PopupService } from '../core/services/popup.service';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl space-y-10 animate-fade-up">
      <div>
        <p class="text-[13px] mb-1 text-white/40">Billing</p>
        <h1 class="text-[28px] font-medium tracking-tight text-white/90">Billing & Subscription</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Current Plan -->
        <div class="md:col-span-2 glass-card rounded-2xl p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-1 text-white/30">Current plan</p>
              <div class="flex items-center gap-2">
                <span class="text-[28px] font-medium text-white/90">{{ auth.user()?.plan }}</span>
                @if (auth.user()?.plan === 'PREMIUM') {
                  <span class="glass-badge" style="color:#FCD34D; border-color:rgba(251,191,36,0.3)">Active</span>
                }
              </div>
            </div>
          </div>
          <p class="text-[14px] leading-[1.7] mb-6 text-white/40">
            @if (auth.user()?.plan === 'PREMIUM') {
              You have full access to all premium features, including AI-powered resume optimization and unlimited exports.
            } @else {
              You are currently on the free plan. Upgrade to Premium for advanced AI features.
            }
          </p>
          <div class="flex gap-3">
            @if (auth.user()?.plan === 'FREE') {
              <button (click)="goToPricing()" class="btn-primary">Upgrade to Premium</button>
            } @else {
              <button (click)="confirmDowngrade()" class="btn-destructive">Downgrade plan</button>
            }
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="glass-card rounded-2xl p-5 flex flex-col gap-5">
          <div>
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-1 text-white/30">Billing interval</p>
            <p class="text-[14px] font-medium text-white/90">Monthly</p>
          </div>
          <div>
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-1 text-white/30">Next payment</p>
            <p class="text-[14px] font-medium text-white/90">N/A (One-time test)</p>
          </div>
          <div class="mt-auto p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <p class="text-[11px] text-white/30">Secure payments powered by Razorpay</p>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div>
        <h2 class="text-[15px] font-medium mb-4 text-white/90">Payment history</h2>

        @if (history().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-[13px] min-w-[500px]">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="py-3 pr-6 font-medium text-white/40">Order ID</th>
                  <th class="py-3 pr-6 font-medium text-white/40">Date</th>
                  <th class="py-3 pr-6 font-medium text-right text-white/40">Amount</th>
                  <th class="py-3 font-medium text-center text-white/40">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (record of history(); track record.id) {
                  <tr class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td class="py-3 pr-6 font-mono text-[12px] text-white/90">{{ record.orderId }}</td>
                    <td class="py-3 pr-6 text-white/90">{{ record.createdAt | date:'mediumDate' }}</td>
                    <td class="py-3 pr-6 text-right text-white/90">₹{{ record.amount }}</td>
                    <td class="py-3 text-center">
                      <span class="glass-badge"
                            [style.color]="record.status === 'SUCCESS' ? '#4FD1C5' : '#FCD34D'"
                            [style.border-color]="record.status === 'SUCCESS' ? 'rgba(79,209,197,0.2)' : 'rgba(251,191,36,0.2)'">
                        {{ record.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="py-10 text-center">
            <p class="text-[14px] text-white/20">No payment records found.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class BillingPageComponent implements OnInit {
  auth = inject(AuthService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private popup = inject(PopupService);

  history = signal<any[]>([]);

  ngOnInit() {
    const userId = this.auth.getUserId();
    if (userId) {
      this.paymentService.getPaymentHistory(userId).subscribe(history => {
        this.history.set(history);
      });
    }
  }

  goToPricing() { this.router.navigate(['/pricing']); }

  confirmDowngrade() {
    this.popup.confirm(
      'Downgrade Plan',
      'Are you sure you want to downgrade to the free plan? You will lose access to premium templates and advanced AI features.',
      () => {
        this.popup.info('Downgrade Requested', 'Your request has been received. In a production environment, this would process your cancellation and update your status.');
      }
    );
  }
}
