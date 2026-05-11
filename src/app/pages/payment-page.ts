import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../core/services/payment.service';
import { AuthService } from '../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PageShellComponent } from '../components/page-shell';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, PageShellComponent],
  template: `
    <app-page-shell innerClassName="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div class="max-w-md w-full">
        <div class="glass-card p-8 rounded-2xl text-center">
          @if (status() === 'loading') {
            <div class="flex flex-col items-center gap-4 py-8">
              <div class="h-10 w-10 rounded-full animate-spin" style="border:2px solid rgba(0,0,0,0.08); border-top-color:#1F3A6E"></div>
              <h2 class="text-[20px] font-medium" style="color:#111">Processing...</h2>
              <p class="text-[13px]" style="color:rgba(0,0,0,0.45)">Please do not close this window.</p>
            </div>
          } @else if (status() === 'success') {
            <div class="flex flex-col items-center gap-4 py-8">
              <div class="h-16 w-16 rounded-full flex items-center justify-center" style="background:rgba(26,122,110,0.1)">
                <svg class="h-8 w-8" style="color:#1A7A6E" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 class="text-[24px] font-medium" style="color:#1A7A6E">Payment Successful!</h2>
              <p class="text-[14px]" style="color:rgba(0,0,0,0.45)">Your account has been upgraded to PREMIUM.</p>
              <button (click)="goHome()" class="btn-primary mt-2">Go to Dashboard</button>
            </div>
          } @else if (status() === 'failed') {
            <div class="flex flex-col items-center gap-4 py-8">
              <div class="h-16 w-16 rounded-full flex items-center justify-center" style="background:rgba(139,32,32,0.08)">
                <svg class="h-8 w-8" style="color:#8B2020" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
                </svg>
              </div>
              <h2 class="text-[20px] font-medium" style="color:#8B2020">Payment Failed</h2>
              <p class="text-[14px]" style="color:rgba(0,0,0,0.45)">{{ errorMessage() }}</p>
              <button (click)="retry()" class="btn-secondary mt-2">Try Again</button>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-4 py-8">
              <h2 class="text-[20px] font-medium" style="color:#111">Secure Checkout</h2>
              <p class="text-[14px] mb-4" style="color:rgba(0,0,0,0.45)">Upgrading to PREMIUM (₹{{ selectedPrice() }})</p>
              <button (click)="startPayment()" class="btn-primary w-full text-[15px] h-12">Pay with Razorpay</button>
            </div>
          }
        </div>
      </div>
    </app-page-shell>
  `,
})
export class PaymentPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  status = signal<'idle' | 'loading' | 'success' | 'failed'>('idle');
  selectedPrice = signal<number>(499);
  errorMessage = signal('');

  async ngOnInit() {
    const priceParam = this.route.snapshot.queryParamMap.get('price');
    if (priceParam) {
      this.selectedPrice.set(parseInt(priceParam, 10));
    }
    try { await this.paymentService.loadRazorpayScript(); }
    catch (e) { this.status.set('failed'); this.errorMessage.set('Failed to load payment gateway.'); }
  }

  async startPayment() {
    const userProfile = this.authService.currentUserProfile();
    if (!userProfile) { this.router.navigate(['/auth/signin']); return; }
    this.status.set('loading');
    try {
      const orderData = await this.paymentService.createOrder(userProfile.userId, this.selectedPrice()).toPromise();
      const options = {
        key: orderData.key, amount: orderData.amount, currency: orderData.currency,
        name: 'Resumade', description: 'Premium Subscription Upgrade',
        order_id: orderData.orderId,
        prefill: { name: userProfile.fullName, email: userProfile.email },
        theme: { color: '#1F3A6E' }
      };
      const result = await this.paymentService.initiateRazorpay(options);
      await this.paymentService.verifyPayment(result).toPromise();
      await this.authService.refreshProfile();
      this.status.set('success');
    } catch (err: any) {
      if (err === 'dismissed') { this.status.set('idle'); }
      else { this.status.set('failed'); this.errorMessage.set(err?.error?.message || 'Something went wrong.'); }
    }
  }

  goHome() { this.router.navigate(['/dashboard']); }
  retry() { this.status.set('idle'); this.errorMessage.set(''); }
}
