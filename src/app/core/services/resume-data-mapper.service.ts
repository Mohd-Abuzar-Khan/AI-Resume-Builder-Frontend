import { Injectable } from '@angular/core';
import { BackendResume, BackendSection } from './resume.service';
import { ResumeRenderData, PersonalInfo, ExperienceEntry, EducationEntry, ProjectEntry, CertificateEntry } from '../models/template-config.model';

@Injectable({ providedIn: 'root' })
export class ResumeDataMapperService {
  toRenderData(resume: BackendResume): ResumeRenderData {
    const sections = resume.sections ?? [];

    const personalSection = this.findSection(sections, ['PERSONAL', 'PERSONAL_INFO']);
    const personalParsed = this.safeJsonParse<Record<string, unknown>>(personalSection?.content);
    const personal: PersonalInfo = {
      name: this.readString(personalParsed, 'name') || resume.ownerName || '',
      email: this.readString(personalParsed, 'email'),
      phone: this.readString(personalParsed, 'phone'),
      location: this.readString(personalParsed, 'location'),
      linkedin: this.readString(personalParsed, 'linkedin'),
      website: this.readString(personalParsed, 'website'),
      subtitle: this.readString(personalParsed, 'subtitle') || this.readString(personalParsed, 'title')
    };

    const summarySection = this.findSection(sections, ['SUMMARY']);
    const summary = this.extractSummary(summarySection?.content);

    const experienceSection = this.findSection(sections, ['EXPERIENCE']);
    const experience = this.parseExperience(experienceSection?.content);

    const educationSection = this.findSection(sections, ['EDUCATION']);
    const education = this.parseEducation(educationSection?.content);

    const skillsSection = this.findSection(sections, ['SKILLS']);
    const skills = this.parseSkills(skillsSection?.content);

    const projectsSection = this.findSection(sections, ['PROJECTS']);
    const projects = this.parseProjects(projectsSection?.content);

    const achievementsSection = this.findSection(sections, ['ACHIEVEMENTS']);
    const achievements = this.parseAchievements(achievementsSection?.content);
    const certificateEntries = this.parseCertificates(achievementsSection?.content);

    const languagesSection = this.findSection(sections, ['LANGUAGES']);
    const languages = this.parseCommaList(languagesSection?.content);

    const certificationsSection = this.findSection(sections, ['CERTIFICATIONS']);
    const certifications = certificationsSection?.content || '';

    return {
      personal,
      summary,
      experience,
      education,
      projects,
      achievements,
      skills,
      languages,
      certifications,
      certificateEntries
    };
  }

  dummyData(): ResumeRenderData {
    return {
      personal: {
        name: 'Alex Johnson', email: 'alex@email.com', phone: '+1 555-000-1234',
        location: 'San Francisco, CA', linkedin: 'linkedin.com/in/alexjohnson',
        website: 'alexjohnson.dev', subtitle: 'Senior Software Engineer'
      },
      summary: 'Results-driven engineer with 7+ years building scalable distributed systems. Passionate about clean architecture and developer experience.',
      experience: [
        { company: 'Acme Corp', title: 'Senior Engineer', startDate: 'Jan 2021', endDate: 'Present',
          bullets: ['Led migration of monolith to microservices, reducing latency by 40%', 'Mentored a team of 5 junior engineers', 'Shipped CI/CD pipeline reducing deploy time from 45min to 8min'] },
        { company: 'StartupXYZ', title: 'Software Engineer', startDate: 'Jun 2018', endDate: 'Dec 2020',
          bullets: ['Built real-time analytics dashboard serving 200k daily users', 'Integrated Stripe payment flow handling $2M monthly volume'] }
      ],
      education: [
        { institution: 'UC Berkeley', degree: 'B.S. Computer Science', year: '2018', gpa: '3.8' }
      ],
      projects: [
        { name: 'Realtime Insights', role: 'Lead Developer', description: 'Built a real-time analytics suite with streaming ingestion and alerts.' },
        { name: 'Care Portal', role: 'Full Stack Engineer', description: 'Delivered a patient onboarding portal that reduced intake time by 55%.' }
      ],
      achievements: [
        'Received 2 company innovation awards for platform reliability initiatives',
        'Reduced infrastructure costs by 30% through autoscaling improvements'
      ],
      skills: ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'AWS'],
      languages: ['English (Native)', 'Spanish (Conversational)'],
      certifications: 'AWS Solutions Architect Associate · Google Cloud Professional',
      certificateEntries: []
    };
  }

  private findSection(sections: BackendSection[], types: string[]): BackendSection | undefined {
    return sections.find(section => types.includes(section.sectionType));
  }

  private extractSummary(content?: string): string {
    if (!content) return '';
    const parsed = this.safeJsonParse<Record<string, unknown>>(content);
    const summary = this.readString(parsed, 'summary');
    return summary || content;
  }

  private parseExperience(content?: string): ExperienceEntry[] {
    const parsed = this.safeJsonParse<unknown>(content);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((entry) => {
      const item = this.asRecord(entry);
      const bullets = this.normalizeBullets(item);
      return {
        company: this.readString(item, 'company'),
        title: this.readString(item, 'title') || this.readString(item, 'position'),
        startDate: this.readString(item, 'startDate'),
        endDate: this.readString(item, 'endDate'),
        bullets
      };
    });
  }

  private parseEducation(content?: string): EducationEntry[] {
    const parsed = this.safeJsonParse<unknown>(content);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((entry) => {
      const item = this.asRecord(entry);
      const year = this.readString(item, 'graduatingYear') || this.readString(item, 'year') || this.combineDates(item);
      return {
        institution: this.readString(item, 'institution') || this.readString(item, 'school'),
        degree: this.readString(item, 'degree'),
        year,
        gpa: this.readString(item, 'cgpa') || this.readString(item, 'gpa') || undefined
      };
    });
  }

  private parseSkills(content?: string): string[] {
    if (!content) return [];

    const parsed = this.safeJsonParse<unknown>(content);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean);
    }

    if (typeof parsed === 'string') {
      return this.splitCommaList(parsed);
    }

    if (parsed && typeof parsed === 'object') {
      const record = this.asRecord(parsed);
      const skillsValue = record['skills'];
      if (Array.isArray(skillsValue)) {
        return skillsValue.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean);
      }
      if (typeof skillsValue === 'string') {
        return this.splitCommaList(skillsValue);
      }
    }

    return this.splitCommaList(content);
  }

  private parseProjects(content?: string): ProjectEntry[] {
    const parsed = this.safeJsonParse<unknown>(content);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(entry => {
      const item = this.asRecord(entry);
      return {
        name: this.readString(item, 'name'),
        role: this.readString(item, 'role'),
        description: this.readString(item, 'description'),
        link: this.readString(item, 'link') || undefined
      };
    });
  }

  private parseAchievements(content?: string): string[] {
    if (!content) return [];

    const parsed = this.safeJsonParse<unknown>(content);
    let results: string[] = [];

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const record = this.asRecord(parsed);

      // Parse normal achievements
      if (Array.isArray(record['normal'])) {
        record['normal'].forEach((item: any) => {
          if (item.name && item.description) results.push(`${item.name}: ${item.description}`);
          else if (item.name) results.push(item.name);
          else if (item.description) results.push(item.description);
        });
      }

      // Fallback for old structured format
      const achievementsValue = record['achievements'];
      if (Array.isArray(achievementsValue)) {
        results.push(...achievementsValue.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean));
      } else if (typeof achievementsValue === 'string') {
        results.push(...this.splitLineList(achievementsValue));
      }

      if (results.length > 0 || 'normal' in record || 'certificates' in record || 'achievements' in record) {
        return results;
      }
    }

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean);
    }

    if (typeof parsed === 'string') {
      return this.splitLineList(parsed);
    }

    return this.splitLineList(content);
  }

  private parseCommaList(content?: string): string[] {
    if (!content) return [];
    return this.splitCommaList(content);
  }

  private splitCommaList(value: string): string[] {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  private splitLineList(value: string): string[] {
    const separator = value.includes('\n') ? '\n' : ',';
    return value.split(separator).map(item => item.trim()).filter(Boolean);
  }

  private normalizeBullets(item: Record<string, unknown>): string[] {
    const bulletsValue = item['bullets'];
    if (Array.isArray(bulletsValue)) {
      return bulletsValue.filter((entry): entry is string => typeof entry === 'string').map(entry => entry.trim()).filter(Boolean);
    }
    if (typeof bulletsValue === 'string') {
      return bulletsValue.split('\n').map(entry => entry.trim()).filter(Boolean);
    }

    const description = this.readString(item, 'description');
    if (description) {
      return description.split('\n').map(entry => entry.trim()).filter(Boolean);
    }

    return [];
  }

  private combineDates(item: Record<string, unknown>): string {
    const start = this.readString(item, 'startDate');
    const end = this.readString(item, 'endDate');
    if (start && end) return `${start} - ${end}`;
    return start || end || '';
  }

  private safeJsonParse<T>(value?: string): T | undefined {
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  private readString(record: Record<string, unknown> | undefined, key: string): string {
    if (!record) return '';
    const value = record[key];
    return typeof value === 'string' ? value : '';
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
      return value as Record<string, unknown>;
    }
    return {};
  }

  private parseCertificates(content?: string): CertificateEntry[] {
    if (!content) return [];
    const parsed = this.safeJsonParse<unknown>(content);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const record = this.asRecord(parsed);
      if (Array.isArray(record['certificates'])) {
        return record['certificates'].map((item: any) => ({
          name: this.readString(item, 'name'),
          date: this.readString(item, 'date'),
          description: this.readString(item, 'description')
        }));
      }
    }
    return [];
  }
}
