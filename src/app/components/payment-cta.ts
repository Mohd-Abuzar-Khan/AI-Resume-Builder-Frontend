import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-payment-cta',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Only show for free users, hidden by default until explicitly shown -->
  `,
})
export class PaymentCtaComponent {
  auth = inject(AuthService);
}
