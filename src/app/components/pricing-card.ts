import { Component, Input } from '@angular/core';
import { LucideAngularModule, Check } from 'lucide-angular';
import { Tier } from '../data/pricing';
import { cn } from '../lib/utils';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  template: `
    <div
      [class]="cn(
        'relative rounded-3xl p-7 flex flex-col gap-6 transition-all h-full',
        tier.highlight
          ? 'glass-strong scale-[1.02] shadow-2xl'
          : 'glass hover:-translate-y-1'
      )"
    >
      @if (tier.highlight) {
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 tracked-caps bg-white/30 text-on-glass border border-white/40 rounded-full px-3 py-1 backdrop-blur">
          Most popular
        </span>
      }

      <div class="flex flex-col gap-2">
        <div class="text-xl font-medium text-on-glass">{{ tier.name }}</div>
        <p class="text-sm text-on-glass-muted">{{ tier.tagline }}</p>
      </div>

      <div class="flex items-baseline gap-2">
        <span class="font-serif-display text-5xl text-on-glass">{{ tier.price }}</span>
        <span class="text-sm text-on-glass-muted">{{ tier.cadence }}</span>
      </div>

      <ul class="flex flex-col gap-3 text-sm text-on-glass/90">
        @for (f of tier.features; track f) {
          <li class="flex items-start gap-2">
            <lucide-icon [name]="CheckIcon" class="h-4 w-4 mt-0.5 shrink-0 text-on-glass"></lucide-icon>
            <span>{{ f }}</span>
          </li>
        }
      </ul>

      <button
        (click)="onUpgrade()"
        [class]="cn(
          'rounded-full mt-auto h-11 flex items-center justify-center font-medium transition-all cursor-pointer',
          tier.highlight
            ? 'bg-white text-slate-900 hover:bg-white/90'
            : 'bg-white/20 text-on-glass hover:bg-white/30 border border-white/30 backdrop-blur shadow-[inset_0_1px_0_hsl(0_0%_100%/0.4)]'
        )"
      >
        {{ tier.cta }}
      </button>
    </div>
  `,
})
export class PricingCardComponent {
  @Input({ required: true }) tier!: Tier;
  readonly CheckIcon = Check;
  cn = cn;

  constructor(private router: Router) {}

  onUpgrade() {
    if (this.tier.id === 'free') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/billing']);
    }
  }
}
