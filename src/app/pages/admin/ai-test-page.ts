import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';
import { LucideAngularModule, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-angular';

@Component({
  selector: 'app-ai-test',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="animate-fade-up max-w-4xl mx-auto">
      <div class="mb-10">
        <div class="flex items-center gap-4 mb-3">
          <div class="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(79,209,197,0.1)]">
            <lucide-icon [name]="SparklesIcon" [size]="28"></lucide-icon>
          </div>
          <div>
            <p class="text-[13px] text-white/40 uppercase tracking-widest mb-1">Admin Lab</p>
            <h2 class="text-[32px] font-medium tracking-tight text-white/90">Gemini AI Test Hub</h2>
          </div>
        </div>
        <p class="text-[15px] text-white/50 leading-relaxed max-w-2xl">
          Directly interact with the Gemini 2.5 Flash model to verify system connectivity and response quality.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <!-- Input Section -->
        <div class="glass-card rounded-3xl p-8" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
          <div class="flex flex-col gap-6">
            <div class="space-y-3">
              <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Input Prompt</label>
              <textarea 
                [(ngModel)]="prompt" 
                rows="5" 
                class="glass-input w-full resize-none py-4 px-5 text-[15px] leading-relaxed" 
                placeholder="Ask Gemini anything..."></textarea>
            </div>
            
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                @if (status() === 'success') {
                  <span class="flex items-center gap-2 text-[12px] text-emerald-400 font-medium glass-badge border-emerald-500/20 bg-emerald-500/5">
                    <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    System Online
                  </span>
                } @else if (status() === 'error') {
                   <span class="flex items-center gap-2 text-[12px] text-rose-400 font-medium glass-badge border-rose-500/20 bg-rose-500/5">
                    <div class="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                    API Error
                  </span>
                }
              </div>
              
              <button 
                (click)="runTest()" 
                [disabled]="!prompt.trim() || isLoading()"
                class="btn-primary flex items-center gap-3 px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(129,140,248,0.2)] disabled:opacity-50 transition-all hover:scale-[1.02]">
                <span class="font-medium">{{ isLoading() ? 'Thinking...' : 'Generate Response' }}</span>
                <lucide-icon [name]="SendIcon" [size]="18" [class.animate-pulse]="isLoading()"></lucide-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Result Section -->
        @if (response() || isLoading()) {
          <div class="glass-card rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-[12px] font-semibold uppercase tracking-widest text-white/30">Gemini Response</h3>
              <button (click)="response.set(''); prompt = ''" class="text-[12px] text-teal-400 hover:text-teal-300 transition-colors">Clear all</button>
            </div>

            @if (isLoading()) {
              <div class="space-y-4">
                <div class="h-5 w-full bg-white/5 animate-pulse rounded-lg"></div>
                <div class="h-5 w-11/12 bg-white/5 animate-pulse rounded-lg"></div>
                <div class="h-5 w-4/5 bg-white/5 animate-pulse rounded-lg"></div>
                <div class="h-5 w-full bg-white/5 animate-pulse rounded-lg opacity-50"></div>
              </div>
            } @else {
              <div class="prose prose-invert prose-sm max-w-none text-[16px] leading-relaxed text-white/80 whitespace-pre-wrap font-sans">
                {{ response() }}
              </div>
            }
          </div>
        }

        <!-- Connection Details -->
        <div class="flex flex-wrap items-center gap-8 px-4 opacity-40">
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            <span class="text-[11px] font-semibold uppercase tracking-widest">Model: gemini-2.5-flash</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            <span class="text-[11px] font-semibold uppercase tracking-widest">Protocol: v1 API</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
            <span class="text-[11px] font-semibold uppercase tracking-widest">Mode: Admin Auth</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AiTestPageComponent {
  private aiService = inject(AiService);

  prompt = '';
  response = signal<string>('');
  isLoading = signal(false);
  status = signal<'idle' | 'success' | 'error'>('idle');

  readonly SendIcon = Send;
  readonly SparklesIcon = Sparkles;
  readonly ErrorIcon = AlertCircle;
  readonly CheckIcon = CheckCircle2;

  runTest() {
    if (!this.prompt.trim()) return;

    this.isLoading.set(true);
    this.status.set('idle');
    this.response.set('');

    this.aiService.testAi(this.prompt).subscribe({
      next: (res) => {
        this.response.set(res);
        this.isLoading.set(false);
        this.status.set('success');
      },
      error: (err) => {
        console.error('AI Test failed', err);
        this.response.set('ERROR: ' + (err.error?.message || err.message || 'Failed to get response from Gemini. Check console for details.'));
        this.isLoading.set(false);
        this.status.set('error');
      }
    });
  }
}
