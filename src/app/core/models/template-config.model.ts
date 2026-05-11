export interface FontConfig { heading: string; body: string; mono: string; baseSize: number; lineHeight: number; }
export interface ColorConfig { accent: string; headingText: string; bodyText: string; mutedText: string; divider: string; background: string; sidebarBackground: string; }
export interface PageConfig { marginTop: number; marginBottom: number; marginLeft: number; marginRight: number; layout: 'single-column' | 'two-column' | 'left-label'; }
export interface HeaderConfig { nameSize: number; nameBold: boolean; nameColor: string; subtitleSize: number; subtitleColor: string; contactSize: number; contactLayout: 'inline' | 'stacked'; showDivider: boolean; dividerColor: string; dividerWeight: number; }
export interface SectionStyle { labelSize: number; labelBold: boolean; labelUppercase: boolean; labelColor: string; showUnderline: boolean; underlineColor?: string; underlineWeight?: number; bodySize?: number; bodyColor?: string; spacingAfter: number; entryTitleSize?: number; entryTitleBold?: boolean; entryTitleColor?: string; entrySubtitleSize?: number; entrySubtitleItalic?: boolean; entrySubtitleColor?: string; entryDateSize?: number; entryDateColor?: string; bulletSize?: number; bulletColor?: string; bulletIndent?: number; renderAs?: 'tags' | 'inline' | 'list'; tagBackground?: string; tagTextColor?: string; tagBorderRadius?: number; tagFontSize?: number; }
export interface SectionConfig { type: string; label: string; enabled: boolean; order: number; style: SectionStyle; }
export interface TwoColumnConfig { enabled: boolean; splitRatio: number; mainSections: string[]; sidebarSections: string[]; sidebarBackground: string; sidebarPadding: number; }
export interface TemplateLayoutConfig { font: FontConfig; colors: ColorConfig; page: PageConfig; header: HeaderConfig; sections: SectionConfig[]; twoColumn: TwoColumnConfig; }

export interface PersonalInfo {
  name: string; email: string; phone: string;
  location: string; linkedin: string; website: string; subtitle: string;
}
export interface ExperienceEntry {
  company: string; title: string; startDate: string; endDate: string; bullets: string[];
}
export interface EducationEntry {
  institution: string; degree: string; year: string; gpa?: string;
}
export interface ProjectEntry {
  name: string; role: string; description: string; link?: string;
}
export interface CertificateEntry {
  name: string; date: string; description: string;
}
export interface ResumeRenderData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  achievements: string[];
  skills: string[];
  languages: string[];
  certifications: string;
  certificateEntries?: CertificateEntry[];
}
