import { Injectable, signal } from '@angular/core';

export interface UpgradePromptState {
  title: string;
  message: string;
  ctaLabel: string;
}

@Injectable({
  providedIn: 'root',
})
export class UpgradePromptService {
  private readonly promptState = signal<UpgradePromptState | null>(null);

  readonly state = this.promptState.asReadonly();

  open(state: Partial<UpgradePromptState> = {}): void {
    this.promptState.set({
      title: state.title ?? 'Upgrade your plan',
      message: state.message ?? 'Free monthly limits have been reached. Upgrade to continue using AI tools and creating resumes.',
      ctaLabel: state.ctaLabel ?? 'Go to billing',
    });
  }

  close(): void {
    this.promptState.set(null);
  }
}
