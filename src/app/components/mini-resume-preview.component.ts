import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal, computed, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { TemplateService, BackendTemplate } from '../core/services/template.service';
import { ResumeDataMapperService } from '../core/services/resume-data-mapper.service';
import { ResumeRendererComponent } from './resume-renderer/resume-renderer.component';
import { TemplateLayoutConfig, ResumeRenderData } from '../core/models/template-config.model';
import { DEFAULT_LAYOUT_CONFIG } from '../core/models/default-template-config';

/**
 * A miniature, CSS-scaled live preview of an actual resume.
 * Renders the full ResumeRendererComponent at 794px width, then scales
 * it down to fit inside a small container using CSS transform.
 *
 * Usage:
 *   <app-mini-resume-preview [resume]="backendResume"></app-mini-resume-preview>
 *   OR lazy-load by ID:
 *   <app-mini-resume-preview [resumeId]="42"></app-mini-resume-preview>
 */
@Component({
  selector: 'app-mini-resume-preview',
  standalone: true,
  imports: [CommonModule, ResumeRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #container class="mini-preview-container" [style.height.px]="containerHeight">
      @if (isVisible() && parsedConfig() && renderData()) {
        <div class="mini-preview-scaler" [style.transform]="'scale(' + scaleFactor + ')'">
          <app-resume-renderer [config]="parsedConfig()!" [resumeData]="renderData()!"></app-resume-renderer>
        </div>
      } @else {
        <!-- Skeleton placeholder while loading -->
        <div class="mini-preview-skeleton">
          <div class="skeleton-header">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40 thin"></div>
          </div>
          <div class="skeleton-body">
            <div class="skeleton-section-label"></div>
            <div class="skeleton-line w-100"></div>
            <div class="skeleton-line w-90"></div>
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-section-label mt"></div>
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-100"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .mini-preview-container {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background: white;
    }

    .mini-preview-scaler {
      position: absolute;
      top: 0;
      left: 0;
      width: 794px;
      transform-origin: top left;
      pointer-events: none;
    }

    .mini-preview-skeleton {
      height: 100%;
      padding: 12%;
      display: flex;
      flex-direction: column;
      gap: 12%;
      background: #fafafa;
    }

    .skeleton-header {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skeleton-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skeleton-line {
      height: 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.08);
    }
    .skeleton-line.thin { height: 3px; background: rgba(0, 0, 0, 0.05); }
    .skeleton-line.w-100 { width: 100%; }
    .skeleton-line.w-90 { width: 90%; }
    .skeleton-line.w-80 { width: 80%; }
    .skeleton-line.w-60 { width: 60%; }
    .skeleton-line.w-50 { width: 50%; }
    .skeleton-line.w-40 { width: 40%; }

    .skeleton-section-label {
      width: 35%;
      height: 3px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.12);
      margin-top: 4px;
    }
    .skeleton-section-label.mt { margin-top: 8px; }
  `]
})
export class MiniResumePreviewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private resumeService = inject(ResumeService);
  private templateService = inject(TemplateService);
  private dataMapper = inject(ResumeDataMapperService);

  /** Pass a full BackendResume (with sections) for immediate rendering */
  @Input() resume: BackendResume | null = null;

  /** Or pass just a resumeId — the component will lazy-load the data */
  @Input() resumeId: number | null = null;

  /** Scale factor: 0.25 means 794px → ~199px visible width */
  @Input() scaleFactor = 0.25;

  /** Height of the visible container in px */
  @Input() containerHeight = 220;

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  private observer: IntersectionObserver | null = null;

  isVisible = signal(false);
  loadedResume = signal<BackendResume | null>(null);
  templateConfig = signal<BackendTemplate | null>(null);

  parsedConfig = computed<TemplateLayoutConfig | null>(() => {
    const template = this.templateConfig();
    if (!template?.layoutConfig) return DEFAULT_LAYOUT_CONFIG;
    try {
      return JSON.parse(template.layoutConfig) as TemplateLayoutConfig;
    } catch {
      return DEFAULT_LAYOUT_CONFIG;
    }
  });

  renderData = computed<ResumeRenderData | null>(() => {
    const res = this.resume || this.loadedResume();
    if (!res) return null;
    return this.dataMapper.toRenderData(res);
  });

  ngOnInit() {
    // If a full resume object with sections was provided, load its template immediately
    const res = this.resume;
    if (res && res.sections && res.sections.length > 0) {
      this.loadTemplateConfig(res.templateId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resume'] && this.resume) {
      this.loadTemplateConfig(this.resume.templateId);
    }
  }

  ngAfterViewInit() {
    // Use IntersectionObserver for lazy loading — only fetch data when scrolled into view
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isVisible()) {
            this.isVisible.set(true);
            this.triggerLoad();
            // Once visible, stop observing
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' } // Start loading 200px before entering viewport
    );
    this.observer.observe(this.containerRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private triggerLoad() {
    const res = this.resume;
    if (res) {
      // We already have the resume data, just ensure template is loaded
      if (!this.templateConfig()) {
        this.loadTemplateConfig(res.templateId);
      }
    } else if (this.resumeId) {
      // Lazy-load the full resume data
      this.resumeService.getResumeById(this.resumeId).subscribe({
        next: (data) => {
          this.loadedResume.set(data);
          this.loadTemplateConfig(data.templateId);
        },
        error: () => {
          // Silently fail — skeleton will remain
        }
      });
    }
  }

  private loadTemplateConfig(templateId: number) {
    const tid = templateId || 1;
    this.templateService.getTemplateById(tid).subscribe({
      next: (template) => this.templateConfig.set(template),
      error: () => {
        // Fallback to default config
        this.templateConfig.set({
          name: 'Default',
          description: '',
          category: 'PROFESSIONAL',
          isActive: true,
          isPremium: false,
          usageCount: 0,
          layoutConfig: JSON.stringify(DEFAULT_LAYOUT_CONFIG)
        } as BackendTemplate);
      }
    });
  }
}
