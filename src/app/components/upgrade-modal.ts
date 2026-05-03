import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowRight, Sparkles, X } from 'lucide-angular';
import { UpgradePromptService } from '../core/services/upgrade-prompt.service';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (prompt.state(); as state) {
      <div class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <button class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="prompt.close()" aria-label="Close upgrade prompt"></button>

        <div class="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/15 bg-[#111827]/95 p-7 text-white shadow-2xl animate-fade-up">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <lucide-icon [name]="SparklesIcon" class="h-5 w-5"></lucide-icon>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-[0.22em] text-white/45">Free plan limit reached</p>
                <h3 class="mt-2 text-[24px] font-medium tracking-tight">{{ state.title }}</h3>
              </div>
            </div>
            <button (click)="prompt.close()" class="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Dismiss">
              <lucide-icon [name]="CloseIcon" class="h-4 w-4"></lucide-icon>
            </button>
          </div>

          <p class="mt-5 max-w-md text-[14px] leading-relaxed text-white/70">
            {{ state.message }}
          </p>

          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <button (click)="goToBilling()" class="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-medium text-slate-900 transition-colors hover:bg-white/90">
              {{ state.ctaLabel }}
              <lucide-icon [name]="ArrowRightIcon" class="h-4 w-4"></lucide-icon>
            </button>
            <button (click)="prompt.close()" class="rounded-full border border-white/15 px-5 py-3 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white">
              Not now
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UpgradeModalComponent {
  prompt = inject(UpgradePromptService);
  private router = inject(Router);

  readonly ArrowRightIcon = ArrowRight;
  readonly CloseIcon = X;
  readonly SparklesIcon = Sparkles;

  goToBilling(): void {
    this.prompt.close();
    this.router.navigate(['/billing']);
  }
}
