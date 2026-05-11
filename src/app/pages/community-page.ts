import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { PageShellComponent } from '../components/page-shell';
import { SectionHeadingComponent } from '../components/section-heading';
import { SearchBarComponent } from '../components/search-bar';
import { MiniResumePreviewComponent } from '../components/mini-resume-preview.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, PageShellComponent, SectionHeadingComponent, SearchBarComponent, MiniResumePreviewComponent],
  template: `
    <app-page-shell>
      <div class="flex flex-col gap-10 py-10">
        <!-- Header -->
        <div class="text-center space-y-4">
          <app-section-heading eyebrow="Community" align="center">
            Real resumes from people who got the <em class="font-serif-display font-normal italic text-white/60">job.</em>
          </app-section-heading>
          <p class="max-w-2xl mx-auto text-[16px] leading-[1.7] opacity-60">
            Explore professional resumes shared by our community.
            Find inspiration or use a design to jumpstart your career.
          </p>
        </div>

        <!-- Search -->
        <div class="max-w-2xl mx-auto w-full">
          <app-search-bar (search)="onSearch($any($event))"></app-search-bar>
        </div>

        <!-- Filter chips -->
        <div class="flex items-center justify-center gap-2 flex-wrap">
          @for (cat of categories; track cat) {
            <button (click)="activeFilter.set(cat)"
                    class="px-4 py-1.5 rounded-full text-[13px] transition-all cursor-pointer"
                    [style.background]="activeFilter() === cat ? 'rgba(255,255,255,0.08)' : 'transparent'"
                    [style.color]="activeFilter() === cat ? 'white' : 'rgba(255,255,255,0.4)'"
                    [style.border]="activeFilter() === cat ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent'">
              {{ cat }}
            </button>
          }
        </div>

        <!-- Gallery Grid -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-24 gap-3">
            <div class="h-8 w-8 rounded-full animate-spin border-2 border-white/10 border-t-white"></div>
            <span class="text-[13px] text-white/40">Loading gallery...</span>
          </div>
        } @else if (resumes().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (resume of resumes(); track resume.resumeId) {
              <div (click)="openPreview(resume)"
                   class="glass-card rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-lg hover:shadow-teal-500/5 hover:border-white/15 animate-fade-up"
                   [style.animation-delay]="(($index % 6) * 80) + 'ms'">
                <!-- Live Resume Preview -->
                <div class="m-3 rounded-xl overflow-hidden border border-white/10 group-hover:border-teal-500/20 transition-all relative">
                  <app-mini-resume-preview
                    [resumeId]="resume.resumeId"
                    [scaleFactor]="0.27"
                    [containerHeight]="200">
                  </app-mini-resume-preview>
                  <!-- Hover overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span class="text-[11px] font-bold text-white uppercase tracking-widest bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
                      View Resume
                    </span>
                  </div>
                </div>
                <!-- Info -->
                <div class="px-4 pb-3">
                  <p class="text-[14px] font-medium text-white/90">{{ resume.ownerName || resume.title }}</p>
                  <p class="text-[13px] text-white/40">{{ resume.targetJobTitle || 'Professional' }}</p>
                  <p class="text-[11px] mt-1 text-white/20">{{ resume.viewCount || 0 }} views</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <p class="text-[20px] font-medium mb-2 text-white/40">No resumes found</p>
            <p class="text-[14px] text-white/20">Try different keywords</p>
          </div>
        }
      </div>
    </app-page-shell>
  `,
})
export class CommunityComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private router = inject(Router);

  resumes = signal<BackendResume[]>([]);
  isLoading = signal(true);
  activeFilter = signal('All');

  categories = ['All', 'Engineering', 'Design', 'Product', 'Data'];

  ngOnInit() {
    this.loadResumes();
  }

  loadResumes(query?: string) {
    this.isLoading.set(true);
    this.resumeService.getPublicResumes(query).subscribe({
      next: (data) => { this.resumes.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(query: string) { this.loadResumes(query); }
  openPreview(resume: BackendResume) { this.router.navigate(['/community/resume', resume.resumeId]); }
}
