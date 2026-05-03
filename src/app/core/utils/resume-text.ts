import { BackendSection } from '../services/resume.service';

export type ResumeTextSource = {
  title?: string;
  targetJobTitle?: string;
  sections?: BackendSection[];
};

export function buildStructuredResumeText(source: ResumeTextSource): string {
  if (!source) return '';

  const lines: string[] = [];
  if (source.title) {
    lines.push(`Title: ${source.title}`);
  }
  if (source.targetJobTitle) {
    lines.push(`Target Role: ${source.targetJobTitle}`);
  }

  const sections = source.sections ?? [];
  for (const section of sections) {
    const sectionType = section.sectionType || 'SECTION';
    const sectionTitle = section.title ? `: ${section.title}` : '';
    lines.push('');
    lines.push(`## ${sectionType}${sectionTitle}`);
    const content = formatSectionContent(section.content);
    if (content) {
      lines.push(content);
    }
  }

  return lines.join('\n').trim();
}

function formatSectionContent(content: string | undefined): string {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === 'string') {
      return parsed;
    }
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}
