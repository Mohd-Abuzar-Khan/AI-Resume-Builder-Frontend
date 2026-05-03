import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupService, PopupState } from '../core/services/popup.service';
import { LucideAngularModule, AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (popup.activePopup(); as state) {
      <div class="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <button class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="close()" aria-label="Close popup"></button>

        <div class="relative w-full max-w-sm overflow-hidden rounded-[20px] border border-white/15 bg-slate-900/95 p-6 text-white shadow-2xl animate-fade-up">
          <!-- Close button -->
          <button (click)="close()" class="absolute top-4 right-4 p-1.5 rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Dismiss">
            <lucide-icon [name]="CloseIcon" class="h-4 w-4"></lucide-icon>
          </button>

          <!-- Header with icon -->
          <div class="flex items-start gap-3 mb-4">
            @switch (state.type) {
              @case ('success') {
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400 flex-shrink-0">
                  <lucide-icon [name]="CheckCircleIcon" class="h-5 w-5"></lucide-icon>
                </div>
              }
              @case ('error') {
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/20 text-rose-400 flex-shrink-0">
                  <lucide-icon [name]="AlertTriangleIcon" class="h-5 w-5"></lucide-icon>
                </div>
              }
              @case ('confirm') {
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 flex-shrink-0">
                  <lucide-icon [name]="AlertCircleIcon" class="h-5 w-5"></lucide-icon>
                </div>
              }
              @case ('info') {
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400/20 text-blue-400 flex-shrink-0">
                  <lucide-icon [name]="InfoIcon" class="h-5 w-5"></lucide-icon>
                </div>
              }
              @default {
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 flex-shrink-0">
                  <lucide-icon [name]="AlertCircleIcon" class="h-5 w-5"></lucide-icon>
                </div>
              }
            }
            <div class="flex-1">
              <h3 class="text-lg font-semibold leading-tight">{{ state.title }}</h3>
            </div>
          </div>

          <!-- Message -->
          <p class="mb-6 text-sm leading-relaxed text-white/70">
            {{ state.message }}
          </p>

          <!-- Buttons -->
          <div class="flex flex-col gap-2.5 sm:flex-row">
            @if (state.type === 'confirm' || state.secondaryButtonLabel) {
              <button 
                (click)="handleSecondaryClick(state)" 
                [disabled]="isProcessing()"
                class="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                {{ state.secondaryButtonLabel || 'Cancel' }}
              </button>
            }
            <button 
              (click)="handlePrimaryClick(state)" 
              [disabled]="isProcessing()"
              [ngClass]="{
                'bg-white text-slate-900 hover:bg-white/90': state.type !== 'error',
                'bg-rose-600 text-white hover:bg-rose-700': state.type === 'error',
                'bg-emerald-600 text-white hover:bg-emerald-700': state.type === 'success',
                'bg-amber-600 text-white hover:bg-amber-700': state.type === 'confirm'
              }"
              class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isProcessing() ? 'Processing...' : (state.primaryButtonLabel || 'OK') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-up {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    :host ::ng-deep .animate-fade-up {
      animation: fade-up 0.3s ease-out;
    }
  `]
})
export class PopupComponent {
  popup = inject(PopupService);
  isProcessing = signal(false);

  readonly CloseIcon = X;
  readonly AlertCircleIcon = AlertCircle;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly CheckCircleIcon = CheckCircle;
  readonly InfoIcon = Info;

  async handlePrimaryClick(state: PopupState): Promise<void> {
    if (state.onPrimaryClick) {
      this.isProcessing.set(true);
      try {
        await state.onPrimaryClick();
      } finally {
        this.isProcessing.set(false);
      }
    }
    this.popup.close();
  }

  async handleSecondaryClick(state: PopupState): Promise<void> {
    if (state.onSecondaryClick) {
      this.isProcessing.set(true);
      try {
        await state.onSecondaryClick();
      } finally {
        this.isProcessing.set(false);
      }
    }
    this.popup.close();
  }

  close(): void {
    this.popup.close();
  }
}
