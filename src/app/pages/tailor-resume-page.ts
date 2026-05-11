import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { AiService } from '../core/services/ai.service';
import { buildStructuredResumeText } from '../core/utils/resume-text';
import { LucideAngularModule, Sparkles, Wand2, FileText, ChevronRight, Loader2, CheckCircle2 } from 'lucide-angular';
import { CompatibilityScoreComponent } from '../components/compatibility-score.component';

export interface TailoredResumeResponse {
  matchScore?: number;
  matchExplanation?: string;
  summary?: string;
  skills?: string[];
  experience?: {
    company: string;
    title: string;
    bullets: string[];
  }[];
  changes_made?: string[];
}

@Component({
  selector: 'app-tailor-resume',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, CompatibilityScoreComponent],
  template: `
    <div class="py-10 px-8 max-w-5xl mx-auto animate-fade-up">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-[32px] font-medium tracking-tight mb-3 text-white/90">
          Tailor <em class="italic font-serif-display font-normal text-white/60">Resume</em>
        </h1>
        <p class="text-[15px] opacity-40">
          Optimize your resume for a specific job description using our advanced AI.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Input Form -->
        <div class="space-y-8">
          <div class="glass-card rounded-3xl p-8 border border-white/5">
            <h3 class="text-[16px] font-medium mb-6 text-white/90">Step 1: Selection & Input</h3>
            
            <form [formGroup]="form" class="space-y-6">
              <!-- Resume Selection -->
              <div class="space-y-1.5">
                <label class="text-[12px] font-medium opacity-40">Select Resume</label>
                @if (isLoadingResumes()) {
                  <div class="h-11 flex items-center px-4 rounded-xl border border-dashed border-white/10 animate-pulse">
                    <span class="text-[13px] opacity-20">Loading your resumes...</span>
                  </div>
                } @else {
                  <select formControlName="resumeId" class="glass-input w-full bg-[#110800] py-2.5 text-white">
                    <option value="" disabled>Choose a resume</option>
                    @for (resume of resumes(); track resume.resumeId) {
                      <option [value]="resume.resumeId">{{ resume.title }}</option>
                    }
                  </select>
                }
              </div>

              <!-- Job Description -->
              <div class="space-y-1.5">
                <label class="text-[12px] font-medium opacity-40">Job Description</label>
                <textarea formControlName="jobDescription" rows="10" 
                          class="glass-input w-full py-3 resize-none custom-scrollbar" 
                          placeholder="Paste the target job description here..."></textarea>
              </div>

              <button (click)="generateTailoredSuggestions()" 
                      [disabled]="form.invalid || isTailoring()"
                      class="btn-primary w-full h-12 flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                @if (isTailoring()) {
                  <lucide-icon [name]="LoaderIcon" class="h-4 w-4 animate-spin"></lucide-icon>
                  AI Tailoring in progress...
                } @else {
                  <lucide-icon [name]="SparklesIcon" class="h-4 w-4"></lucide-icon>
                  Analyze & Tailor
                }
              </button>
            </form>
          </div>
        </div>

        <!-- AI Output Area -->
        <div class="space-y-8">
          @if (!tailoredOutput() && !parsedOutput()) {
            <div class="glass-card rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border border-white/5">
              <div class="h-20 w-20 rounded-full flex items-center justify-center mb-6 bg-white/5">
                <lucide-icon [name]="WandIcon" class="h-10 w-10 text-white/20"></lucide-icon>
              </div>
              <h3 class="text-[18px] font-medium mb-3 text-white/90">Your tailored suggestions will appear here</h3>
              <p class="text-[14px] max-w-xs mx-auto leading-relaxed opacity-40">
                Our AI will identify key skills, required experience, and suggest specific modifications to match the job post perfectly.
              </p>
            </div>
          } @else {
            <div class="space-y-6 animate-fade-up h-full">
              <div class="glass-card rounded-3xl p-8 border flex flex-col h-full max-h-[700px] border-white/5">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-[16px] font-medium text-white/90">Tailoring Results</h3>
                  <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <lucide-icon [name]="CheckIcon" class="h-3 w-3"></lucide-icon> AI Optimized
                  </div>
                </div>

                <div class="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                  @if (isParsedOutput() && parsedOutput()) {
                    <div class="space-y-8">
                      @if (parsedOutput()?.matchScore !== undefined && parsedOutput()?.matchScore !== null) {
                        <div class="flex flex-col items-center p-8 rounded-2xl border border-white/5 bg-white/5">
                          <app-compatibility-score [score]="parsedOutput()?.matchScore || 0"></app-compatibility-score>
                          <p class="text-[13px] mt-6 text-center leading-relaxed opacity-60">{{ parsedOutput()?.matchExplanation }}</p>
                        </div>
                      }

                      <!-- Summary -->
                      @if (parsedOutput()?.summary) {
                        <div>
                          <h4 class="text-[14px] font-semibold mb-2 text-white/90">Professional Summary</h4>
                          <p class="text-[14px] leading-relaxed text-white/70">{{ parsedOutput()?.summary }}</p>
                        </div>
                      }

                      <!-- Skills -->
                      @if (parsedOutput()?.skills?.length) {
                        <div>
                          <h4 class="text-[14px] font-semibold mb-3 text-white/90">Optimized Skills</h4>
                          <div class="flex flex-wrap gap-2">
                            @for (skill of parsedOutput()?.skills; track skill) {
                              <span class="px-3 py-1.5 rounded-full text-[12px] font-medium border border-white/10 bg-white/5 text-white/80">{{ skill }}</span>
                            }
                          </div>
                        </div>
                      }

                      <!-- Experience -->
                      @if (parsedOutput()?.experience?.length) {
                        <div>
                          <h4 class="text-[14px] font-semibold mb-3 text-white/90">Tailored Experience</h4>
                          <div class="space-y-4">
                            @for (exp of parsedOutput()?.experience; track exp.company) {
                              <div class="p-5 rounded-xl border border-white/5 bg-white/5">
                                <div class="font-medium text-[14px] text-white/90">{{ exp.title }}</div>
                                <div class="text-[13px] mb-3 opacity-40">{{ exp.company }}</div>
                                <ul class="list-disc pl-4 space-y-2">
                                  @for (bullet of exp.bullets; track bullet) {
                                    <li class="text-[13px] leading-relaxed text-white/70">{{ bullet }}</li>
                                  }
                                </ul>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <!-- Changes Made -->
                      @if (parsedOutput()?.changes_made?.length) {
                        <div class="p-5 rounded-xl border border-emerald-500/20 mt-6 bg-emerald-500/5">
                          <h4 class="text-[14px] font-semibold mb-4 flex items-center gap-2 text-emerald-400">
                            <lucide-icon [name]="SparklesIcon" class="w-4 h-4"></lucide-icon> AI Adjustments
                          </h4>
                          <ul class="space-y-3">
                            @for (change of parsedOutput()?.changes_made; track change) {
                              <li class="text-[13px] leading-relaxed flex items-start gap-2.5 text-emerald-400/80">
                                <div class="mt-0.5 rounded-full bg-emerald-500/10 p-0.5">
                                  <lucide-icon [name]="CheckIcon" class="w-3 h-3 shrink-0 text-emerald-400"></lucide-icon>
                                </div>
                                <span>{{ change }}</span>
                              </li>
                            }
                          </ul>
                        </div>
                      }
                    </div>
                  } @else {
                    <!-- Fallback for Raw Text -->
                    <div class="prose prose-sm max-w-none prose-invert">
                      <p class="text-[14px] leading-relaxed whitespace-pre-wrap text-white/70">{{ tailoredOutput() }}</p>
                    </div>
                  }
                </div>

                <!-- Footer Action -->
                <div class="pt-6 mt-6 border-t flex items-center justify-between border-white/5">
                  <button (click)="reset()" class="text-[13px] font-medium flex items-center gap-2 hover:opacity-70 transition-opacity opacity-40">
                    Clear results and try another
                  </button>
                  <button (click)="applyChanges()" [disabled]="isApplying()" class="btn-primary flex items-center gap-2 px-5 py-2.5 text-[13px] disabled:opacity-50">
                    @if (isApplying()) {
                      <lucide-icon [name]="LoaderIcon" class="h-4 w-4 animate-spin"></lucide-icon>
                      Applying...
                    } @else {
                      <lucide-icon [name]="SparklesIcon" class="h-4 w-4"></lucide-icon>
                      Apply Changes & Edit
                    }
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
  `]
})
export class TailorResumePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private router = inject(Router);

  resumes = signal<BackendResume[]>([]);
  isLoadingResumes = signal(true);
  isTailoring = signal(false);
  isApplying = signal(false);
  tailoredOutput = signal<string | null>(null);
  parsedOutput = signal<TailoredResumeResponse | null>(null);
  isParsedOutput = signal<boolean>(false);

  form = this.fb.nonNullable.group({
    resumeId: ['', Validators.required],
    jobDescription: ['', [Validators.required, Validators.minLength(50)]]
  });

  readonly SparklesIcon = Sparkles;
  readonly WandIcon = Wand2;
  readonly FileIcon = FileText;
  readonly LoaderIcon = Loader2;
  readonly CheckIcon = CheckCircle2;

  ngOnInit() {
    this.resumeService.getUserResumes().subscribe({
      next: (data) => {
        this.resumes.set(data);
        this.isLoadingResumes.set(false);
      },
      error: () => this.isLoadingResumes.set(false)
    });

    // Check for JD passed via navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = window.history.state;
    if (state && state.jobDescription) {
      this.form.patchValue({ jobDescription: state.jobDescription });
    }
  }

  generateTailoredSuggestions() {
    if (this.form.invalid) return;

    this.isTailoring.set(true);
    this.tailoredOutput.set(null);
    this.parsedOutput.set(null);
    this.isParsedOutput.set(false);

    const { resumeId, jobDescription } = this.form.getRawValue();

    this.resumeService.getResumeById(Number(resumeId)).subscribe({
      next: (resumeData) => {
        const resumeContent = buildStructuredResumeText(resumeData);

        this.aiService.tailorResume(Number(resumeId), resumeContent, jobDescription).subscribe({
          next: (response: string) => {
            try {
              const parsed = this.parseTailorResponse(response);
              if (parsed && (parsed.summary || parsed.skills || parsed.experience)) {

                this.parsedOutput.set(parsed);
                this.isParsedOutput.set(true);
              } else {
                this.tailoredOutput.set(parsed ? JSON.stringify(parsed, null, 2) : response);
              }
            } catch {
              this.tailoredOutput.set(response);
            }
            this.isTailoring.set(false);
          },
          error: (err: any) => {
            this.tailoredOutput.set("Failed to tailor resume: " + (err.message || 'Unknown error'));
            this.isTailoring.set(false);
          }

        });
      },
      error: () => {
        this.tailoredOutput.set("Failed to load resume details.");
        this.isTailoring.set(false);
      }
    });
  }

  applyChanges() {
    const parsed = this.parsedOutput();
    const resumeIdStr = this.form.get('resumeId')?.value;
    if (!parsed || !resumeIdStr) return;

    this.isApplying.set(true);
    const resumeId = Number(resumeIdStr);

    this.resumeService.getResumeById(resumeId).subscribe({
      next: (resume) => {
        const updateRequests = [];
        const sections = resume.sections || [];

        // 1. Update Summary
        if (parsed.summary) {
          const summarySec = sections.find(s => s.sectionType === 'SUMMARY');
          if (summarySec) {
            updateRequests.push(this.resumeService.updateSection(summarySec.sectionId, {
              sectionType: 'SUMMARY',
              title: 'Summary',
              content: JSON.stringify({ summary: parsed.summary })
            }).toPromise());
          } else {
            updateRequests.push(this.resumeService.addSection(resumeId, {
              sectionType: 'SUMMARY',
              title: 'Summary',
              content: JSON.stringify({ summary: parsed.summary })
            }).toPromise());
          }
        }

        // 2. Update Skills
        if (parsed.skills && parsed.skills.length > 0) {
          const skillsSec = sections.find(s => s.sectionType === 'SKILLS');
          const skillsString = parsed.skills.join(', ');
          if (skillsSec) {
            updateRequests.push(this.resumeService.updateSection(skillsSec.sectionId, {
              sectionType: 'SKILLS',
              title: 'Skills',
              content: JSON.stringify({ skills: skillsString })
            }).toPromise());
          } else {
            updateRequests.push(this.resumeService.addSection(resumeId, {
              sectionType: 'SKILLS',
              title: 'Skills',
              content: JSON.stringify({ skills: skillsString })
            }).toPromise());
          }
        }

        // 3. Update Experience
        if (parsed.experience && parsed.experience.length > 0) {
          const expSec = sections.find(s => s.sectionType === 'EXPERIENCE');
          if (expSec) {
            let originalExp: any[] = [];
            try {
              originalExp = JSON.parse(expSec.content);
              if (!Array.isArray(originalExp)) originalExp = [];
            } catch (e) { }

            const tailoredExp = Array.isArray(parsed.experience) ? parsed.experience : [];
            const updatedExp = originalExp.map((item, index) => {
              const tailored = tailoredExp[index];
              if (!tailored) return item;
              return {
                ...item,
                position: tailored.title || item.position,
                description: Array.isArray(tailored.bullets)
                  ? tailored.bullets.join('\n')
                  : item.description
              };
            });

            updateRequests.push(this.resumeService.updateSection(expSec.sectionId, {
              sectionType: 'EXPERIENCE',
              title: 'Experience',
              content: JSON.stringify(updatedExp)
            }).toPromise());
          }
        }

        Promise.all(updateRequests).then(() => {
          this.isApplying.set(false);
          this.router.navigate(['/builder', resumeId]);
        }).catch(err => {
          console.error("Failed to apply changes", err);
          this.isApplying.set(false);
          alert("Failed to save some changes. Proceeding to builder anyway.");
          this.router.navigate(['/builder', resumeId]);
        });
      },
      error: () => {
        this.isApplying.set(false);
        alert("Could not load original resume to apply changes.");
      }
    });
  }

  reset() {
    this.tailoredOutput.set(null);
    this.parsedOutput.set(null);
    this.isParsedOutput.set(false);
    this.form.get('jobDescription')?.reset();
  }

  private parseTailorResponse(response: string): TailoredResumeResponse | null {
    if (!response) return null;
    const cleaned = this.stripFenceAndTrim(response);
    const parsed = this.tryParseJson(cleaned);
    if (parsed) return parsed;
    return this.extractTailorFields(cleaned);
  }

  private stripFenceAndTrim(response: string): string {
    let cleanResponse = response.trim();
    const fencedMatch = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      cleanResponse = fencedMatch[1];
    }
    return cleanResponse.trim();
  }

  private tryParseJson(text: string): TailoredResumeResponse | null {
    let cleanResponse = text.trim();
    const firstBrace = cleanResponse.indexOf('{');
    const lastBrace = cleanResponse.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanResponse = cleanResponse.slice(firstBrace, lastBrace + 1);
    }
    cleanResponse = this.stripTrailingCommas(cleanResponse);
    try {
      return JSON.parse(cleanResponse) as TailoredResumeResponse;
    } catch {
      return null;
    }
  }

  private extractTailorFields(text: string): TailoredResumeResponse | null {
    const result: TailoredResumeResponse = {};

    const scoreMatch = text.match(/"matchScore"\s*:\s*(\d+)/i);
    if (scoreMatch) {
      result.matchScore = Number(scoreMatch[1]);
    }

    const matchExplanation = this.extractStringField(text, 'matchExplanation');
    if (matchExplanation) {
      result.matchExplanation = matchExplanation;
    }

    const summary = this.extractStringField(text, 'summary');
    if (summary) {
      result.summary = summary;
    }

    const skills = this.extractStringArray(text, 'skills');
    if (skills.length) {
      result.skills = skills;
    }

    const changes = this.extractStringArray(text, 'changes_made');
    if (changes.length) {
      result.changes_made = changes;
    }

    return Object.keys(result).length ? result : null;
  }

  private extractStringField(text: string, field: string): string | null {
    const strict = new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"\\s*(,|})`, 'i');
    const strictMatch = text.match(strict);
    if (strictMatch?.[1]) {
      return this.normalizeExtractedValue(strictMatch[1]);
    }

    const fieldIndex = text.toLowerCase().indexOf(`"${field.toLowerCase()}"`);
    if (fieldIndex === -1) return null;

    const afterField = text.slice(fieldIndex);
    const firstQuoteIndex = afterField.indexOf('"', afterField.indexOf(':'));
    if (firstQuoteIndex === -1) return null;

    let value = afterField.slice(firstQuoteIndex + 1);
    const nextFieldIndex = value.search(/"\s*,\s*"(matchScore|matchExplanation|summary|skills|experience|changes_made)"\s*:/i);
    if (nextFieldIndex !== -1) {
      value = value.slice(0, nextFieldIndex);
    }

    return this.normalizeExtractedValue(value);
  }

  private extractStringArray(text: string, field: string): string[] {
    const lowerText = text.toLowerCase();
    const fieldIndex = lowerText.indexOf(`"${field.toLowerCase()}"`);
    if (fieldIndex === -1) return [];

    const bracketIndex = lowerText.indexOf('[', fieldIndex);
    if (bracketIndex === -1) return [];

    let endIndex = lowerText.indexOf(']', bracketIndex);
    if (endIndex === -1) {
      endIndex = text.length;
    }

    const body = text.slice(bracketIndex + 1, endIndex);
    const items: string[] = [];
    const regex = /"([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(body)) !== null) {
      const value = this.normalizeExtractedValue(match[1]);
      if (value) {
        items.push(value);
      }
    }
    return items;
  }

  private normalizeExtractedValue(value: string): string {
    return value
      .replace(/\\n/g, '\n')
      .replace(/\s+/g, ' ')
      .replace(/\"/g, '"')
      .trim();
  }

  private stripTrailingCommas(text: string): string {
    if (!text) return text;
    let inString = false;
    let escaping = false;
    const builder: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        builder.push(c);
        if (escaping) {
          escaping = false;
        } else if (c === '\\') {
          escaping = true;
        } else if (c === '"') {
          inString = false;
        }
        continue;
      }

      if (c === '"') {
        inString = true;
        builder.push(c);
        continue;
      }

      if (c === ',') {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) {
          j++;
        }
        if (j < text.length && (text[j] === '}' || text[j] === ']')) {
          continue;
        }
      }

      builder.push(c);
    }

    return builder.join('');
  }
}
