import { Component, inject, ChangeDetectionStrategy, computed, OnInit, signal, AfterViewInit, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ResumeService, BackendResume } from '../../core/services/resume.service';
import { UsageLimitsService } from '../../core/services/usage-limits.service';
import { MiniResumePreviewComponent } from '../../components/mini-resume-preview.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, MiniResumePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <p class="text-[13px] mb-1 opacity-50">Dashboard</p>
          <h1 class="text-[28px] font-medium tracking-tight text-white/90">
            Good morning, <em class="italic font-serif-display font-normal text-white/60">{{ firstName() }}</em>
          </h1>
        </div>
        <a routerLink="/explore"
           class="btn-primary inline-flex items-center gap-2 w-fit">
          New resume →
        </a>
      </div>

      <!-- Stats row: 4 metric glass-cards -->
      <div class="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card glass-card rounded-3xl p-6 opacity-0" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-2 opacity-40">
              {{ stat.label }}
            </p>
            <p class="text-[28px] font-medium text-white/90">{{ stat.value }}</p>
            <p class="text-[12px] mt-1 opacity-40">{{ stat.sub }}</p>
          </div>
        }
      </div>

      <!-- My Resumes -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[15px] font-medium text-white/80">My resumes</h2>
          <a routerLink="/explore" class="text-[13px] hover:underline text-indigo-400">New resume →</a>
        </div>

        @if (loading()) {
          <div class="glass-card rounded-3xl p-10 text-center" style="border-color: rgba(255, 240, 230, 0.18);">
            <p class="text-[14px] opacity-50">Loading your resumes...</p>
          </div>
        } @else if (resumes().length > 0) {
          <div class="resume-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (res of resumes(); track res.resumeId) {
              <div class="resume-card glass-card rounded-3xl overflow-hidden group cursor-pointer transition-all hover:shadow-md opacity-0" style="border-color: rgba(255, 240, 230, 0.18);">
                <!-- Resume preview area -->
                <div class="m-3 rounded-2xl relative overflow-hidden border border-white/5 group-hover:border-teal-500/20 transition-all">
                  <app-mini-resume-preview
                    [resumeId]="res.resumeId"
                    [scaleFactor]="0.27"
                    [containerHeight]="180">
                  </app-mini-resume-preview>

                  <!-- Hover overlay -->
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                    <a [routerLink]="['/builder', res.resumeId]"
                       class="px-4 py-2 rounded-lg text-[12px] font-medium"
                       style="background:white; color:#111">
                       Edit
                    </a>
                    <button (click)="deleteResume(res.resumeId); $event.stopPropagation()"
                            class="px-4 py-2 rounded-lg text-[12px] font-medium"
                            style="background:rgba(139,32,32,0.9); color:white">
                       Delete
                    </button>
                  </div>
                </div>

                <!-- Info area -->
                <div class="px-4 pb-4 pt-1 flex items-center justify-between">
                  <div>
                    <p class="text-[14px] font-medium text-white/90">{{ res.title }}</p>
                    <p class="text-[12px] opacity-40">Updated recently</p>
                  </div>
                  <!-- ATS score ring -->
                  <div class="h-10 w-10 rounded-full flex items-center justify-center text-[12px] font-medium border-2 border-emerald-500/50 text-emerald-400">
                    {{ res.atsScore || '—' }}
                  </div>
                </div>
              </div>
            }

            <!-- + New resume card -->
            <a routerLink="/explore"
               class="rounded-3xl p-10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white/5" style="border: 1.5px dashed rgba(255, 240, 230, 0.18);">
              <span class="text-[24px] text-white/20">+</span>
              <span class="text-[14px] text-white/40">New resume</span>
            </a>
          </div>
        } @else {
          <div class="glass-card rounded-3xl p-12 text-center" style="border-color: rgba(255, 240, 230, 0.18);">
            <p class="text-[24px] mb-2 opacity-20">📄</p>
            <p class="text-[16px] font-medium text-white/50">No resumes yet</p>
            <p class="text-[13px] mt-1 mb-4 opacity-40">Create your first resume to get started</p>
            <a routerLink="/explore" class="btn-primary inline-block">Browse templates</a>
          </div>
        }
      </div>

      <!-- Upgrade Banner (for free users) -->
      @if (auth.user()?.plan === 'FREE') {
        <div class="glass-card rounded-3xl p-8 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-500/20" style="background: rgba(251, 191, 36, 0.03);">
          <div>
            <h3 class="text-[16px] font-medium text-white/90">Unlock unlimited AI & premium templates</h3>
            <p class="text-[13px] mt-1 opacity-60">Upgrade to Premium for unlimited resumes, AI calls, and job tailoring.</p>
          </div>
          <a routerLink="/pricing" class="btn-primary flex-shrink-0">View plans</a>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  auth = inject(AuthService);
  private resumeService = inject(ResumeService);
  private usage = inject(UsageLimitsService);

  resumes = signal<BackendResume[]>([]);
  loading = signal<boolean>(true);
  readonly Unlimited = Number.POSITIVE_INFINITY;

  firstName = computed(() => {
    const name = this.auth.user()?.fullName;
    return name ? name.split(' ')[0] : '';
  });

  stats = computed(() => {
    this.usage.changed();
    const resumes = this.resumes();
    const usageSummary = this.usage.getCurrentUserSummary();

    const bestScore = resumes.length > 0
      ? Math.max(...resumes.map(r => r.atsScore || 0))
      : 0;

    return [
      { label: 'Resumes', value: `${resumes.length} / ${usageSummary.resumesLimit === this.Unlimited ? '∞' : usageSummary.resumesLimit}`, sub: 'Created this month' },
      { label: 'AI Calls Left', value: `${usageSummary.aiCallsRemaining === this.Unlimited ? '∞' : usageSummary.aiCallsRemaining}`, sub: 'Resets monthly' },
      { label: 'AI Operations', value: `${usageSummary.aiCallsUsed}`, sub: 'This month' },
      { label: 'Best ATS Score', value: `${bestScore}`, sub: bestScore > 80 ? 'Excellent match' : 'Keep improving' },
    ];
  });

  ngOnInit() {
    this.loadResumes();
  }

  ngAfterViewInit() {
    this.initEntranceAnimations();
  }

  private initEntranceAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });
    
    tl.from('.stats-grid', { opacity: 0, y: 10, duration: 0.5 })
      .to('.stat-card', { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1, 
        duration: 0.6 
      }, '-=0.2');
  }

  loadResumes() {
    this.resumeService.getUserResumes().subscribe({
      next: (data) => {
        this.resumes.set(data);
        this.loading.set(false);
        
        // Animate resumes after they are loaded and rendered
        setTimeout(() => {
          gsap.to('.resume-card', {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: 'power2.out'
          });
        }, 50);
      },
      error: (err) => {
        console.error('Failed to load resumes', err);
        this.loading.set(false);
      }
    });
  }

  deleteResume(id: number) {
    if (confirm('Are you sure you want to delete this resume?')) {
      this.resumeService.deleteResume(id).subscribe({
        next: () => this.loadResumes(),
        error: (err) => console.error('Failed to delete', err)
      });
    }
  }
}
