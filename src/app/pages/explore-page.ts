import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { PageShellComponent } from '../components/page-shell';
import { SectionHeadingComponent } from '../components/section-heading';
import { TemplateCardComponent } from '../components/template-card';
import { TemplatePreviewModalComponent } from '../components/template-preview-modal';
import { TemplateService, BackendTemplate } from '../core/services/template.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [PageShellComponent, SectionHeadingComponent, TemplateCardComponent, TemplatePreviewModalComponent, CommonModule],
  template: `
    <app-page-shell>
      <div class="py-10">
        <app-section-heading eyebrow="Template library" align="left">
          Explore <em class="font-serif-display font-normal italic">Templates</em>
        </app-section-heading>
        <p class="mt-3 max-w-xl text-[15px] leading-[1.7] opacity-60">
          Hand-crafted, ATS-ready layouts. Pick a starting point — then tailor your resume to any role in seconds.
        </p>

        <!-- Filters -->
        <div class="mt-8 flex flex-wrap items-center gap-2">
          @for (f of allFilters; track f) {
            <button (click)="setFilter(f)"
                    class="px-4 py-1.5 rounded-full text-[13px] transition-all cursor-pointer"
                    [style.background]="filter() === f ? 'rgba(255,255,255,0.08)' : 'transparent'"
                    [style.color]="filter() === f ? 'white' : 'rgba(255,255,255,0.4)'"
                    [style.border]="filter() === f ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent'">
              {{ formatLabel(f) }}
            </button>
          }
        </div>

        <!-- Grid -->
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative min-h-[300px]">
          @if (loading()) {
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="text-[14px] text-white/40">Loading templates...</p>
            </div>
          } @else {
            @for (t of filteredTemplates(); track t.templateId) {
              <app-template-card [template]="t" (selectTemplate)="previewTemplate(t)"></app-template-card>
            }
            @if (filteredTemplates().length === 0) {
              <div class="col-span-full pt-10 text-center">
                <p class="text-[14px] text-white/30">No templates found for this filter.</p>
              </div>
            }
          }
        </div>
        <app-template-preview-modal
          [isOpen]="isModalOpen()"
          [template]="selectedTemplate()"
          (close)="closeModal()">
        </app-template-preview-modal>
      </div>
    </app-page-shell>
  `,
})
export class ExploreComponent implements OnInit {
  private templateService = inject(TemplateService);

  categories = ['PROFESSIONAL', 'CREATIVE', 'MODERN', 'MINIMALIST', 'ATS_OPTIMISED'];
  allFilters = ['ALL', 'FREE', 'PREMIUM', ...['PROFESSIONAL', 'CREATIVE', 'MODERN', 'MINIMALIST', 'ATS_OPTIMISED']];
  filter = signal<string>('ALL');
  templates = signal<BackendTemplate[]>([]);
  loading = signal<boolean>(true);

  isModalOpen = signal<boolean>(false);
  selectedTemplate = signal<BackendTemplate | null>(null);

  filteredTemplates = computed(() => {
    const f = this.filter();
    const t = this.templates();
    if (f === 'ALL') return t;
    if (f === 'FREE') return t.filter(x => !x.isPremium);
    if (f === 'PREMIUM') return t.filter(x => x.isPremium);
    return t.filter(x => x.category === f);
  });

  ngOnInit() {
    this.templateService.getAllTemplates().subscribe({
      next: (data) => { this.templates.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setFilter(category: string) { this.filter.set(category); }

  formatLabel(c: string): string {
    if (c === 'ALL') return 'All';
    if (c === 'FREE') return 'Free';
    if (c === 'PREMIUM') return 'Premium';
    return c.replace('_', ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  }

  previewTemplate(template: BackendTemplate) {
    this.selectedTemplate.set(template);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedTemplate.set(null);
    document.body.style.overflow = '';
  }
}
