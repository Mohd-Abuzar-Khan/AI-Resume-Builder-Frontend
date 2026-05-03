import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { TemplateService, BackendTemplate, TemplateUpsertRequest } from '../../core/services/template.service';
import { PopupService } from '../../core/services/popup.service';
import { ResumeDataMapperService } from '../../core/services/resume-data-mapper.service';
import { ResumeRendererComponent } from '../../components/resume-renderer/resume-renderer.component';
import { TemplateLayoutConfig, SectionConfig, SectionStyle } from '../../core/models/template-config.model';
import { DEFAULT_LAYOUT_CONFIG } from '../../core/models/default-template-config';

const FONT_OPTIONS = ['Playfair Display', 'Merriweather', 'Inter', 'Open Sans', 'Source Sans Pro', 'Lato', 'Roboto'];
const STARTER_TEMPLATE_NAMES = ['Classic Professional', 'Modern Minimal', 'Two-Column Executive'];
const DEFAULT_HTML_LAYOUT = '<div class="resume-root">{{content}}</div>';
const DEFAULT_CSS_STYLES = '.resume-root { font-family: sans-serif; }';

// Moved to shared file: DEFAULT_LAYOUT_CONFIG

@Component({
  selector: 'app-admin-templates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ResumeRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <p class="text-[13px] mb-1 text-white/40 uppercase tracking-widest">Admin</p>
            <h1 class="text-[32px] font-medium tracking-tight text-white/90">
              {{ currentView() === 'list' ? 'Templates' : (editingTemplateId() ? 'Edit Template' : 'Create Template') }}
            </h1>
          </div>
          <div class="flex items-center gap-4">
            @if (currentView() === 'list') {
              <button (click)="createNewTemplate()" class="btn-primary px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(129,140,248,0.2)]">
                Create New Template
              </button>
            } @else {
              <button (click)="backToList()" class="text-white/60 hover:text-white transition-colors text-[14px] px-4">
                Back to List
              </button>
              <button (click)="saveTemplate()" [disabled]="templateForm.invalid || isSaving()" 
                      class="btn-primary px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(129,140,248,0.2)] disabled:opacity-50">
                {{ isSaving() ? 'Saving...' : 'Save Template' }}
              </button>
            }
          </div>
        </div>

        @if (currentView() === 'list') {
          <!-- List View -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (template of templates(); track template.templateId) {
              <div class="glass-card rounded-3xl p-6 transition-all hover:shadow-2xl group" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
                <div class="flex justify-between items-start mb-6">
                  <div class="aspect-[3/4] w-28 rounded-2xl overflow-hidden border border-white/5 bg-white/5 relative group-hover:scale-105 transition-transform duration-500">
                    @if (template.thumbnailUrl || template.previewUrl) {
                      <img [src]="template.thumbnailUrl || template.previewUrl" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-[11px] text-white/20">No Preview</div>
                    }
                    <div class="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <span class="px-3 py-1 rounded-full text-[10px] font-semibold self-end glass-badge"
                          [style.color]="template.isActive ? '#4FD1C5' : '#F87171'"
                          [style.border-color]="template.isActive ? 'rgba(79,209,197,0.3)' : 'rgba(248,113,113,0.3)'">
                      {{ template.isActive ? 'Active' : 'Inactive' }}
                    </span>
                    @if (template.isPremium) {
                      <span class="px-3 py-1 rounded-full text-[10px] font-semibold self-end glass-badge"
                            style="border-color:rgba(246,173,85,0.4); color:#F6AD55;">
                        Premium
                      </span>
                    }
                  </div>
                </div>

                <h3 class="text-[18px] font-medium mb-1 text-white/90">{{ template.name }}</h3>
                <p class="text-[13px] line-clamp-2 mb-6 text-white/40 leading-relaxed">{{ template.description }}</p>

                <div class="flex items-center justify-between pt-5 border-t border-white/5">
                  <div class="flex flex-col">
                    <span class="text-[14px] text-white/90 font-medium">{{ template.usageCount }}</span>
                    <span class="text-[10px] text-white/30 uppercase tracking-widest font-semibold">uses</span>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="editTemplate(template)" class="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white" title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button (click)="deleteTemplate(template.templateId!)" class="p-2.5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-xl transition-all" title="Delete">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Builder View -->
          <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <!-- Left Panel: Builder Form -->
            <form [formGroup]="templateForm" class="space-y-8 pb-20">
              <div class="glass-card rounded-3xl p-8 space-y-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
                <div class="flex items-center justify-between">
                  <h2 class="text-[16px] font-medium text-white/90">Template Metadata</h2>
                  <select class="glass-input px-4 py-2 text-[12px] bg-white/5 border-white/10" (change)="onStarterSelected($event)">
                    <option value="">Load Starter</option>
                    @for (starter of starterTemplates(); track starter.templateId) {
                      <option [value]="starter.name">{{ starter.name }}</option>
                    }
                  </select>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Name</label>
                    <input class="glass-input w-full" formControlName="name" placeholder="E.g. Modern Executive" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Options</label>
                    <div class="flex flex-wrap gap-6 pt-2">
                      <label class="flex items-center gap-3 text-[13px] text-white/70 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" formControlName="isActive" class="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
                        Active
                      </label>
                      <label class="flex items-center gap-3 text-[13px] text-white/70 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" formControlName="isPremium" class="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
                        Premium
                      </label>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Thumbnail URL</label>
                  <input class="glass-input w-full" formControlName="thumbnailUrl" placeholder="https://..." />
                </div>
                <div class="space-y-2">
                  <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Description</label>
                  <textarea class="glass-input w-full" rows="3" formControlName="description" placeholder="Describe this template's unique value..."></textarea>
                </div>
              </div>

              <div class="glass-card rounded-3xl p-8 space-y-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);" formGroupName="font">
                <h2 class="text-[16px] font-medium text-white/90">Typography</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Heading Font</label>
                    <select class="glass-input w-full" formControlName="heading">
                      @for (font of fontOptions; track font) {
                        <option [value]="font">{{ font }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Body Font</label>
                    <select class="glass-input w-full" formControlName="body">
                      @for (font of fontOptions; track font) {
                        <option [value]="font">{{ font }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Base Size ({{ templateForm.get('font.baseSize')?.value }}px)</label>
                    <input type="range" min="9" max="14" step="1" class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" formControlName="baseSize" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Line Height ({{ templateForm.get('font.lineHeight')?.value }})</label>
                    <input type="range" min="1.2" max="2" step="0.1" class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" formControlName="lineHeight" />
                  </div>
                </div>
              </div>

              <div class="glass-card rounded-3xl p-8 space-y-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);" formGroupName="colors">
                <h2 class="text-[16px] font-medium text-white/90">Colors</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                  @for (key of colorKeys; track key) {
                    <label class="flex flex-col gap-2 cursor-pointer group">
                      <span class="text-[11px] text-white/40 uppercase tracking-widest font-semibold group-hover:text-white/60 transition-colors">{{ formatKey(key) }}</span>
                      <div class="flex items-center gap-3">
                        <input type="color" class="h-9 w-9 rounded-xl border-none bg-transparent cursor-pointer" [formControlName]="key" />
                        <span class="text-[12px] font-mono text-white/60 group-hover:text-white transition-colors">{{ templateForm.get('colors.' + key)?.value }}</span>
                      </div>
                    </label>
                  }
                </div>
              </div>

              <div class="glass-card rounded-3xl p-8 space-y-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);" formGroupName="page">
                <h2 class="text-[16px] font-medium text-white/90">Page Layout</h2>
                <div class="flex gap-8 pt-2">
                  @for (layout of ['single-column', 'two-column', 'left-label']; track layout) {
                    <label class="flex items-center gap-3 text-[13px] text-white/70 cursor-pointer hover:text-white transition-colors">
                      <input type="radio" [value]="layout" formControlName="layout" class="w-4 h-4 border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
                      <span class="capitalize">{{ layout.replace('-', ' ') }}</span>
                    </label>
                  }
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                  @for (side of ['Top', 'Bottom', 'Left', 'Right']; track side) {
                    <div class="space-y-2">
                      <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">{{ side }}</label>
                      <input type="number" class="glass-input w-full" [formControlName]="'margin' + side" />
                    </div>
                  }
                </div>
              </div>

              <div class="glass-card rounded-3xl p-8 space-y-6" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
                <h2 class="text-[16px] font-medium text-white/90">Section Styles</h2>
                <div formArrayName="sections" class="space-y-4">
                  @for (section of sectionControls(); track section.get('type')?.value) {
                    <details class="rounded-2xl border border-white/10 bg-white/5 p-5 group open:shadow-lg transition-all" [open]="$index === 0">
                      <summary class="cursor-pointer text-[14px] font-medium text-white/90 flex items-center justify-between">
                        <span>{{ section.get('label')?.value }}</span>
                        <span class="text-[10px] text-white/30 uppercase tracking-widest group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div class="mt-6 space-y-6" [formGroup]="section">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <label class="flex items-center gap-3 text-[13px] text-white/70 cursor-pointer">
                            <input type="checkbox" formControlName="enabled" class="w-4 h-4 border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
                            Enabled
                          </label>
                          <div class="space-y-1">
                            <label class="text-[11px] text-white/40 uppercase tracking-widest">Label</label>
                            <input class="glass-input w-full py-1.5" formControlName="label" />
                          </div>
                          <div class="space-y-1">
                            <label class="text-[11px] text-white/40 uppercase tracking-widest">Order</label>
                            <input type="number" class="glass-input w-full py-1.5" formControlName="order" />
                          </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6" [formGroup]="sectionStyleGroup(section)">
                          <div class="space-y-1">
                            <label class="text-[11px] text-white/40 uppercase tracking-widest">Text Color</label>
                            <input type="color" formControlName="labelColor" class="h-9 w-full bg-transparent border-none cursor-pointer" />
                          </div>
                          <div class="space-y-1">
                            <label class="text-[11px] text-white/40 uppercase tracking-widest">Font Size</label>
                            <input type="number" class="glass-input w-full py-1.5" formControlName="labelSize" />
                          </div>
                          <label class="flex items-center gap-3 text-[13px] text-white/70 cursor-pointer pt-4">
                            <input type="checkbox" formControlName="showUnderline" class="w-4 h-4 border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
                            Underline
                          </label>
                          <div class="space-y-1">
                            <label class="text-[11px] text-white/40 uppercase tracking-widest">Spacing</label>
                            <input type="range" min="4" max="32" formControlName="spacingAfter" class="w-full accent-indigo-500 mt-2" />
                          </div>
                        </div>

                        @if (section.get('type')?.value === 'SKILLS') {
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5" [formGroup]="sectionStyleGroup(section)">
                            <div class="space-y-1">
                              <label class="text-[11px] text-white/40 uppercase tracking-widest">Render As</label>
                              <select class="glass-input w-full py-1.5" formControlName="renderAs">
                                <option value="tags">Tags</option>
                                <option value="list">List</option>
                                <option value="inline">Inline</option>
                              </select>
                            </div>
                            @if (section.get('style')?.get('renderAs')?.value === 'tags') {
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                  <label class="text-[11px] text-white/40 uppercase tracking-widest">Tag BG</label>
                                  <input type="color" formControlName="tagBackground" class="h-8 w-full bg-transparent border-none" />
                                </div>
                                <div class="space-y-1">
                                  <label class="text-[11px] text-white/40 uppercase tracking-widest">Tag Text</label>
                                  <input type="color" formControlName="tagTextColor" class="h-8 w-full bg-transparent border-none" />
                                </div>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </details>
                  }
                </div>
              </div>
            </form>

            <!-- Right Panel: Live Preview -->
            <div class="space-y-6" style="position:sticky; top:24px; align-self:flex-start; max-height: calc(100vh - 48px); display: flex; flex-direction: column;">
              <div class="glass-card rounded-3xl p-6 flex flex-col h-full" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05); min-height: 600px;">
                <div class="flex items-center justify-between mb-6 flex-shrink-0">
                  <h3 class="text-[15px] font-medium text-white/90">Live Preview</h3>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1 border border-white/10">
                      <span class="text-[10px] text-white/40 uppercase">Zoom</span>
                      <input type="range" min="0.4" max="1.2" step="0.05" [value]="previewScale()" (input)="updatePreviewScale($event)" class="w-20 h-1 accent-indigo-500" />
                      <span class="text-[10px] text-white/60 w-8">{{ Math.round(previewScale() * 100) }}%</span>
                    </div>
                    <button class="text-indigo-400 hover:text-indigo-300 transition-colors text-[12px] font-medium" (click)="downloadSamplePdf()">Download PDF</button>
                  </div>
                </div>
                
                <div class="flex-1 rounded-2xl border border-white/10 overflow-hidden bg-[#111] shadow-2xl relative custom-scrollbar overflow-y-auto">
                  <div class="min-h-full w-full flex justify-center p-4" style="background: #1a1a1a;">
                    <div [style.transform]="'scale(' + previewScale() + ')'" style="transform-origin: top center; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                      <app-resume-renderer
                        [config]="previewConfig()"
                        [resumeData]="dummyData"
                        [previewMode]="true">
                      </app-resume-renderer>
                    </div>
                  </div>
                </div>
                <p class="mt-4 flex-shrink-0 text-[11px] text-white/30 text-center italic">Changes reflect in real-time as you tweak the builder.</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,

})
export class AdminTemplatesComponent implements OnInit {
  private templateService = inject(TemplateService);
  private fb = inject(FormBuilder);
  private dataMapper = inject(ResumeDataMapperService);
  private popup = inject(PopupService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(ResumeRendererComponent) previewRendererRef!: ResumeRendererComponent;

  fontOptions = FONT_OPTIONS;
  colorKeys = ['accent', 'headingText', 'bodyText', 'mutedText', 'divider', 'background', 'sidebarBackground'];

  templates = signal<BackendTemplate[]>([]);
  currentView = signal<'list' | 'builder'>('list');
  previewConfig = signal<TemplateLayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  editingTemplateId = signal<number | null>(null);
  isSaving = signal(false);
  previewScale = signal(0.75);
  readonly Math = Math;

  dummyData = this.dataMapper.dummyData();

  templateForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true],
    isPremium: [false],
    thumbnailUrl: [''],
    font: this.fb.nonNullable.group({
      heading: [DEFAULT_LAYOUT_CONFIG.font.heading],
      body: [DEFAULT_LAYOUT_CONFIG.font.body],
      mono: [DEFAULT_LAYOUT_CONFIG.font.mono],
      baseSize: [DEFAULT_LAYOUT_CONFIG.font.baseSize],
      lineHeight: [DEFAULT_LAYOUT_CONFIG.font.lineHeight]
    }),
    colors: this.fb.nonNullable.group({
      accent: [DEFAULT_LAYOUT_CONFIG.colors.accent],
      headingText: [DEFAULT_LAYOUT_CONFIG.colors.headingText],
      bodyText: [DEFAULT_LAYOUT_CONFIG.colors.bodyText],
      mutedText: [DEFAULT_LAYOUT_CONFIG.colors.mutedText],
      divider: [DEFAULT_LAYOUT_CONFIG.colors.divider],
      background: [DEFAULT_LAYOUT_CONFIG.colors.background],
      sidebarBackground: [DEFAULT_LAYOUT_CONFIG.colors.sidebarBackground]
    }),
    page: this.fb.nonNullable.group({
      marginTop: [DEFAULT_LAYOUT_CONFIG.page.marginTop],
      marginBottom: [DEFAULT_LAYOUT_CONFIG.page.marginBottom],
      marginLeft: [DEFAULT_LAYOUT_CONFIG.page.marginLeft],
      marginRight: [DEFAULT_LAYOUT_CONFIG.page.marginRight],
      layout: [DEFAULT_LAYOUT_CONFIG.page.layout]
    }),
    header: this.fb.nonNullable.group({
      nameSize: [DEFAULT_LAYOUT_CONFIG.header.nameSize],
      nameBold: [DEFAULT_LAYOUT_CONFIG.header.nameBold],
      nameColor: [DEFAULT_LAYOUT_CONFIG.header.nameColor],
      subtitleSize: [DEFAULT_LAYOUT_CONFIG.header.subtitleSize],
      subtitleColor: [DEFAULT_LAYOUT_CONFIG.header.subtitleColor],
      contactSize: [DEFAULT_LAYOUT_CONFIG.header.contactSize],
      contactLayout: [DEFAULT_LAYOUT_CONFIG.header.contactLayout],
      showDivider: [DEFAULT_LAYOUT_CONFIG.header.showDivider],
      dividerColor: [DEFAULT_LAYOUT_CONFIG.header.dividerColor],
      dividerWeight: [DEFAULT_LAYOUT_CONFIG.header.dividerWeight]
    }),
    sections: this.fb.array(DEFAULT_LAYOUT_CONFIG.sections.map(section => this.buildSectionGroup(section))),
    twoColumn: this.fb.nonNullable.group({
      enabled: [DEFAULT_LAYOUT_CONFIG.twoColumn.enabled],
      splitRatio: [DEFAULT_LAYOUT_CONFIG.twoColumn.splitRatio],
      mainSections: [DEFAULT_LAYOUT_CONFIG.twoColumn.mainSections],
      sidebarSections: [DEFAULT_LAYOUT_CONFIG.twoColumn.sidebarSections],
      sidebarBackground: [DEFAULT_LAYOUT_CONFIG.twoColumn.sidebarBackground],
      sidebarPadding: [DEFAULT_LAYOUT_CONFIG.twoColumn.sidebarPadding]
    })
  });

  starterTemplates = computed(() => this.templates().filter(template => STARTER_TEMPLATE_NAMES.includes(template.name)));

  ngOnInit(): void {
    this.loadTemplates();

    this.templateForm.valueChanges
      .pipe(
        startWith(this.templateForm.getRawValue()), 
        debounceTime(50), 
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.previewConfig.set(this.buildLayoutConfig());
        this.cdr.markForCheck();
      });
  }

  updatePreviewScale(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.previewScale.set(parseFloat(input.value));
  }

  sectionControls(): FormGroup[] {
    return (this.templateForm.get('sections') as FormArray).controls as FormGroup[];
  }

  sectionStyleGroup(section: FormGroup): FormGroup {
    return section.get('style') as FormGroup;
  }

  onStarterSelected(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const name = select.value;
    if (!name) return;
    const template = this.templates().find(item => item.name === name);
    if (!template?.layoutConfig) return;

    const parsed = this.safeJsonParse<TemplateLayoutConfig>(template.layoutConfig);
    if (!parsed) return;

    this.applyConfig(parsed);
    this.templateForm.patchValue({
      name: template.name,
      description: template.description || '',
      isActive: template.isActive,
      isPremium: template.isPremium || false,
      thumbnailUrl: template.thumbnailUrl || ''
    });
    this.editingTemplateId.set(template.templateId ?? null);
  }

  saveTemplate(): void {
    if (this.templateForm.invalid) return;

    const layoutConfig = JSON.stringify(this.buildLayoutConfig());
    const payload: TemplateUpsertRequest = {
      name: this.templateForm.controls.name.value,
      description: this.templateForm.controls.description.value,
      isActive: this.templateForm.controls.isActive.value,
      layoutConfig,
      htmlLayout: DEFAULT_HTML_LAYOUT,
      cssStyles: DEFAULT_CSS_STYLES,
      category: 'PROFESSIONAL',
      isPremium: this.templateForm.controls.isPremium.value,
      thumbnailUrl: this.templateForm.controls.thumbnailUrl.value
    };

    this.isSaving.set(true);

    const templateId = this.editingTemplateId();
    const request$ = templateId
      ? this.templateService.updateTemplate(templateId, payload)
      : this.templateService.createTemplate(payload);

    request$.subscribe({
      next: (saved) => {
        this.templates.update(list => {
          const index = list.findIndex(item => item.templateId === saved.templateId);
          if (index >= 0) {
            const updated = [...list];
            updated[index] = saved;
            return updated;
          }
          return [saved, ...list];
        });
        this.isSaving.set(false);
        this.currentView.set('list');
      },
      error: (err) => {
        console.error('Failed to save template', err);
        this.isSaving.set(false);
      }
    });
  }

  createNewTemplate(): void {
    this.editingTemplateId.set(null);
    this.templateForm.reset({
      name: '',
      description: '',
      isActive: true,
      isPremium: false,
      thumbnailUrl: '',
      font: DEFAULT_LAYOUT_CONFIG.font,
      colors: DEFAULT_LAYOUT_CONFIG.colors,
      page: DEFAULT_LAYOUT_CONFIG.page,
      header: DEFAULT_LAYOUT_CONFIG.header,
      twoColumn: DEFAULT_LAYOUT_CONFIG.twoColumn
    });
    this.applyConfig(DEFAULT_LAYOUT_CONFIG);
    this.currentView.set('builder');
  }

  editTemplate(template: BackendTemplate): void {
    if (!template.layoutConfig) return;
    const parsed = this.safeJsonParse<TemplateLayoutConfig>(template.layoutConfig);
    if (!parsed) return;

    this.applyConfig(parsed);
    this.templateForm.patchValue({
      name: template.name,
      description: template.description || '',
      isActive: template.isActive,
      isPremium: template.isPremium || false,
      thumbnailUrl: template.thumbnailUrl || ''
    });
    this.editingTemplateId.set(template.templateId ?? null);
    this.currentView.set('builder');
  }

  deleteTemplate(id: number): void {
    this.popup.confirm(
      'Deactivate Template',
      'Are you sure you want to deactivate this template? It will no longer be visible to users.',
      () => {
        this.templateService.deactivateTemplate(id).subscribe({
          next: () => {
            this.templates.update(list => list.filter(t => t.templateId !== id));
            this.popup.success('Success', 'Template deactivated successfully');
          },
          error: (err) => {
            console.error('Failed to deactivate template', err);
            this.popup.error('Error', 'Failed to deactivate template');
          }
        });
      }
    );
  }

  backToList(): void {
    this.currentView.set('list');
  }

  async downloadSamplePdf(): Promise<void> {
    const rendererEl = this.previewRendererRef?.resumeRoot?.nativeElement;
    if (!rendererEl) return;

    try {
      await document.fonts.ready;

      const config = this.previewConfig();
      const canvas = await html2canvas(rendererEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: config.colors.background,
        logging: false,
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspect = canvas.height / canvas.width;
      const contentHeightPt = pdfWidth * canvasAspect;

      if (contentHeightPt <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, contentHeightPt);
      } else {
        let yOffset = 0;
        const pageHeightPx = (canvas.width * pdfHeight) / pdfWidth;
        while (yOffset < canvas.height) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(pageHeightPx, canvas.height - yOffset);
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, -yOffset);
            const pageImg = pageCanvas.toDataURL('image/jpeg', 0.97);
            if (yOffset > 0) pdf.addPage();
            pdf.addImage(pageImg, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          }
          yOffset += pageHeightPx;
        }
      }

      pdf.save('template-preview.pdf');
    } catch (err) {
      console.error('Sample PDF export failed', err);
    }
  }

  splitRatioPercent(): string {
    const ratio = this.templateForm.controls.twoColumn.controls.splitRatio.value;
    return `${Math.round(ratio * 100)}%`;
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  private loadTemplates(): void {
    this.templateService.getAllTemplates().subscribe({
      next: (templates) => this.templates.set(templates),
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  private buildLayoutConfig(): TemplateLayoutConfig {
    const raw = this.templateForm.getRawValue();
    const sections = raw.sections.map(section => {
      const typed = section as {
        type: string;
        label: string;
        enabled: boolean;
        order: number;
        style: SectionStyle;
      };
      return {
        type: typed.type,
        label: typed.label,
        enabled: typed.enabled,
        order: typed.order,
        style: typed.style
      };
    });

    return {
      font: raw.font,
      colors: raw.colors,
      page: raw.page,
      header: raw.header,
      sections,
      twoColumn: {
        ...raw.twoColumn,
        enabled: raw.page.layout === 'two-column'
      }
    };
  }

  private buildSectionGroup(section: SectionConfig): FormGroup {
    return this.fb.nonNullable.group({
      type: [section.type],
      label: [section.label],
      enabled: [section.enabled],
      order: [section.order],
      style: this.fb.nonNullable.group({
        labelSize: [section.style.labelSize],
        labelBold: [section.style.labelBold],
        labelUppercase: [section.style.labelUppercase],
        labelColor: [section.style.labelColor],
        showUnderline: [section.style.showUnderline],
        underlineColor: [section.style.underlineColor || section.style.labelColor],
        underlineWeight: [section.style.underlineWeight || 1],
        bodySize: [section.style.bodySize || DEFAULT_LAYOUT_CONFIG.font.baseSize],
        bodyColor: [section.style.bodyColor || DEFAULT_LAYOUT_CONFIG.colors.bodyText],
        spacingAfter: [section.style.spacingAfter],
        entryTitleSize: [section.style.entryTitleSize || 12],
        entryTitleBold: [section.style.entryTitleBold ?? true],
        entryTitleColor: [section.style.entryTitleColor || DEFAULT_LAYOUT_CONFIG.colors.headingText],
        entrySubtitleSize: [section.style.entrySubtitleSize || 11],
        entrySubtitleItalic: [section.style.entrySubtitleItalic ?? true],
        entrySubtitleColor: [section.style.entrySubtitleColor || DEFAULT_LAYOUT_CONFIG.colors.mutedText],
        entryDateSize: [section.style.entryDateSize || 10],
        entryDateColor: [section.style.entryDateColor || DEFAULT_LAYOUT_CONFIG.colors.mutedText],
        bulletSize: [section.style.bulletSize || 10],
        bulletColor: [section.style.bulletColor || DEFAULT_LAYOUT_CONFIG.colors.bodyText],
        bulletIndent: [section.style.bulletIndent || 14],
        renderAs: [section.style.renderAs || 'tags'],
        tagBackground: [section.style.tagBackground || '#EEF2FA'],
        tagTextColor: [section.style.tagTextColor || DEFAULT_LAYOUT_CONFIG.colors.accent],
        tagBorderRadius: [section.style.tagBorderRadius || 4],
        tagFontSize: [section.style.tagFontSize || 10]
      })
    });
  }

  private applyConfig(config: TemplateLayoutConfig): void {
    this.templateForm.patchValue({
      font: config.font,
      colors: config.colors,
      page: config.page,
      header: config.header,
      twoColumn: {
        ...config.twoColumn,
        enabled: config.page.layout === 'two-column'
      }
    });

    const sectionsArray = this.templateForm.get('sections') as FormArray;
    sectionsArray.clear();
    const allowedTypes = ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'LANGUAGES', 'PROJECTS', 'ACHIEVEMENTS'];
    const normalized = config.sections.filter(section => allowedTypes.includes(section.type));
    const existingTypes = new Set(normalized.map(section => section.type));

    DEFAULT_LAYOUT_CONFIG.sections.forEach(defaultSection => {
      if (allowedTypes.includes(defaultSection.type) && !existingTypes.has(defaultSection.type)) {
        normalized.push(defaultSection);
      }
    });

    normalized
      .sort((a, b) => a.order - b.order)
      .forEach(section => sectionsArray.push(this.buildSectionGroup(section)));
  }

  private safeJsonParse<T>(value: string): T | null {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}