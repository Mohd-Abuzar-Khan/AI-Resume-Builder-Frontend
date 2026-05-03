import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, ArrowRight } from 'lucide-angular';
import { BackendTemplate } from '../core/services/template.service';
import { ResumeService } from '../core/services/resume.service';
import { AuthService } from '../core/services/auth.service';
import { PopupService } from '../core/services/popup.service';

@Component({
  selector: 'app-template-preview-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule],
  template: `
    @if (isOpen && template) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" (click)="close.emit()">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"></div>
        
        <!-- Modal Panel -->
        <div class="relative w-full max-w-4xl max-h-[90vh] glass-modal rounded-[32px] overflow-hidden flex flex-col sm:flex-row border border-white/10 animate-fade-up shadow-2xl" (click)="$event.stopPropagation()">
          
          <!-- Close button -->
          <button (click)="close.emit()" class="absolute top-6 right-6 z-20 h-10 w-10 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all">
            <lucide-icon [name]="CloseIcon" [size]="20"></lucide-icon>
          </button>

          <!-- Preview Side (Left) -->
          <div class="flex-1 bg-white/[0.02] p-8 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar border-r border-white/5">
            <div class="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 group">
               @if (template.thumbnailUrl) {
                 <img [src]="template.thumbnailUrl" class="h-full w-full object-cover" [alt]="template.name">
               } @else {
                 <div class="h-full w-full relative" [style.background]="'hsl(' + (200 + (template.templateId ?? 0) * 20) + ' 40% 35%)'">
                    <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <h2 class="text-2xl font-bold text-white/90">{{ template.name }}</h2>
                      <p class="text-xs text-white/40 mt-2">{{ template.description }}</p>
                    </div>
                 </div>
               }
               <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
            <p class="mt-6 text-[11px] uppercase tracking-widest text-white/30 font-medium">Layout Preview</p>
          </div>

          <!-- Details / Form Side (Right) -->
          <div class="w-full sm:w-[360px] p-10 flex flex-col justify-between bg-black/20">
            @if (mode() === 'preview') {
                <div>
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-[10px] font-bold tracking-widest text-teal-400 uppercase bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">{{ formatCategory(template.category) }}</span>
                    @if (template.isPremium) {
                        <span class="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-widest uppercase inline-flex items-center gap-1">PREMIUM</span>
                    } @else {
                        <span class="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-widest uppercase inline-flex items-center gap-1">FREE</span>
                    }
                  </div>
                  <h3 class="text-[28px] font-bold text-white/90 tracking-tight leading-tight">{{ template.name }}</h3>
                  <p class="text-white/50 mt-4 text-[14px] leading-relaxed">{{ template.description }}</p>
                  
                  <div class="mt-10 space-y-4">
                    <div class="flex items-center justify-between py-3 border-b border-white/5">
                      <span class="text-white/40 text-[13px]">Popularity</span>
                      <span class="text-white/80 font-medium text-[13px]">{{ template.usageCount }}+ users</span>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-white/5">
                      <span class="text-white/40 text-[13px]">ATS Ready</span>
                      <span class="text-teal-400 font-bold text-[11px] uppercase tracking-widest">Optimized</span>
                    </div>
                  </div>
                </div>
                
                <div class="pt-10">
                  <button (click)="useTemplate()" class="w-full justify-center flex items-center gap-2 rounded-2xl bg-white text-slate-900 font-bold py-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 cursor-pointer">
                    Start Building
                    <lucide-icon [name]="ArrowRightIcon" [size]="18"></lucide-icon>
                  </button>
                  <p class="text-center mt-4 text-[11px] text-white/20">No credit card required for free templates</p>
                </div>
            } @else {
                <!-- Create Form -->
                <div class="animate-fade-up">
                  <h3 class="text-2xl font-bold text-white/90 mb-2">Almost there</h3>
                  <p class="text-[13px] text-white/40 mb-8">Give your new resume a title to get started.</p>
                  
                  <form [formGroup]="createForm" (ngSubmit)="createResume()" class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-[11px] font-bold uppercase tracking-widest text-white/30 ml-1">Resume Title</label>
                        <input formControlName="title" class="glass-input w-full py-3.5 text-[14px]" placeholder="e.g. Senior Frontend Role - 2024">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[11px] font-bold uppercase tracking-widest text-white/30 ml-1">Target Job (Optional)</label>
                        <input formControlName="targetJobTitle" class="glass-input w-full py-3.5 text-[14px]" placeholder="e.g. Lead UI Engineer">
                    </div>
                    @if (error()) {
                        <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p class="text-red-400 text-[12px] font-medium">{{ error() }}</p>
                        </div>
                    }
                    
                    <div class="pt-6 space-y-4">
                        <button type="submit" [disabled]="createForm.invalid || isSubmitting()" class="w-full justify-center flex items-center gap-2 rounded-2xl bg-teal-500 text-white font-bold py-4 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50">
                            {{ isSubmitting() ? 'Setting up...' : 'Create & Open Builder' }}
                        </button>
                        <button type="button" (click)="mode.set('preview')" class="w-full justify-center flex items-center py-2 text-[13px] font-medium text-white/30 hover:text-white transition-colors cursor-pointer">
                            Back to preview
                        </button>
                    </div>
                  </form>
                </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class TemplatePreviewModalComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private resumeService = inject(ResumeService);
  private fb = inject(FormBuilder);
  private popup = inject(PopupService);

  @Input() isOpen = false;
  @Input() template: BackendTemplate | null = null;
  @Output() close = new EventEmitter<void>();

  readonly CloseIcon = X;
  readonly ArrowRightIcon = ArrowRight;

  mode = signal<'preview' | 'create'>('preview');
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    targetJobTitle: ['']
  });

  formatCategory(c: string): string {
    return c.replace('_', ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  }

  useTemplate() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/explore' } });
      return;
    }

    if (this.template?.isPremium && this.auth.user()?.plan === 'FREE') {
      this.popup.show({
        type: 'info',
        title: 'Premium Template',
        message: 'This template is available on Premium only. Upgrade your plan to use premium templates in the builder.',
        primaryButtonLabel: 'Upgrade',
        secondaryButtonLabel: 'Cancel',
        onPrimaryClick: () => {
          void this.router.navigate(['/billing']);
        },
      });
      return;
    }

    this.mode.set('create');
  }

  createResume() {
    const template = this.template;
    if (this.createForm.valid && template && template.templateId !== undefined) {
      this.isSubmitting.set(true);
      this.error.set(null);

      this.resumeService.createResume({
        title: this.createForm.value.title!,
        targetJobTitle: this.createForm.value.targetJobTitle,
        templateId: template.templateId
      }).subscribe({
        next: (resume) => {
          this.isSubmitting.set(false);
          this.close.emit();
          this.router.navigate(['/builder', resume.resumeId], { queryParams: { skipTemplate: 'true' } });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err.error?.message || err.message || 'Failed to create resume. Try again.');
        }
      });
    }
  }
}
