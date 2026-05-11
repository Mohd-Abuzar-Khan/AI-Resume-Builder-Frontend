import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { AuthService } from '../core/services/auth.service';
import { PopupService } from '../core/services/popup.service';
import { LucideAngularModule, ChevronLeft, Copy, Loader2, Sparkles, User as UserIcon } from 'lucide-angular';
import { PageShellComponent } from '../components/page-shell';
import { ResumeRendererComponent } from '../components/resume-renderer/resume-renderer.component';
import { ResumeDataMapperService } from '../core/services/resume-data-mapper.service';
import { TemplateService, BackendTemplate } from '../core/services/template.service';
import { TemplateLayoutConfig, ResumeRenderData } from '../core/models/template-config.model';
import { DEFAULT_LAYOUT_CONFIG } from '../core/models/default-template-config';

@Component({
  selector: 'app-public-resume-preview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PageShellComponent, ResumeRendererComponent],
  template: `
    <app-page-shell>
      <div class="max-w-6xl mx-auto py-10 px-6">
        <!-- Header Actions -->
        <div class="flex items-center justify-between mb-10 animate-fade-in">
            <button (click)="goBack()" class="flex items-center gap-2.5 text-white/40 hover:text-white transition-all cursor-pointer group">
                <div class="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-all">
                  <lucide-icon [name]="ChevronLeft" class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform"></lucide-icon>
                </div>
                <span class="text-[13px] font-medium tracking-tight">Back to Community</span>
            </button>
            
            <div class="flex items-center gap-4">
                <button 
                    (click)="useAsTemplate()" 
                    [disabled]="duplicating()"
                    class="flex items-center gap-2.5 px-7 h-12 bg-white text-slate-900 rounded-2xl font-bold text-[14px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    @if (duplicating()) {
                        <lucide-icon [name]="LoaderIcon" class="h-4 w-4 animate-spin"></lucide-icon>
                        <span>Duplicating...</span>
                    } @else {
                        <lucide-icon [name]="CopyIcon" class="h-4 w-4"></lucide-icon>
                        <span>Use This Design</span>
                    }
                </button>
            </div>
        </div>

        @if (loading()) {
            <div class="flex flex-col items-center justify-center py-40 gap-4">
                <div class="h-10 w-10 rounded-full border-2 border-white/5 border-t-teal-500 animate-spin"></div>
                <span class="text-[14px] text-white/30 font-medium tracking-tight">Preparing resume preview...</span>
            </div>
        } @else if (resume()) {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <!-- Main Preview Area -->
                <div class="lg:col-span-8 animate-fade-up">
                    <div class="glass-card rounded-[32px] p-2 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border border-white/10" style="min-height: 800px;">
                        <div class="w-full h-full bg-white rounded-[24px] overflow-auto custom-scrollbar">
                            @if (parsedConfig()) {
                                <app-resume-renderer [config]="parsedConfig()!" [resumeData]="renderData()"></app-resume-renderer>
                            } @else {
                                <div class="flex flex-col items-center justify-center h-[800px] text-slate-300 gap-4">
                                    <div class="h-8 w-8 rounded-full border-2 border-slate-100 border-t-teal-500 animate-spin"></div>
                                    <span class="text-sm font-medium">Loading layout...</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <!-- Content Sidebar -->
                <div class="lg:col-span-4 space-y-6 animate-fade-up" style="animation-delay: 100ms;">
                    <!-- Resume Meta Card -->
                    <div class="glass-card p-8 rounded-[32px] border border-white/10">
                        <div class="flex items-center gap-3 mb-8">
                          <div class="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                            <lucide-icon [name]="UserIcon" class="h-5 w-5"></lucide-icon>
                          </div>
                          <div>
                            <h4 class="text-white/90 font-bold text-[18px] tracking-tight">{{ resume()?.ownerName || 'Anonymous' }}</h4>
                            <p class="text-[12px] text-white/40">{{ resume()?.targetJobTitle || 'Professional' }}</p>
                          </div>
                        </div>

                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-3 border-b border-white/5">
                                <span class="text-white/30 text-[12px] uppercase font-bold tracking-widest">Views</span>
                                <span class="text-white/80 font-medium text-[13px]">{{ resume()?.viewCount || 0 }}</span>
                            </div>
                            <div class="flex items-center justify-between py-3 border-b border-white/5">
                                <span class="text-white/30 text-[12px] uppercase font-bold tracking-widest">Status</span>
                                <span class="text-teal-400 font-bold text-[10px] uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded-md">Public</span>
                            </div>
                            <div class="flex items-center justify-between py-3 border-b border-white/5">
                                <span class="text-white/30 text-[12px] uppercase font-bold tracking-widest">Template</span>
                                <span class="text-white/80 font-medium text-[13px]">{{ selectedTemplate()?.name || 'Modern Design' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- CTA Card -->
                    <div class="glass-card p-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-teal-500/10 to-transparent">
                        <div class="flex items-center gap-3 mb-4">
                            <lucide-icon [name]="SparklesIcon" class="h-6 w-6 text-teal-400"></lucide-icon>
                            <h4 class="text-white font-bold text-[17px] tracking-tight">Like this layout?</h4>
                        </div>
                        <p class="text-[13px] text-white/50 leading-relaxed mb-8">
                            You can duplicate this exact design and content to your dashboard to use as a starting point for your own resume.
                        </p>
                        <button (click)="useAsTemplate()" [disabled]="duplicating()" 
                                class="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer">
                            <lucide-icon [name]="CopyIcon" class="h-4 w-4"></lucide-icon>
                            Duplicate Design
                        </button>
                    </div>

                    <!-- Tags / Info -->
                    <div class="px-4">
                      <p class="text-[11px] text-white/20 leading-relaxed">
                        Shared with permission by the community member. All private data has been anonymized where necessary.
                      </p>
                    </div>
                </div>
            </div>
        } @else {
            <div class="text-center py-40 animate-fade-in">
                <div class="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                  <lucide-icon [name]="LoaderIcon" class="h-8 w-8"></lucide-icon>
                </div>
                <h3 class="text-[22px] font-bold text-white/90">Resume not found</h3>
                <p class="text-[14px] text-white/40 mt-2 mb-8">This resume may have been removed or set to private.</p>
                <button (click)="goBack()" class="px-8 h-12 bg-white text-slate-900 rounded-2xl font-bold text-[14px] hover:scale-[1.02] transition-all cursor-pointer">
                  Return to gallery
                </button>
            </div>
        }
      </div>
    </app-page-shell>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 10px; }
  `]
})
export class PublicResumePreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resumeService = inject(ResumeService);
  private auth = inject(AuthService);
  private popup = inject(PopupService);
  private templateService = inject(TemplateService);
  private dataMapper = inject(ResumeDataMapperService);

  resume = signal<BackendResume | null>(null);
  loading = signal(true);
  duplicating = signal(false);
  selectedTemplate = signal<any | null>(null);

  parsedConfig = computed<TemplateLayoutConfig | null>(() => {
    const template = this.selectedTemplate();
    if (!template?.layoutConfig) return DEFAULT_LAYOUT_CONFIG;
    try {
        const parsed = JSON.parse(template.layoutConfig);
        return parsed as TemplateLayoutConfig;
    } catch (err) {
        console.warn('Failed to parse template layout config, using default.', err);
        return DEFAULT_LAYOUT_CONFIG;
    }
  });

  renderData = computed<ResumeRenderData>(() => {
      const res = this.resume();
      if (!res) return { 
          personal: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', subtitle: '' }, 
          summary: '', 
          experience: [], 
          education: [], 
          skills: [], 
          projects: [], 
          achievements: [],
          languages: [],
          certifications: ''
      };
      return this.dataMapper.toRenderData(res);
  });

  readonly ChevronLeft = ChevronLeft;
  readonly CopyIcon = Copy;
  readonly LoaderIcon = Loader2;
  readonly SparklesIcon = Sparkles;
  readonly UserIcon = UserIcon;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResume(+id);
    }
  }

  loadResume(id: number) {
    this.loading.set(true);
    this.resumeService.getResumeById(id).subscribe({
      next: (data) => {
        this.resume.set(data);
        this.loading.set(false);
        
        // Load template config
        const tid = data.templateId || 1;
        this.templateService.getTemplateById(tid).subscribe({
            next: (template: BackendTemplate) => {
                this.selectedTemplate.set(template);
            },
            error: (err: any) => {
                console.error('Failed to load template, using default fallback', err);
                // Set a mock template with default config
                this.selectedTemplate.set({
                    name: 'Fallback Template',
                    description: 'Default design used due to loading error',
                    category: 'PROFESSIONAL',
                    isActive: true,
                    isPremium: false,
                    usageCount: 0,
                    layoutConfig: JSON.stringify(DEFAULT_LAYOUT_CONFIG)
                });
            }
        });
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  useAsTemplate() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const current = this.resume();
    if (!current) return;

    this.duplicating.set(true);
    this.resumeService.duplicatePublicResume(current.resumeId).subscribe({
      next: (copy) => {
        this.duplicating.set(false);
        this.router.navigate(['/builder', copy.resumeId], { queryParams: { skipTemplate: 'true' } });
      },
      error: (err) => {
        this.duplicating.set(false);
                this.popup.error('Duplicate Failed', err.error?.message || err.message || 'Unknown error');
      }
    });
  }

  goBack() {
    this.router.navigate(['/community']);
  }

  parseJson(content: string): any {
    if (!content) return {};
    try {
        return JSON.parse(content);
    } catch {
        return {};
    }
  }
}
