import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { AiService } from '../core/services/ai.service';
import { buildStructuredResumeText } from '../core/utils/resume-text';
import { LucideAngularModule, Mail, Wand2, FileText, Download, Loader2 } from 'lucide-angular';


import jsPDF from 'jspdf';

@Component({
  selector: 'app-cover-letter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  template: `
    <div class="py-10 px-8 max-w-5xl mx-auto animate-fade-up">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-[32px] font-medium tracking-tight mb-3 text-white/90">
          Cover <em class="italic font-serif-display font-normal text-white/60">Letter</em>
        </h1>
        <p class="text-[15px] opacity-40">
          Generate a professional, tailored cover letter based on your resume and target job description.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Resume Selection List -->
        <div class="lg:col-span-1 space-y-4">
          <p class="text-[11px] uppercase tracking-widest font-medium px-1 opacity-30">Select Resume</p>
          
          @if (isLoadingResumes()) {
            <div class="flex items-center gap-2 py-4 px-2">
              <lucide-icon [name]="LoaderIcon" class="h-4 w-4 animate-spin opacity-20"></lucide-icon>
              <span class="text-[13px] opacity-20">Loading...</span>
            </div>
          } @else {
            <div class="flex flex-col gap-2">
              @for (resume of resumes(); track resume.resumeId) {
                <button (click)="selectedResume.set(resume)"
                        class="w-full text-left p-4 rounded-2xl transition-all cursor-pointer border border-white/5"
                        [style.background]="selectedResume()?.resumeId === resume.resumeId ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'">
                  <p class="text-[14px] font-medium truncate" [style.color]="selectedResume()?.resumeId === resume.resumeId ? 'white' : 'rgba(255,255,255,0.7)'">
                    {{ resume.title }}
                  </p>
                  <p class="text-[12px] mt-1 opacity-40">
                    {{ resume.targetJobTitle || 'General' }}
                  </p>
                </button>
              }
            </div>
          }
        </div>

        <!-- Input & Results Area -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-3xl p-6 border border-white/10" [formGroup]="form">
            <h3 class="text-[14px] font-medium mb-3 text-white/90">Job Description</h3>
            <textarea formControlName="jobDescription" rows="8"
                      class="glass-input w-full py-3 resize-none custom-scrollbar"
                      placeholder="Paste the job description here..."></textarea>
            <div class="flex items-center justify-between mt-3">
              <span class="text-[11px] opacity-30">Tip: Paste the full job requirements for better results.</span>
              <button (click)="generateLetter()"
                      [disabled]="form.invalid || !selectedResume() || isGenerating()"
                      class="btn-primary px-6 py-2 text-[12px] disabled:opacity-50 flex items-center gap-2">
                @if (isGenerating()) {
                  <lucide-icon [name]="LoaderIcon" class="h-3 w-3 animate-spin"></lucide-icon>
                  Generating...
                } @else {
                  <lucide-icon [name]="WandIcon" class="h-3 w-3"></lucide-icon>
                  Generate Letter
                }
              </button>
            </div>
          </div>

          @if (!coverLetterText() && !isGenerating()) {
            <div class="glass-card rounded-3xl h-[400px] flex flex-col items-center justify-center text-center p-10 border border-white/5">
              <div class="h-16 w-16 rounded-full flex items-center justify-center mb-6 bg-white/5">
                <lucide-icon [name]="MailIcon" class="h-8 w-8 text-white/20"></lucide-icon>
              </div>
              <h3 class="text-[18px] font-medium mb-2 text-white/90">Your letter will appear here</h3>
              <p class="text-[14px] max-w-xs mx-auto opacity-40">
                Choose a resume and paste a job description to get started.
              </p>
            </div>
          } @else if (isGenerating()) {
            <div class="glass-card rounded-3xl h-[400px] flex flex-col items-center justify-center text-center p-10 border border-white/5">
              <div class="h-12 w-12 rounded-full animate-spin mb-6 border-2 border-white/5 border-t-white"></div>
              <h3 class="text-[16px] font-medium text-white/90">Writing your cover letter...</h3>
              <p class="text-[13px] mt-2 opacity-40">Tailoring your experience to match the role.</p>
            </div>
          } @else if (coverLetterText()) {
            <div class="space-y-6 animate-fade-up">
              <div class="glass-card rounded-3xl p-8 border border-white/5 relative">
                <div class="flex items-center justify-between mb-6">
                  <h4 class="text-[12px] uppercase tracking-widest font-medium opacity-40">Draft Preview</h4>
                  <button (click)="downloadPdf()" 
                          class="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-white/80 transition-all">
                    <lucide-icon [name]="DownloadIcon" class="h-3 w-3"></lucide-icon>
                    Download PDF
                  </button>
                </div>
                
                <div class="prose prose-sm prose-invert max-w-none">
                  <textarea [ngModel]="coverLetterText()" 
                            (ngModelChange)="coverLetterText.set($event)"
                            rows="25"
                            class="w-full bg-transparent border-none focus:ring-0 text-[14px] leading-relaxed font-serif text-white/80 resize-none custom-scrollbar outline-none"
                            placeholder="Edit your cover letter here..."></textarea>
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
export class CoverLetterPageComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private fb = inject(FormBuilder);



  resumes = signal<BackendResume[]>([]);
  selectedResume = signal<BackendResume | null>(null);
  coverLetterText = signal<string | null>(null);
  isLoadingResumes = signal(true);
  isGenerating = signal(false);

  form = this.fb.nonNullable.group({
    jobDescription: ['', [Validators.required, Validators.minLength(50)]]
  });

  readonly MailIcon = Mail;
  readonly WandIcon = Wand2;
  readonly DownloadIcon = Download;
  readonly LoaderIcon = Loader2;

  ngOnInit() {
    this.resumeService.getUserResumes().subscribe({
      next: (data) => {
        this.resumes.set(data);
        this.isLoadingResumes.set(false);
      },
      error: () => this.isLoadingResumes.set(false)
    });

    // Handle state passed from other pages (e.g. Job Match)
    const state = window.history.state;
    if (state && state.jobDescription) {
      this.form.patchValue({ jobDescription: state.jobDescription });
    }
  }

  generateLetter() {
    const resumeId = this.selectedResume()?.resumeId;
    if (!resumeId) return;
    if (this.form.invalid) return;

    this.isGenerating.set(true);
    this.coverLetterText.set(null);

    const jobDesc = this.form.controls.jobDescription.value;

    // Fetch full resume details first
    this.resumeService.getResumeById(resumeId).subscribe({
      next: (resume) => {
        const resumeContent = buildStructuredResumeText(resume);
        console.log('Sending resume content for cover letter:', resumeContent);
        console.log('Sending job description for cover letter:', jobDesc);

        this.aiService.generateCoverLetter(resumeId, resumeContent, jobDesc).subscribe({
          next: (text) => {
            this.coverLetterText.set(text);
            this.isGenerating.set(false);
          },
          error: (err) => {
            console.error('Cover letter generation failed:', err);
            this.isGenerating.set(false);
          }
        });
      },
      error: () => this.isGenerating.set(false)
    });
  }



  downloadPdf() {
    const text = this.coverLetterText();
    if (!text) return;

    const doc = new jsPDF();
    const resume = this.selectedResume();
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // --- 1. HEADER (Styled) ---
    // Background accent bar at the top
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Candidate Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    const name = resume?.title?.split(' - ')[0] || 'Candidate Name';
    doc.text(name.toUpperCase(), 20, 25);
    
    // Contact Info Bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const contactInfo = `${resume?.targetJobTitle || 'Professional'}  |  Generated on ${new Date().toLocaleDateString()}`;
    doc.text(contactInfo, 20, 33);

    // --- 2. BODY CONTENT ---
    let cursorY = 60;
    
    // Target Info (Date & Salutation)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), 20, cursorY);
    cursorY += 15;
    
    // The Letter Body
    doc.setFont('times', 'normal'); // Serif font for better readability in letters
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    
    const splitText = doc.splitTextToSize(text, 170);
    
    // Handle multi-page if necessary
    const pageHeight = doc.internal.pageSize.getHeight();
    splitText.forEach((line: string) => {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, 20, cursorY);
      cursorY += 6; // Line height
    });
    
    // Footer / Accent
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 15, 60, pageHeight - 15);
    
    doc.save(`Cover_Letter_${resume?.title || 'Draft'}.pdf`);
  }
}
