import { TemplateLayoutConfig } from './template-config.model';

export const DEFAULT_LAYOUT_CONFIG: TemplateLayoutConfig = {
  font: {
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    mono: 'JetBrains Mono',
    baseSize: 11,
    lineHeight: 1.5
  },
  colors: {
    accent: '#ea8410ff',
    headingText: '#111111',
    bodyText: '#333333',
    mutedText: '#666666',
    divider: '#CCCCCC',
    background: '#FFFFFF',
    sidebarBackground: '#F4F6FA'
  },
  page: {
    marginTop: 36,
    marginBottom: 36,
    marginLeft: 48,
    marginRight: 48,
    layout: 'single-column'
  },
  header: {
    nameSize: 28,
    nameBold: true,
    nameColor: '#111111',
    subtitleSize: 13,
    subtitleColor: '#555555',
    contactSize: 10,
    contactLayout: 'inline',
    showDivider: true,
    dividerColor: '#1F3A6E',
    dividerWeight: 2
  },
  sections: [
    {
      type: 'SUMMARY',
      label: 'Professional Summary',
      enabled: true,
      order: 1,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        labelColor: '#1F3A6E',
        showUnderline: true,
        underlineColor: '#1F3A6E',
        underlineWeight: 1.5,
        bodySize: 11,
        bodyColor: '#333333',
        spacingAfter: 14
      }
    },
    {
      type: 'EXPERIENCE',
      label: 'Experience',
      enabled: true,
      order: 2,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        labelColor: '#1F3A6E',
        showUnderline: true,
        underlineColor: '#1F3A6E',
        underlineWeight: 1.5,
        entryTitleSize: 12,
        entryTitleBold: true,
        entryTitleColor: '#111111',
        entrySubtitleSize: 11,
        entrySubtitleItalic: true,
        entrySubtitleColor: '#444444',
        entryDateSize: 10,
        entryDateColor: '#666666',
        bulletSize: 10,
        bulletColor: '#333333',
        bulletIndent: 14,
        spacingAfter: 14
      }
    },
    {
      type: 'EDUCATION',
      label: 'Education',
      enabled: true,
      order: 3,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        labelColor: '#1F3A6E',
        showUnderline: true,
        underlineColor: '#1F3A6E',
        underlineWeight: 1.5,
        entryTitleSize: 12,
        entryTitleBold: true,
        entrySubtitleItalic: true,
        spacingAfter: 14
      }
    },
    {
      type: 'SKILLS',
      label: 'Skills',
      enabled: true,
      order: 4,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        labelColor: '#1F3A6E',
        showUnderline: true,
        renderAs: 'tags',
        tagBackground: '#EEF2FA',
        tagTextColor: '#1F3A6E',
        tagBorderRadius: 4,
        tagFontSize: 10,
        spacingAfter: 14
      }
    },
    {
      type: 'LANGUAGES',
      label: 'Languages',
      enabled: true,
      order: 5,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        renderAs: 'inline',
        spacingAfter: 10,
        showUnderline: false,
        labelColor: '#1F3A6E'
      }
    },
    {
      type: 'PROJECTS',
      label: 'Projects',
      enabled: true,
      order: 6,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        labelColor: '#1F3A6E',
        showUnderline: true,
        underlineColor: '#1F3A6E',
        underlineWeight: 1.5,
        entryTitleSize: 12,
        entryTitleBold: true,
        entryTitleColor: '#111111',
        entrySubtitleSize: 11,
        entrySubtitleItalic: true,
        entrySubtitleColor: '#444444',
        bodySize: 11,
        bodyColor: '#333333',
        spacingAfter: 14
      }
    },
    {
      type: 'ACHIEVEMENTS',
      label: 'Achievements',
      enabled: true,
      order: 7,
      style: {
        labelSize: 13,
        labelBold: true,
        labelUppercase: true,
        labelColor: '#1F3A6E',
        showUnderline: true,
        underlineColor: '#1F3A6E',
        underlineWeight: 1.5,
        bulletSize: 10,
        bulletColor: '#333333',
        bulletIndent: 14,
        spacingAfter: 14
      }
    }
  ],
  twoColumn: {
    enabled: false,
    splitRatio: 0.35,
    mainSections: ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'ACHIEVEMENTS'],
    sidebarSections: ['SKILLS', 'LANGUAGES', 'CERTIFICATIONS'],
    sidebarBackground: '#F4F6FA',
    sidebarPadding: 16
  }
};
