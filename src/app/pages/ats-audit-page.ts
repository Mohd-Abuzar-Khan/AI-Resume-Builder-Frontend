import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { AiService, AtsReport } from '../core/services/ai.service';
import { buildStructuredResumeText } from '../core/utils/resume-text';
import { LucideAngularModule, Target, AlertCircle, Wand2, CheckCircle2, ChevronRight, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-ats-audit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="py-10 px-8 max-w-5xl mx-auto animate-fade-up">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-[32px] font-medium tracking-tight mb-3 text-white/90">
          ATS <em class="italic font-serif-display font-normal text-white/60">Audit</em>
        </h1>
        <p class="text-[15px] opacity-40">
          Evaluate your resume compatibility with industry-standard applicant tracking systems.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Resume Selection List -->
        <div class="lg:col-span-1 space-y-4">
          <p class="text-[11px] uppercase tracking-widest font-medium px-1 opacity-30">Your Resumes</p>
          
          @if (isLoadingResumes()) {
            <div class="flex items-center gap-2 py-4 px-2">
              <lucide-icon [name]="LoaderIcon" class="h-4 w-4 animate-spin opacity-20"></lucide-icon>
              <span class="text-[13px] opacity-20">Loading...</span>
            </div>
          } @else {
            <div class="flex flex-col gap-2">
              @for (resume of resumes(); track resume.resumeId) {
                <button (click)="selectResume(resume)"
                        class="w-full text-left p-4 rounded-2xl transition-all cursor-pointer border border-white/5"
                        [style.background]="selectedResume()?.resumeId === resume.resumeId ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'">
                  <p class="text-[14px] font-medium truncate" [style.color]="selectedResume()?.resumeId === resume.resumeId ? 'white' : 'rgba(255,255,255,0.7)'">
                    {{ resume.title }}
                  </p>
                  <p class="text-[12px] mt-1 opacity-40">
                    {{ resume.targetJobTitle || 'General' }}
                  </p>
                </button>
              }
            </div>
          }
        </div>

        <!-- Audit Results Area -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-3xl p-6 border border-white/10" [formGroup]="form">
            <h3 class="text-[14px] font-medium mb-3 text-white/90">Job Description</h3>
            <textarea formControlName="jobDescription" rows="8"
                      class="glass-input w-full py-3 resize-none custom-scrollbar"
                      placeholder=""></textarea>
            <div class="flex items-center justify-between mt-3">
              @if (form.controls.jobDescription.touched && form.controls.jobDescription.invalid) {
                <span class="text-[11px] text-red-400">Minimum 100 characters required.</span>
              } @else {
                <span class="text-[11px] opacity-30">Tip: Include requirements, skills, and responsibilities.</span>
              }
              <button (click)="runAudit()"
                      [disabled]="form.invalid || !selectedResume() || isAuditing()"
                      class="btn-primary px-4 py-2 text-[12px] disabled:opacity-50">
                @if (isAuditing()) {
                  Running...
                } @else {
                  Run Audit
                }
              </button>
            </div>
          </div>

          @if (!selectedResume()) {
            <div class="glass-card rounded-3xl h-[360px] flex flex-col items-center justify-center text-center p-10 border border-white/5">
              <div class="h-16 w-16 rounded-full flex items-center justify-center mb-6 bg-white/5">
                <lucide-icon [name]="TargetIcon" class="h-8 w-8 text-white/20"></lucide-icon>
              </div>
              <h3 class="text-[18px] font-medium mb-2 text-white/90">Select a resume to audit</h3>
              <p class="text-[14px] max-w-xs mx-auto opacity-40">
                We'll analyze your content, structure, and keywords to give you a detailed compatibility score.
              </p>
            </div>
          } @else if (isAuditing()) {
            <div class="glass-card rounded-3xl h-[360px] flex flex-col items-center justify-center text-center p-10 border border-white/5">
              <div class="h-12 w-12 rounded-full animate-spin mb-6 border-2 border-white/5 border-t-white"></div>
              <h3 class="text-[16px] font-medium text-white/90">Analyzing "{{ selectedResume()?.title }}"</h3>
              <p class="text-[13px] mt-2 opacity-40">Running rubric-based scoring and keyword analysis...</p>
            </div>
          } @else if (atsResult()) {
            <div class="space-y-6 animate-fade-up">
              <!-- Score Card -->
              <div class="glass-card rounded-3xl p-8 border border-white/5">
                <div class="flex items-center gap-10">
                  <div class="h-32 w-32 rounded-full border-[6px] border-white/5 flex items-center justify-center text-[32px] font-medium relative text-indigo-400">
                    {{ atsResult()?.score }}
                    <div class="absolute inset-0 rounded-full border-[6px] border-t-transparent animate-spin-slow border-indigo-400"></div>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-[20px] font-medium text-white/90">Audit Result</h3>
                    <p class="text-[14px] mt-2 leading-relaxed opacity-60">
                      {{ atsResult()?.verdict }}
                    </p>
                    <button (click)="runAudit()" [disabled]="form.invalid || isAuditing()"
                            class="mt-6 text-[12px] font-medium hover:underline flex items-center gap-1 disabled:opacity-50 text-indigo-400">
                      Re-run analysis <lucide-icon [name]="ChevronRightIcon" class="h-3 w-3"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Breakdown -->
              <div class="glass-card rounded-3xl p-6 border border-white/5">
                <h4 class="text-[12px] uppercase tracking-widest font-medium mb-5 opacity-40">
                  Category Breakdown
                </h4>
                <div class="space-y-4">
                  @for (row of getBreakdownRows(atsResult()); track row.key) {
                    <div>
                      <div class="flex items-center justify-between text-[13px] text-white/90">
                        <span class="font-medium">{{ row.label }}</span>
                        <span class="text-[12px] opacity-40">{{ row.score }} / {{ row.maxScore }}</span>
                      </div>
                      <div class="h-2 rounded-full mt-2 bg-white/5">
                        <div class="h-2 rounded-full bg-indigo-500/80" [style.width.%]="getPercent(row.score, row.maxScore)"></div>
                      </div>
                      @if (row.detail) {
                        <div class="text-[11px] mt-1 opacity-30">{{ row.detail }}</div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Keywords Found -->
                <div class="glass-card rounded-2xl p-6 border border-white/5">
                  <h4 class="text-[11px] uppercase tracking-widest font-medium mb-4 flex items-center gap-2 opacity-40">
                    <lucide-icon [name]="CheckIcon" class="h-3.5 w-3.5 text-emerald-400"></lucide-icon>
                    Keywords Found ({{ atsResult()?.keywordsFound?.length || 0 }})
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    @for (key of atsResult()?.keywordsFound; track key) {
                      <span class="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {{ key }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Keywords Missing -->
                <div class="glass-card rounded-2xl p-6 border border-white/5">
                  <h4 class="text-[11px] uppercase tracking-widest font-medium mb-4 flex items-center gap-2 opacity-40">
                    <lucide-icon [name]="AlertIcon" class="h-3.5 w-3.5 text-red-400"></lucide-icon>
                    Keywords Missing ({{ atsResult()?.keywordsMissing?.length || 0 }})
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    @for (key of atsResult()?.keywordsMissing; track key) {
                      <span class="px-2.5 py-1 rounded-lg text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">
                        {{ key }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- Suggestions -->
              <div class="glass-card rounded-2xl p-6 border border-white/5">
                <h4 class="text-[11px] uppercase tracking-widest font-medium mb-4 flex items-center gap-2 opacity-40">
                  <lucide-icon [name]="WandIcon" class="h-3.5 w-3.5 text-emerald-400"></lucide-icon>
                  Actions
                </h4>
                <ul class="space-y-3">
                  @for (sug of atsResult()?.suggestions; track $index) {
                    <li class="flex items-start gap-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border" [ngStyle]="getPriorityStyles(sug.priority)">
                        {{ sug.priority || 'INFO' }}
                      </span>
                      <div class="flex-1">
                        <div class="text-[12px] font-medium text-white/90">{{ sug.category }}</div>
                        <div class="text-[12px] opacity-50">{{ sug.action }}</div>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `]
})
export class AtsAuditPageComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private fb = inject(FormBuilder);

  resumes = signal<BackendResume[]>([]);
  selectedResume = signal<BackendResume | null>(null);
  atsResult = signal<AtsReport | null>(null);
  isLoadingResumes = signal(true);
  isAuditing = signal(false);

  form = this.fb.nonNullable.group({
    jobDescription: ['', [Validators.required, Validators.minLength(100)]]
  });

  readonly TargetIcon = Target;
  readonly AlertIcon = AlertCircle;
  readonly WandIcon = Wand2;
  readonly CheckIcon = CheckCircle2;
  readonly ChevronRightIcon = ChevronRight;
  readonly LoaderIcon = Loader2;

  ngOnInit() {
    this.resumeService.getUserResumes().subscribe({
      next: (data) => {
        this.resumes.set(data);
        this.isLoadingResumes.set(false);
      },
      error: () => this.isLoadingResumes.set(false)
    });
  }

  selectResume(resume: BackendResume) {
    this.selectedResume.set(resume);
    if (this.form.valid) {
      this.runAudit();
    }
  }

  runAudit() {
    const resumeId = this.selectedResume()?.resumeId;
    if (!resumeId) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const jobDescription = this.form.controls.jobDescription.value.trim();

    this.isAuditing.set(true);
    this.atsResult.set(null);

    this.resumeService.getResumeById(resumeId).subscribe({
      next: (resume) => {
        const resumeContent = buildStructuredResumeText(resume);
        this.aiService.checkAts(resumeId, resumeContent, jobDescription).subscribe({
          next: (res) => {
            this.atsResult.set(res);
            this.isAuditing.set(false);
          },
          error: () => this.isAuditing.set(false)
        });
      },
      error: () => this.isAuditing.set(false)
    });
  }

  getBreakdownRows(report: AtsReport | null) {
    if (!report?.breakdown) return [];
    const keyword = report.breakdown.keywordMatch ?? { score: 0, maxScore: 35, matchRate: null };
    const experience = report.breakdown.experienceRelevance ?? { score: 0, maxScore: 25 };
    const quantified = report.breakdown.quantifiedAchievements ?? { score: 0, maxScore: 20 };
    const format = report.breakdown.formatReadability ?? { score: 0, maxScore: 10 };
    const summary = report.breakdown.summaryAlignment ?? { score: 0, maxScore: 10 };
    const keywordRate = keyword.matchRate;

    return [
      {
        key: 'keywordMatch',
        label: 'Keyword Match',
        score: keyword.score ?? 0,
        maxScore: keyword.maxScore ?? 35,
        detail: keywordRate != null ? `${Math.round(keywordRate * 100)}% of required keywords found` : ''
      },
      { key: 'experienceRelevance', label: 'Experience Relevance', score: experience.score ?? 0, maxScore: experience.maxScore ?? 25, detail: '' },
      { key: 'quantifiedAchievements', label: 'Quantified Achievements', score: quantified.score ?? 0, maxScore: quantified.maxScore ?? 20, detail: '' },
      { key: 'formatReadability', label: 'Format & Readability', score: format.score ?? 0, maxScore: format.maxScore ?? 10, detail: '' },
      { key: 'summaryAlignment', label: 'Summary Alignment', score: summary.score ?? 0, maxScore: summary.maxScore ?? 10, detail: '' }
    ];
  }

  getPercent(score: number, maxScore: number) {
    if (!maxScore) return 0;
    return Math.round((score / maxScore) * 100);
  }

  getPriorityStyles(priority?: string) {
    const level = (priority || '').toUpperCase();
    if (level === 'HIGH') {
      return { background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.2)' };
    }
    if (level === 'MEDIUM') {
      return { background: 'rgba(245,158,11,0.1)', color: '#FCD34D', borderColor: 'rgba(245,158,11,0.2)' };
    }
    if (level === 'LOW') {
      return { background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', borderColor: 'rgba(16,185,129,0.2)' };
    }
    return { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' };
  }
}
