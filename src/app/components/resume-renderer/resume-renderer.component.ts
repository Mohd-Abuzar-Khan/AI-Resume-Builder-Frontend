import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeRenderData, TemplateLayoutConfig, SectionConfig, SectionStyle } from '../../core/models/template-config.model';

@Component({
  selector: 'app-resume-renderer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #resumeRoot [ngStyle]="pageStyle()">
      <div [ngStyle]="headerWrapperStyle()">
        <div [ngStyle]="nameStyle()">{{ resumeData().personal.name }}</div>
        @if (resumeData().personal.subtitle) {
          <div [ngStyle]="subtitleStyle()">{{ resumeData().personal.subtitle }}</div>
        }
        <div [ngStyle]="contactStyle()">
          @if (config().header.contactLayout === 'inline') {
            {{ contactInline() }}
          } @else {
            @for (item of contactItems(); track item) {
              <div [ngStyle]="contactLineStyle()">{{ item }}</div>
            }
          }
        </div>
        @if (config().header.showDivider) {
          <hr [ngStyle]="dividerStyle()" />
        }
      </div>

      @if (isTwoColumn()) {
        <div [ngStyle]="twoColumnWrapperStyle()">
          <div [ngStyle]="sidebarStyle()">
            @for (section of sidebarSections(); track section.type) {
              <div [ngStyle]="sectionWrapperStyle(section.style)">
                <div [ngStyle]="sectionHeaderStyle(section)">{{ section.label }}</div>
                <ng-container *ngTemplateOutlet="sectionContent; context: { $implicit: section }"></ng-container>
              </div>
            }
          </div>
          <div [ngStyle]="mainColumnStyle()">
            @for (section of mainSections(); track section.type) {
              <div [ngStyle]="sectionWrapperStyle(section.style)">
                <div [ngStyle]="sectionHeaderStyle(section)">{{ section.label }}</div>
                <ng-container *ngTemplateOutlet="sectionContent; context: { $implicit: section }"></ng-container>
              </div>
            }
          </div>
        </div>
      } @else if (config().page.layout === 'left-label') {
        <div [ngStyle]="leftLabelWrapperStyle()">
          @for (section of singleColumnSections(); track section.type) {
            <div [ngStyle]="leftLabelRowStyle(section.style)">
              <div [ngStyle]="leftLabelHeaderStyle(section)">{{ section.label }}</div>
              <div [ngStyle]="leftLabelContentStyle()">
                <ng-container *ngTemplateOutlet="sectionContent; context: { $implicit: section }"></ng-container>
              </div>
            </div>
          }
        </div>
      } @else {
        <div [ngStyle]="singleColumnWrapperStyle()">
          @for (section of singleColumnSections(); track section.type) {
            <div [ngStyle]="sectionWrapperStyle(section.style)">
              <div [ngStyle]="sectionHeaderStyle(section)">{{ section.label }}</div>
              <ng-container *ngTemplateOutlet="sectionContent; context: { $implicit: section }"></ng-container>
            </div>
          }
        </div>
      }

      <ng-template #sectionContent let-section>
        @switch (section.type) {
          @case ('SUMMARY') { <div [ngStyle]="summaryStyle(section.style)">{{ resumeData().summary }}</div> }
          @case ('EXPERIENCE') { <div [ngStyle]="experienceWrapperStyle()">@for (item of resumeData().experience; track item.company + item.title) {
              <div [ngStyle]="experienceEntryStyle()">
                <div [ngStyle]="experienceTitleRowStyle()">
                  <div [ngStyle]="experienceTitleStyle(section.style)">{{ item.title }}</div>
                  <div [ngStyle]="experienceDateStyle(section.style)">{{ item.startDate }} - {{ item.endDate }}</div>
                </div>
                <div [ngStyle]="experienceSubtitleStyle(section.style)">{{ item.company }}</div>
                <ul [ngStyle]="bulletListStyle(section.style)">
                  @for (bullet of item.bullets; track bullet) {
                    <li [ngStyle]="bulletStyle(section.style)">{{ bullet }}</li>
                  }
                </ul>
              </div>
            }</div> }
          @case ('EDUCATION') { <div [ngStyle]="educationWrapperStyle()">@for (item of resumeData().education; track item.institution + item.degree) {
              <div [ngStyle]="educationEntryStyle()">
                <div [ngStyle]="experienceTitleRowStyle()">
                  <div [ngStyle]="educationTitleStyle(section.style)">{{ item.institution }}</div>
                  <div [ngStyle]="experienceDateStyle(section.style)">{{ item.year }}</div>
                </div>
                <div [ngStyle]="educationSubtitleStyle(section.style)">
                  {{ item.degree }}
                  @if (item.gpa) {
                    &nbsp;&bull; CGPA: {{ item.gpa }}
                  }
                </div>
              </div>
            }</div> }
          @case ('PROJECTS') { <div [ngStyle]="experienceWrapperStyle()">@for (item of resumeData().projects; track item.name + item.role) {
              <div [ngStyle]="experienceEntryStyle()">
                <div [ngStyle]="experienceTitleRowStyle()">
                  <div [ngStyle]="experienceTitleStyle(section.style)">{{ item.name }}</div>
                </div>
                @if (item.role) {
                  <div [ngStyle]="experienceSubtitleStyle(section.style)">{{ item.role }}</div>
                }
                <ul [ngStyle]="bulletListStyle(section.style)">
                  @for (bullet of parseBullets(item.description); track bullet) {
                    <li [ngStyle]="bulletStyle(section.style)">{{ bullet }}</li>
                  }
                </ul>
              </div>
            }</div> }
          @case ('ACHIEVEMENTS') {
            @if (resumeData().achievements && resumeData().achievements.length > 0) {
              <ul [ngStyle]="bulletListStyle(section.style)">
                @for (item of resumeData().achievements; track item) {
                  <li [ngStyle]="bulletStyle(section.style)">{{ item }}</li>
                }
              </ul>
            }
            @if (resumeData().certificateEntries && resumeData().certificateEntries!.length > 0) {
              <div [ngStyle]="experienceWrapperStyle()" [style.marginTop]="(resumeData().achievements && resumeData().achievements.length > 0) ? '12px' : '0'">
                @for (item of resumeData().certificateEntries; track item.name) {
                  <div [ngStyle]="experienceEntryStyle()">
                    <div [ngStyle]="experienceTitleRowStyle()">
                      <div [ngStyle]="educationTitleStyle(section.style)">{{ item.name }}</div>
                      @if (item.date) {
                        <div [ngStyle]="experienceDateStyle(section.style)">{{ item.date }}</div>
                      }
                    </div>
                    @if (item.description) {
                      <div [ngStyle]="projectDescriptionStyle(section.style)">{{ item.description }}</div>
                    }
                  </div>
                }
              </div>
            }
          }
          @case ('SKILLS') { <div [ngStyle]="skillsWrapperStyle(section.style)">
              @if (section.style.renderAs === 'tags') {
                @for (skill of resumeData().skills; track skill) {
                  <span [ngStyle]="skillTagStyle(section.style)">{{ skill }}</span>
                }
              } @else if (section.style.renderAs === 'list') {
                <ul [ngStyle]="listStyle()">
                  @for (skill of resumeData().skills; track skill) {
                    <li [ngStyle]="bulletStyle(section.style)">{{ skill }}</li>
                  }
                </ul>
              } @else {
                <div [ngStyle]="inlineListStyle(section.style)">{{ joinInline(resumeData().skills) }}</div>
              }
            </div> }
          @case ('LANGUAGES') { <div [ngStyle]="inlineListStyle(section.style)">{{ joinInline(resumeData().languages) }}</div> }
          @case ('CERTIFICATIONS') { <div [ngStyle]="summaryStyle(section.style)">{{ resumeData().certifications }}</div> }
        }
      </ng-template>
    </div>
  `
})
export class ResumeRendererComponent implements OnInit {
  config = input.required<TemplateLayoutConfig>();
  resumeData = input.required<ResumeRenderData>();
  previewMode = input<boolean>(false);

  @ViewChild('resumeRoot') resumeRoot!: ElementRef<HTMLDivElement>;

  singleColumnSections = computed(() => this.sortSections(this.config().sections.filter(section => section.enabled)));
  mainSections = computed(() => this.sortSections(this.config().sections.filter(section => section.enabled && this.config().twoColumn.mainSections.includes(section.type))));
  sidebarSections = computed(() => this.sortSections(this.config().sections.filter(section => section.enabled && this.config().twoColumn.sidebarSections.includes(section.type))));

  ngOnInit(): void {
    this.ensureFontsLoaded();
  }

  isTwoColumn(): boolean {
    return this.config().page.layout === 'two-column';
  }

  pageStyle(): Record<string, string | number> {
    const cfg = this.config();
    return {
      width: '794px',
      minHeight: '1123px',
      background: cfg.colors.background,
      padding: `${cfg.page.marginTop}px ${cfg.page.marginRight}px ${cfg.page.marginBottom}px ${cfg.page.marginLeft}px`,
      fontFamily: cfg.font.body,
      fontSize: `${cfg.font.baseSize}px`,
      lineHeight: cfg.font.lineHeight,
      color: cfg.colors.bodyText,
      boxSizing: 'border-box',
      border: cfg.page.layout === 'left-label' ? `24px solid ${cfg.colors.sidebarBackground}` : 'none'
    };
  }

  headerWrapperStyle(): Record<string, string | number> {
    return {
      marginBottom: '12px'
    };
  }

  nameStyle(): Record<string, string | number> {
    const cfg = this.config();
    return {
      fontFamily: cfg.font.heading,
      fontSize: `${cfg.header.nameSize}px`,
      fontWeight: cfg.header.nameBold ? 700 : 400,
      color: cfg.header.nameColor
    };
  }

  subtitleStyle(): Record<string, string | number> {
    const cfg = this.config();
    return {
      marginTop: '4px',
      fontSize: `${cfg.header.subtitleSize}px`,
      color: cfg.header.subtitleColor
    };
  }

  contactStyle(): Record<string, string | number> {
    const cfg = this.config();
    return {
      marginTop: '6px',
      fontSize: `${cfg.header.contactSize}px`,
      color: cfg.colors.mutedText
    };
  }

  contactLineStyle(): Record<string, string | number> {
    return { marginBottom: '2px' };
  }

  dividerStyle(): Record<string, string | number> {
    const cfg = this.config();
    return {
      border: 'none',
      borderTop: `${cfg.header.dividerWeight}px solid ${cfg.header.dividerColor}`,
      margin: '8px 0'
    };
  }

  twoColumnWrapperStyle(): Record<string, string | number> {
    return {
      display: 'flex',
      gap: '12px'
    };
  }

  sidebarStyle(): Record<string, string | number> {
    const cfg = this.config();
    return {
      width: `${cfg.twoColumn.splitRatio * 100}%`,
      background: cfg.twoColumn.sidebarBackground,
      padding: `${cfg.twoColumn.sidebarPadding}px`,
      boxSizing: 'border-box'
    };
  }

  mainColumnStyle(): Record<string, string | number> {
    return {
      flex: '1',
      background: '#FFFFFF',
      padding: '0',
      boxSizing: 'border-box'
    };
  }

  singleColumnWrapperStyle(): Record<string, string | number> {
    return { display: 'block' };
  }

  leftLabelWrapperStyle(): Record<string, string | number> {
    return { display: 'flex', flexDirection: 'column' };
  }

  leftLabelRowStyle(style: SectionStyle): Record<string, string | number> {
    return { 
      display: 'flex', 
      gap: '24px', 
      marginBottom: `${style.spacingAfter}px` 
    };
  }

  leftLabelHeaderStyle(section: SectionConfig): Record<string, string | number> {
    const style = section.style;
    return {
      width: '90px',
      flexShrink: '0',
      textAlign: 'left',
      fontFamily: this.config().font.heading,
      fontSize: `${style.labelSize}px`,
      fontWeight: style.labelBold ? 700 : 400,
      color: style.labelColor || this.config().colors.accent,
      textTransform: style.labelUppercase ? 'uppercase' : 'none',
      letterSpacing: '0.05em',
      marginTop: '2px'
    };
  }

  leftLabelContentStyle(): Record<string, string | number> {
    return { flex: '1' };
  }

  sectionWrapperStyle(style: SectionStyle): Record<string, string | number> {
    const wrapper: Record<string, string | number> = {
      marginBottom: `${style.spacingAfter}px`
    };
    const borderLeft = this.readExtraStyle(style, 'borderLeft');
    if (borderLeft) {
      wrapper['borderLeft'] = borderLeft;
      wrapper['paddingLeft'] = '10px';
    }
    return wrapper;
  }

  sectionHeaderStyle(section: SectionConfig): Record<string, string | number> {
    const style = section.style;
    const labelColor = style.labelColor || this.config().colors.accent;
    const headerStyle: Record<string, string | number> = {
      fontFamily: this.config().font.heading,
      fontSize: `${style.labelSize}px`,
      fontWeight: style.labelBold ? 700 : 400,
      color: labelColor,
      textTransform: style.labelUppercase ? 'uppercase' : 'none',
      letterSpacing: '0.08em',
      marginBottom: '6px'
    };

    if (style.showUnderline) {
      headerStyle['borderBottom'] = `${style.underlineWeight || 1}px solid ${style.underlineColor || labelColor}`;
      headerStyle['paddingBottom'] = '3px';
    }

    return headerStyle;
  }

  summaryStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.bodySize || this.config().font.baseSize}px`,
      color: style.bodyColor || this.config().colors.bodyText
    };
  }

  experienceWrapperStyle(): Record<string, string | number> {
    return { display: 'block' };
  }

  experienceEntryStyle(): Record<string, string | number> {
    return { marginBottom: '8px' };
  }

  experienceTitleRowStyle(): Record<string, string | number> {
    return {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '8px'
    };
  }

  experienceTitleStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.entryTitleSize || this.config().font.baseSize}px`,
      fontWeight: style.entryTitleBold ? 700 : 400,
      color: style.entryTitleColor || this.config().colors.headingText
    };
  }

  experienceSubtitleStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.entrySubtitleSize || this.config().font.baseSize}px`,
      fontStyle: style.entrySubtitleItalic ? 'italic' : 'normal',
      color: style.entrySubtitleColor || this.config().colors.mutedText,
      marginTop: '2px'
    };
  }

  experienceDateStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.entryDateSize || this.config().font.baseSize}px`,
      color: style.entryDateColor || this.config().colors.mutedText
    };
  }

  projectDescriptionStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.bodySize || this.config().font.baseSize}px`,
      color: style.bodyColor || this.config().colors.bodyText,
      marginTop: '2px'
    };
  }

  bulletListStyle(style: SectionStyle): Record<string, string | number> {
    return {
      marginTop: '4px',
      marginLeft: `${style.bulletIndent || 14}px`,
      paddingLeft: '0'
    };
  }

  bulletStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.bulletSize || this.config().font.baseSize}px`,
      color: style.bulletColor || this.config().colors.bodyText,
      marginBottom: '2px'
    };
  }

  educationWrapperStyle(): Record<string, string | number> {
    return { display: 'block' };
  }

  educationEntryStyle(): Record<string, string | number> {
    return { marginBottom: '8px' };
  }

  educationTitleStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.entryTitleSize || this.config().font.baseSize}px`,
      fontWeight: style.entryTitleBold ? 700 : 400,
      color: style.entryTitleColor || this.config().colors.headingText
    };
  }

  educationSubtitleStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.entrySubtitleSize || this.config().font.baseSize}px`,
      fontStyle: style.entrySubtitleItalic ? 'italic' : 'normal',
      color: style.entrySubtitleColor || this.config().colors.mutedText
    };
  }

  skillsWrapperStyle(style: SectionStyle): Record<string, string | number> {
    return {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px'
    };
  }

  skillTagStyle(style: SectionStyle): Record<string, string | number> {
    return {
      background: style.tagBackground || '#EEE',
      color: style.tagTextColor || this.config().colors.accent,
      borderRadius: `${style.tagBorderRadius || 4}px`,
      fontSize: `${style.tagFontSize || 10}px`,
      padding: '3px 8px',
      margin: '2px',
      display: 'inline-block'
    };
  }

  listStyle(): Record<string, string | number> {
    return {
      margin: '0',
      paddingLeft: '16px'
    };
  }

  inlineListStyle(style: SectionStyle): Record<string, string | number> {
    return {
      fontSize: `${style.bodySize || this.config().font.baseSize}px`,
      color: style.bodyColor || this.config().colors.bodyText
    };
  }

  joinInline(items: string[]): string {
    return items.filter(Boolean).join(', ');
  }

  contactItems(): string[] {
    const personal = this.resumeData().personal;
    return [personal.email, personal.phone, personal.location, personal.linkedin, personal.website]
      .filter(value => value && value.trim().length > 0);
  }

  parseBullets(text: string | undefined): string[] {
    if (!text) return [];
    return text.split('\n').map(s => s.trim().replace(/^-/, '').trim()).filter(Boolean);
  }

  contactInline(): string {
    return this.contactItems().join(' · ');
  }

  private sortSections(sections: SectionConfig[]): SectionConfig[] {
    return [...sections].sort((a, b) => a.order - b.order);
  }

  private ensureFontsLoaded(): void {
    if (document.getElementById('resume-google-fonts')) return;
    const link = document.createElement('link');
    link.id = 'resume-google-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;600&family=Inter:wght@400;600&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600&family=JetBrains+Mono&display=swap';
    document.head.appendChild(link);
  }

  private readExtraStyle(style: SectionStyle, key: string): string | undefined {
    const record = style as unknown as Record<string, unknown>;
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
  }
}
