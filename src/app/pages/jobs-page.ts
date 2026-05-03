import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobMatchService, JobMatch } from '../core/services/job-match.service';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">

      <!-- Header -->
      <header>
        <p class="text-[13px] mb-1 text-white/40">Job matching</p>
        <h1 class="text-[28px] font-medium tracking-tight text-white/90">Find jobs</h1>
      </header>

      <!-- Search bar row -->
      <div class="flex flex-col sm:flex-row gap-3">
        <input [(ngModel)]="searchTitle" type="text" placeholder="Job title"
               class="flex-1 glass-input py-3 px-4 rounded-[10px] text-[14px]" />
        <input [(ngModel)]="searchLocation" type="text" placeholder="Location"
               class="flex-1 glass-input py-3 px-4 rounded-[10px] text-[14px]" />
        <button (click)="searchJobs()" [disabled]="isLoading()" class="btn-primary whitespace-nowrap min-w-[120px]">
          {{ isLoading() ? 'Searching...' : 'Search Jobs' }}
        </button>
      </div>

      <!-- Tab navigation -->
      <div class="flex items-center gap-6 overflow-x-auto border-b border-white/5">
        <button (click)="activeTab.set('jobs')"
                class="pb-2.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                [style.color]="activeTab() === 'jobs' ? 'white' : 'rgba(255,255,255,0.4)'"
                [style.border-bottom]="activeTab() === 'jobs' ? '2px solid white' : '2px solid transparent'">
          Jobs
        </button>
        <button (click)="loadBookmarks()"
                class="pb-2.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                [style.color]="activeTab() === 'bookmarks' ? 'white' : 'rgba(255,255,255,0.4)'"
                [style.border-bottom]="activeTab() === 'bookmarks' ? '2px solid white' : '2px solid transparent'">
          Bookmarks
        </button>
        <button (click)="loadHistory()"
                class="pb-2.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                [style.color]="activeTab() === 'history' ? 'white' : 'rgba(255,255,255,0.4)'"
                [style.border-bottom]="activeTab() === 'history' ? '2px solid white' : '2px solid transparent'">
          Match history
        </button>
      </div>

      <!-- Jobs Tab -->
      @if (activeTab() === 'jobs') {
        <div class="space-y-4">
          @for (job of jobResults(); track job.matchId) {
            <div class="glass-card rounded-2xl p-5 flex flex-col transition-all hover:shadow-md cursor-pointer border border-white/5"
                 (click)="openDetail(job)">
              
              <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[13px] font-medium text-white/60">{{ job.company }}</span>
                    <span class="glass-badge !text-[10px] text-white/40">{{ job.source }}</span>
                  </div>
                  <h3 class="text-[17px] font-semibold tracking-tight text-white/90" [innerHTML]="job.jobTitle"></h3>
                  <p class="text-[13px] flex items-center gap-1 mt-0.5 text-white/40">
                    <span class="opacity-60">📍</span> {{ job.location }}
                  </p>
                </div>

                @if (job.matchScore) {
                  <div class="h-10 w-10 rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm"
                       style="border:2.5px solid #4FD1C5; color:#4FD1C5; background:rgba(79,209,197,0.1)">
                    {{ job.matchScore }}
                  </div>
                }
              </div>

              <!-- Job Description Snippet -->
              @if (job.jobDescription) {
                <p class="text-[13px] line-clamp-3 mb-5 leading-[1.6] text-white/50" [innerHTML]="job.jobDescription"></p>
              }

              <!-- Actions row -->
              <div class="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                <div class="flex items-center gap-4">
                  <button (click)="toggleBookmark(job); $event.stopPropagation()"
                          class="text-[12px] font-medium cursor-pointer hover:underline flex items-center gap-1.5"
                          [style.color]="job.isBookmarked ? 'white' : 'rgba(255,255,255,0.4)'">
                    {{ job.isBookmarked ? '★ Saved' : '☆ Save' }}
                  </button>
                </div>
                
                <div class="flex items-center gap-3">
                  <button (click)="openDetail(job); $event.stopPropagation()" class="text-[12px] font-medium hover:underline text-white/40">
                    Details
                  </button>
                  @if (job.applyUrl) {
                    <a [href]="job.applyUrl" target="_blank" (click)="$event.stopPropagation()" 
                       class="btn-primary !py-1.5 !px-4 !text-[12px] rounded-lg">
                      Apply Now ↗
                    </a>
                  }
                </div>
              </div>
            </div>
          } @empty {
            @if (!isLoading()) {
              <div class="py-24 text-center glass-card rounded-2xl">
                <div class="text-[40px] mb-4 opacity-20">🔍</div>
                <h3 class="text-[18px] font-medium mb-1 text-white/90">No jobs found</h3>
                <p class="text-[14px] text-white/40">Try adjusting your search filters or location.</p>
              </div>
            }
          }

          <!-- Pagination -->
          @if (jobResults().length > 0 || currentPage() > 1) {
            <div class="flex items-center justify-center gap-4 pt-10">
              <button (click)="prevPage()" [disabled]="currentPage() === 1 || isLoading()"
                      class="btn-secondary min-w-[100px] py-2.5 rounded-xl disabled:opacity-50">
                ← Previous
              </button>
              <div class="flex items-center px-4 h-10 rounded-xl bg-white/5 text-[13px] font-medium text-white/90">
                Page {{ currentPage() }}
              </div>
              <button (click)="nextPage()" [disabled]="isLoading() || jobResults().length === 0"
                      class="btn-secondary min-w-[100px] py-2.5 rounded-xl disabled:opacity-50">
                Next →
              </button>
            </div>
          }
        </div>
      }

      <!-- Bookmarks/History tab -->
      @if (activeTab() === 'bookmarks' || activeTab() === 'history') {
        <div class="space-y-3">
          @for (job of historyResults(); track job.matchId) {
            <div class="glass-card rounded-2xl px-5 py-4 flex items-center justify-between transition-all hover:shadow-md cursor-pointer"
                 (click)="openDetail(job)">
              <div class="min-w-0">
                <h3 class="text-[15px] font-medium text-white/90">{{ job.jobTitle }}</h3>
                <p class="text-[12px] mt-0.5 text-white/40">{{ job.company }} · {{ job.matchedAt | date:'mediumDate' }}</p>
              </div>
              <div class="flex items-center gap-4">
                @if (job.matchScore) {
                  <span class="text-[14px] font-medium text-[#4FD1C5]">{{ job.matchScore }}%</span>
                }
                <span class="text-[16px] text-white/20">→</span>
              </div>
            </div>
          } @empty {
            <div class="py-16 text-center">
              <p class="text-[15px] text-white/30">No records found.</p>
            </div>
          }
        </div>
      }


      <!-- Side Drawer -->
      @if (selectedJob()) {
        <div class="fixed inset-0 z-50 flex items-stretch justify-end">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="selectedJob.set(null)"></div>
          <div class="relative w-full max-w-lg h-full glass-modal p-8 flex flex-col overflow-y-auto custom-scrollbar animate-slide-left border-l border-white/10">
            <button (click)="selectedJob.set(null)"
                    class="absolute top-6 right-6 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5 text-white/40">
              ✕
            </button>

            <div class="mb-8">
              <div class="flex items-center gap-2 mb-2">
                <span class="glass-badge !text-[10px] uppercase font-bold tracking-wider text-white/60" style="background:rgba(255,255,255,0.05)">{{ selectedJob()?.source }}</span>
              </div>
              <h2 class="text-[28px] font-semibold leading-tight mb-2 text-white/90" [innerHTML]="selectedJob()?.jobTitle"></h2>
              <p class="text-[15px] font-medium text-[#4FD1C5]">{{ selectedJob()?.company }} · {{ selectedJob()?.location }}</p>
            </div>

            <!-- Analysis Section -->
            <div class="glass-card rounded-3xl p-6 mb-8 text-center relative bg-white/5 border border-white/10">
              @if (isLoading()) {
                <div class="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 rounded-3xl">
                  <div class="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <p class="text-[14px] font-semibold text-white">Analyzing compatibility...</p>
                </div>
              }
              
              @if (selectedJob()?.matchScore !== undefined && selectedJob()?.matchScore !== null) {
                <div class="text-left">
                    <div class="flex items-center gap-5 bg-white/5 p-5 rounded-2xl border border-white/5 mb-6">
                      <div class="h-20 w-20 rounded-full flex items-center justify-center text-[24px] font-bold shadow-inner flex-shrink-0"
                           style="border:5px solid #4FD1C5; color:#4FD1C5; background:rgba(255,255,255,0.05)">
                        {{ selectedJob()?.matchScore }}%
                      </div>
                      <div class="flex-1">
                        <p class="text-[16px] font-bold text-white/90">Match Compatibility</p>
                        <div class="mt-2 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-[#4FD1C5] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,209,197,0.3)]" 
                                 [style.width]="selectedJob()?.matchScore + '%'"></div>
                        </div>
                        <p class="text-[12px] mt-2 font-medium text-white/30">Analysis based on your resume</p>
                      </div>
                    </div>
    
                    <div class="grid grid-cols-1 gap-4">
                      @if (selectedJob()?.strengths) {
                        <div class="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                          <p class="text-[11px] font-bold uppercase text-emerald-400 mb-2 tracking-widest">Key Strengths</p>
                          <p class="text-[13px] text-emerald-100/80 leading-relaxed whitespace-pre-wrap">{{ selectedJob()?.strengths }}</p>
                        </div>
                      }
                      @if (selectedJob()?.weaknesses) {
                        <div class="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                          <p class="text-[11px] font-bold uppercase text-rose-400 mb-2 tracking-widest">Areas to Improve</p>
                          <p class="text-[13px] text-rose-100/80 leading-relaxed whitespace-pre-wrap">{{ selectedJob()?.weaknesses }}</p>
                        </div>
                      }
                    </div>
                    
                    <button (click)="selectedJob.update(j => j ? ({...j, matchScore: undefined}) : null)" 
                            class="mt-8 text-[13px] font-bold text-indigo-400 hover:opacity-70 transition-opacity flex items-center justify-center gap-2 mx-auto">
                      <span>↺</span> Re-analyze with another resume
                    </button>
                </div>
              } @else {
                <div class="py-2">
                    <h3 class="text-[20px] font-bold mb-2 text-white/90">Is this a good fit for you?</h3>
                    <p class="text-[14px] mb-8 text-white/40 px-6 max-w-sm mx-auto leading-relaxed">Let our AI compare your experience with the job requirements.</p>
                    
                    <div class="flex flex-col gap-4 px-4 max-w-md mx-auto">
                      <div class="relative group">
                          <select [(ngModel)]="selectedResumeId" 
                                  class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-5 pr-12 text-[14px] font-medium appearance-none hover:border-white/20 focus:border-indigo-400 transition-all outline-none text-white/90">
                            <option [value]="null" disabled selected>Select a resume to compare...</option>
                            @for (resume of userResumes(); track resume.resumeId) {
                              <option [value]="resume.resumeId">{{ resume.title }}</option>
                            }
                          </select>
                          <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">▼</div>
                      </div>
                      <button (click)="analyzeJob(selectedJob()!)" 
                              [disabled]="!selectedResumeId || isLoading()"
                              class="w-full bg-white/90 text-[#030712] rounded-xl py-4 text-[15px] font-bold hover:bg-white transition-all shadow-xl shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed">
                        {{ isLoading() ? 'Running AI Comparison...' : 'Check My Compatibility' }}
                      </button>
                    </div>
                </div>
              }
            </div>

            <!-- Job Description -->
            <div class="flex-1">
              <p class="text-[11px] uppercase tracking-wider font-bold mb-4 text-white/30">Job Description</p>
              <p class="text-[14px] leading-[1.8] whitespace-pre-wrap text-white/60" [innerHTML]="selectedJob()?.jobDescription"></p>
            </div>

            <!-- Footer Actions -->
            <div class="mt-8 pt-6 flex gap-3 sticky bottom-0 border-t border-white/5 bg-[#030712]/80 backdrop-blur-md">
              <button (click)="tailorResume(selectedJob()!)" 
                      class="btn-primary flex-1 py-3.5 text-[14px] font-semibold">
                Tailor my resume
              </button>
              <button (click)="toggleBookmark(selectedJob()!)" 
                      class="btn-secondary px-8 py-3.5 text-[14px] font-semibold">
                {{ selectedJob()?.isBookmarked ? 'Saved' : 'Save' }}
              </button>
              @if (selectedJob()?.applyUrl) {
                <a [href]="selectedJob()?.applyUrl" target="_blank" 
                   class="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/60 transition-colors"
                   title="Go to website">
                  ↗
                </a>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <style>
      .animate-slide-left { animation: slideLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
      @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 10px; }
    </style>
  `,
})
export class JobsPageComponent implements OnInit {
  private jmService = inject(JobMatchService);
  private resumeService = inject(ResumeService);
  private router = inject(Router);

  activeTab = signal<'jobs' | 'bookmarks' | 'history'>('jobs');
  isLoading = signal(false);

  searchTitle = 'Java Developer';
  searchLocation = 'Remote';


  jobResults = signal<JobMatch[]>([]);
  historyResults = signal<JobMatch[]>([]);
  userResumes = signal<BackendResume[]>([]);
  selectedJob = signal<JobMatch | null>(null);
  selectedResumeId: number | null = null;
  currentPage = signal(1);

  ngOnInit() {
    this.loadResumes();
    this.searchJobs();
  }

  loadResumes() {
    this.resumeService.getUserResumes().subscribe({
      next: (resumes) => this.userResumes.set(resumes),
      error: (err) => console.error('Failed to load resumes', err)
    });
  }

  searchJobs(resetPage = true) {
    if (resetPage) this.currentPage.set(1);
    this.isLoading.set(true);

    const query = this.searchTitle.trim();
    const location = this.searchLocation.trim();

    this.jmService.searchJobs(query, location, 'in', this.currentPage()).subscribe({
      next: (jobs: JobMatch[]) => {
        this.jobResults.set(jobs);
        this.isLoading.set(false);
        this.activeTab.set('jobs');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.isLoading.set(false)
    });
  }

  nextPage() {
    this.currentPage.update(p => p + 1);
    this.searchJobs(false);
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.searchJobs(false);
    }
  }

  loadBookmarks() {
    this.activeTab.set('bookmarks');
    this.jmService.getBookmarks().subscribe((res: JobMatch[]) => this.historyResults.set(res));
  }

  loadHistory() {
    this.activeTab.set('history');
    this.jmService.getHistory().subscribe((res: JobMatch[]) => this.historyResults.set(res));
  }

  toggleBookmark(job: JobMatch) {
    this.jmService.toggleBookmark(job.matchId).subscribe(() => {
      job.isBookmarked = !job.isBookmarked;
    });
  }

  analyzeJob(job: JobMatch) {
    if (!this.selectedResumeId) return;
    this.isLoading.set(true);
    this.jmService.analyze(this.selectedResumeId, job.matchId).subscribe({
      next: (updated: JobMatch) => {
        this.jobResults.update(list => list.map(j => j.matchId === updated.matchId ? updated : j));
        if (this.selectedJob()?.matchId === updated.matchId) this.selectedJob.set(updated);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDetail(job: JobMatch) {
    this.selectedJob.set(job);
    if (this.userResumes().length > 0 && !this.selectedResumeId) {
      this.selectedResumeId = this.userResumes()[0].resumeId;
    }
  }

  tailorResume(job: JobMatch) {
    this.router.navigate(['/tailor-resume'], { 
      state: { jobDescription: job.jobDescription } 
    });
  }


}
