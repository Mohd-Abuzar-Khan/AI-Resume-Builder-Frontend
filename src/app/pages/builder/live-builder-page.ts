import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService, BackendResume, BackendSection, SectionRequest, SectionOrderRequest } from '../../core/services/resume.service';
import { AiService, AtsReport } from '../../core/services/ai.service';
import { UsageLimitsService } from '../../core/services/usage-limits.service';
import { ExportService, ExportJob } from '../../core/services/export.service';
import { TemplateService, BackendTemplate } from '../../core/services/template.service';
import { ResumeDataMapperService } from '../../core/services/resume-data-mapper.service';
import { TemplateLayoutConfig, ResumeRenderData } from '../../core/models/template-config.model';
import { DEFAULT_LAYOUT_CONFIG } from '../../core/models/default-template-config';
import { buildStructuredResumeText } from '../../core/utils/resume-text';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormArray } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Save, Plus, GripVertical, Trash2, Edit3, Type, Sparkles, Wand2, Target, Zap, AlertCircle, Download, FileJson, FileText, Loader2, ChevronDown, ChevronRight, Briefcase, GraduationCap, Award, User, MessageSquare, Globe, CheckCircle } from 'lucide-angular';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { interval, switchMap, takeWhile, of } from 'rxjs';
import { ResumeRendererComponent } from '../../components/resume-renderer/resume-renderer.component';

@Component({
    selector: 'app-live-builder',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DragDropModule, ResumeRendererComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="min-h-screen flex flex-col font-sans text-white/90 page-shell-bg">
      <!-- Navbar -->
      <header class="h-16 glass-nav border-b flex items-center justify-between px-6 shrink-0 z-20 border-white/10">
          <div class="flex items-center gap-4">
              <button (click)="goBack()" class="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-white/40">
                  <lucide-icon [name]="ChevronLeftIcon" class="h-5 w-5"></lucide-icon>
              </button>
              <div class="flex flex-col group relative">
                  @if (isEditingTitle()) {
                    <div class="flex items-center gap-2 animate-fade-in">
                      <input #titleInputField
                             [value]="titleInput()"
                             (input)="titleInput.set($any($event.target).value)"
                             (blur)="saveTitle()"
                             (keyup.enter)="saveTitle()"
                             (keyup.escape)="isEditingTitle.set(false)"
                             class="bg-white/10 border border-teal-500/30 rounded-lg px-3 py-1 text-[15px] text-white outline-none focus:bg-white/15 transition-all w-64"
                             autofocus>
                      <button (click)="saveTitle()" class="p-1.5 rounded-md hover:bg-teal-500/20 text-teal-400 transition-colors">
                        <lucide-icon [name]="CheckCircleIcon" class="h-4 w-4"></lucide-icon>
                      </button>
                    </div>
                  } @else {
                    <div class="flex items-center gap-2 cursor-pointer group/title" (click)="startEditingTitle()">
                      <h1 class="font-medium leading-none text-[15px] text-white/90 group-hover/title:text-white transition-colors">{{ resume()?.title || 'Loading...' }}</h1>
                      <lucide-icon [name]="EditIcon" class="h-3 w-3 text-white/20 group-hover/title:text-teal-400 transition-all"></lucide-icon>
                    </div>
                    <span class="text-[11px] mt-1 uppercase tracking-wider text-white/40">{{ resume()?.targetJobTitle || 'General Resume' }}</span>
                  }
              </div>
          </div>
          <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 mr-2">
                  <lucide-icon [name]="ZapIcon" class="h-3.5 w-3.5 text-teal-400"></lucide-icon>
                  <span class="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-400">
                    {{ usageSummary().isFreeUser ? (usageSummary().aiCallsRemaining === Unlimited ? '∞ AI Calls' : usageSummary().aiCallsRemaining + ' AI Calls Left') : 'Unlimited AI Calls' }}
                  </span>
              </div>
              <button (click)="openAtsCheck()" class="btn-secondary h-9 px-4 flex items-center gap-2">
                  <lucide-icon [name]="TargetIcon" class="h-4 w-4"></lucide-icon>
                  ATS Check
              </button>
              
               <div class="flex items-center gap-1">
                 <button (click)="downloadPdf()" [disabled]="isExportingPdf()" class="btn-primary h-9 px-5 flex items-center gap-2 rounded-r-none border-r border-black/10">
                     <lucide-icon [name]="isExportingPdf() ? Loader2Icon : DownloadIcon" [class.animate-spin]="isExportingPdf()" class="h-4 w-4"></lucide-icon>
                     {{ isExportingPdf() ? 'Exporting...' : 'Export' }}
                 </button>
                 
                 <div class="relative group">
                    <button class="btn-primary h-9 px-2 flex items-center justify-center rounded-l-none">
                        <lucide-icon [name]="ChevronDownIcon" class="h-4 w-4"></lucide-icon>
                    </button>
                    <div class="absolute right-0 top-full mt-2 w-48 py-2 glass-modal rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                        <button (click)="triggerExport('DOCX')" class="w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 flex items-center gap-3 text-white/90">
                            <lucide-icon [name]="FileTextIcon" class="h-4 w-4 opacity-50"></lucide-icon> Word (DOCX)
                        </button>
                        <button (click)="triggerExport('JSON')" class="w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 flex items-center gap-3 text-white/90">
                            <lucide-icon [name]="FileJsonIcon" class="h-4 w-4 opacity-50"></lucide-icon> Raw JSON
                        </button>
                        <div class="h-[1px] bg-white/10 my-1 mx-2"></div>
                        <button (click)="exportBasicPdf()" class="w-full px-4 py-2 text-left text-[11px] hover:bg-white/5 text-white/40">
                            Legacy PDF (Fast)
                        </button>
                    </div>
                 </div>
               </div>
          </div>
      </header>

      <!-- Main Workspace -->
      <div class="flex-1 flex overflow-hidden">
          
          <!-- Left Column: Wizard Editor -->
          <aside class="w-[480px] shrink-0 border-r flex flex-col relative z-10 glass-card border-white/10">
              <!-- Step Indicator -->
              <div class="px-8 pt-8 pb-4 border-b border-white/5">
                  <div class="flex items-center justify-between mb-6">
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-teal-500/20">
                            {{ currentStepIndex() + 1 }}
                        </div>
                        <h2 class="text-[17px] font-semibold text-white/90">Step {{ currentStepIndex() + 1 }} of {{ steps.length }}</h2>
                      </div>
                      <span class="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 text-white/40 uppercase tracking-wider">{{ currentStep.label }}</span>
                  </div>
                  
                  <div class="flex gap-1.5 h-1.5 mb-2">
                      @for (step of steps; track $index) {
                          <div class="flex-1 rounded-full transition-all duration-500" 
                               [class.bg-teal-500]="$index <= currentStepIndex()" 
                               [class.bg-white/5]="$index > currentStepIndex()"></div>
                      }
                  </div>
              </div>
              <!-- Step Content -->
              <div class="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/10 relative">
                
                <!-- AI Global Loader moved to root for full-screen overlay -->
                
                @if (loading()) {
                    <div class="text-center py-20">
                        <lucide-icon [name]="Loader2Icon" class="h-8 w-8 animate-spin mx-auto mb-4 text-white/20"></lucide-icon>
                        <p class="text-[13px] text-white/20">Loading builder...</p>
                    </div>
                } @else if (isReviewMode()) {
                  <!-- Review State UI -->
                  <div class="animate-fade-up space-y-8 py-4 text-white/90">
                      <div class="text-center space-y-3">
                          <div class="h-16 w-16 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto shadow-sm border border-teal-500/20">
                              <lucide-icon [name]="CheckCircleIcon" class="h-8 w-8"></lucide-icon>
                          </div>
                          <h3 class="text-[20px] font-bold text-white/90">Ready for the World!</h3>
                          <p class="text-[13px] text-white/40 leading-relaxed px-4">Your resume is polished and ready. Choose your next step below to advance your career.</p>
                      </div>                      <div class="grid gap-4">
                          <button (click)="publishResume()" 
                                  [disabled]="isPublishing()"
                                  class="w-full flex items-center justify-between p-5 rounded-2xl glass border border-white/5 hover:border-teal-500/30 hover:bg-white/5 transition-all group">
                              <div class="flex items-center gap-4">
                                  <div class="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <lucide-icon [name]="GlobeIcon" class="h-5 w-5"></lucide-icon>
                                  </div>
                                  <div class="text-left">
                                      <div class="text-[14px] font-bold text-white/90">Publish to Community</div>
                                      <div class="text-[11px] text-white/30">Feature your resume for others to see</div>
                                  </div>
                              </div>
                              <lucide-icon [name]="ChevronRightIcon" class="h-4 w-4 text-white/20"></lucide-icon>
                          </button>
 
                          <button (click)="applyForJobs()" 
                                  class="w-full flex items-center justify-between p-5 rounded-2xl glass border border-white/5 hover:border-teal-500/30 hover:bg-white/5 transition-all group">
                              <div class="flex items-center gap-4">
                                  <div class="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <lucide-icon [name]="BriefcaseIcon" class="h-5 w-5"></lucide-icon>
                                  </div>
                                  <div class="text-left">
                                      <div class="text-[14px] font-bold text-white/90">Apply for Jobs</div>
                                      <div class="text-[11px] text-white/30">Find matching roles on our portal</div>
                                  </div>
                              </div>
                              <lucide-icon [name]="ChevronRightIcon" class="h-4 w-4 text-white/20"></lucide-icon>
                          </button>
 
                          <button (click)="downloadPdf()" 
                                  class="w-full flex items-center justify-between p-5 rounded-2xl glass border border-white/5 hover:border-teal-500/30 hover:bg-white/5 transition-all group">
                              <div class="flex items-center gap-4">
                                  <div class="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <lucide-icon [name]="DownloadIcon" class="h-5 w-5"></lucide-icon>
                                  </div>
                                  <div class="text-left">
                                      <div class="text-[14px] font-bold text-white/90">Download PDF</div>
                                      <div class="text-[11px] text-white/30">Get a high-quality PDF version</div>
                                  </div>
                              </div>
                              <lucide-icon [name]="DownloadIcon" class="h-4 w-4 text-white/20"></lucide-icon>
                          </button>
                      </div>
 
                      <div class="pt-4">
                          <button (click)="isReviewMode.set(false)" class="w-full py-3 text-[13px] font-medium text-white/40 hover:text-white/60 transition-colors">
                              ← Back to Editor
                          </button>
                      </div>
                  </div>
                } @else {
                  
                  <!-- Step: Template -->
                  @if (currentStep.type === 'TEMPLATE') {
                      <div class="space-y-6 animate-fade-up">
                          <div>
                              <h3 class="text-[16px] font-semibold text-white/90">Choose Template</h3>
                              <p class="text-[12px] mt-1 text-white/40">Pick a layout style to render your resume.</p>
                          </div>
                          @if (templates().length === 0) {
                              <div class="text-[12px] text-white/20">No templates available.</div>
                          } @else {
                              <div class="space-y-4">
                                  @for (template of templates(); track template.templateId) {
                                      <div (click)="selectTemplate(template)"
                                           class="p-4 rounded-2xl border cursor-pointer transition-all"
                                           [style.borderColor]="selectedTemplate()?.templateId === template.templateId ? '#4FD1C5' : 'rgba(255,255,255,0.06)'"
                                           [style.background]="selectedTemplate()?.templateId === template.templateId ? 'rgba(79,209,197,0.1)' : 'rgba(255,255,255,0.02)'">
                                          <div class="flex gap-4">
                                              <div class="w-[120px] h-[170px] rounded-xl border border-white/10 bg-black/20 overflow-hidden relative">
                                                  @if (getTemplatePreviewUrl(template)) {
                                                      <img [src]="getTemplatePreviewUrl(template)" class="w-full h-full object-cover" />
                                                  } @else {
                                                      @if (getTemplateConfig(template); as cfg) {
                                                          <div style="transform:scale(0.3); transform-origin: top left;">
                                                              <app-resume-renderer [config]="cfg" [resumeData]="renderData()" [previewMode]="true"></app-resume-renderer>
                                                          </div>
                                                      } @else {
                                                          <div class="h-full w-full flex items-center justify-center text-[10px] text-white/20">Preview unavailable</div>
                                                      }
                                                  }
                                              </div>
                                              <div class="flex-1 space-y-2">
                                                  <div class="text-[14px] font-semibold text-white/90">{{ template.name }}</div>
                                                  <p class="text-[12px] leading-relaxed text-white/40">{{ template.description }}</p>
                                                  <div class="text-[10px] uppercase tracking-widest text-teal-400/60">
                                                      {{ template.isPremium ? 'Premium' : 'Free' }} - {{ template.isActive ? 'Active' : 'Inactive' }}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  }
                              </div>
                          }
                      </div>
                  }

                  <!-- Step: Personal Info -->
                  @if (currentStep.type === 'PERSONAL_INFO') {
                      <form [formGroup]="personalInfoForm" class="space-y-6 animate-fade-up">
                          <div class="space-y-1.5">
                              <label class="text-[12px] font-semibold text-white/40 ml-1">Full Name</label>
                              <input formControlName="name" class="glass-input w-full py-3 text-[14px]" placeholder="e.g. John Doe">
                          </div>
                          <div class="grid grid-cols-2 gap-4">
                              <div class="space-y-1.5">
                                  <label class="text-[12px] font-semibold text-white/40 ml-1">Email Address</label>
                                  <input formControlName="email" class="glass-input w-full py-3 text-[14px]" placeholder="john@example.com">
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-[12px] font-semibold text-white/40 ml-1">Phone Number</label>
                                  <input formControlName="phone" class="glass-input w-full py-3 text-[14px]" placeholder="+1 234 567 890">
                              </div>
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-[12px] font-semibold text-white/40 ml-1">Location</label>
                              <input formControlName="location" class="glass-input w-full py-3 text-[14px]" placeholder="e.g. New York, NY">
                          </div>
                          <div class="space-y-1.5">
                              <label class="text-[12px] font-semibold text-white/40 ml-1">Professional Title</label>
                              <input formControlName="title" class="glass-input w-full py-3 text-[14px]" placeholder="e.g. Senior Software Engineer">
                          </div>
                          <div class="grid grid-cols-2 gap-4">
                              <div class="space-y-1.5">
                                  <label class="text-[12px] font-semibold text-white/40 ml-1">LinkedIn Profile</label>
                                  <input formControlName="linkedin" class="glass-input w-full py-3 text-[14px]" placeholder="linkedin.com/in/username">
                              </div>
                              <div class="space-y-1.5">
                                  <label class="text-[12px] font-semibold text-white/40 ml-1">Website / Portfolio</label>
                                  <input formControlName="website" class="glass-input w-full py-3 text-[14px]" placeholder="username.dev">
                              </div>
                          </div>
                      </form>
                  }

                  <!-- Step: Summary -->
                  @if (currentStep.type === 'SUMMARY') {
                      <form [formGroup]="summaryForm" class="space-y-6 animate-fade-up">
                          <div class="flex items-center justify-between mb-2">
                              <label class="text-[12px] font-semibold text-white/40 ml-1">Professional Summary</label>
                              <button (click)="generateWithAi()" [disabled]="isAiGenerating()" type="button" class="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors disabled:opacity-50">
                                  <lucide-icon [name]="isAiGenerating() ? Loader2Icon : SparklesIcon" [class.animate-spin]="isAiGenerating()" class="h-3.5 w-3.5"></lucide-icon>
                                  {{ isAiGenerating() ? 'Processing...' : 'AI Generate' }}
                              </button>
                          </div>
                          <textarea formControlName="summary" rows="12" class="glass-input w-full py-4 text-[14px] leading-relaxed resize-none custom-scrollbar" placeholder="Briefly describe your career goals and key achievements..."></textarea>
                      </form>
                  }

                  <!-- Step: Experience -->
                  @if (currentStep.type === 'EXPERIENCE') {
                      <div class="space-y-6 animate-fade-up">
                          <div class="flex items-center justify-between">
                            <label class="text-[12px] font-semibold text-white/40 ml-1">Work History</label>
                            <button (click)="addExperience()" class="text-[11px] font-bold text-teal-400 hover:underline flex items-center gap-1">
                                <lucide-icon [name]="PlusIcon" class="h-3 w-3"></lucide-icon>
                                Add Position
                            </button>
                          </div>
                          
                          <form [formGroup]="experienceForm" class="space-y-4">
                              <div formArrayName="items" class="space-y-6">
                                  @for (item of experienceItems.controls; track $index) {
                                      <div [formGroupName]="$index" class="p-5 rounded-2xl glass border border-white/5 relative group">
                                          <button (click)="removeExperience($index)" class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/20 shadow-sm">
                                              <lucide-icon [name]="Trash2Icon" class="h-3 w-3"></lucide-icon>
                                          </button>
                                          <div class="grid grid-cols-2 gap-4 mb-4">
                                              <div class="space-y-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">Company</label>
                                                  <input formControlName="company" class="w-full text-[13px] outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent py-1 text-white/90" placeholder="Company Name">
                                              </div>
                                              <div class="space-y-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">Position</label>
                                                  <input formControlName="position" class="w-full text-[13px] outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent py-1 text-white/90" placeholder="Job Title">
                                              </div>
                                          </div>
                                          <div class="grid grid-cols-2 gap-4 mb-4">
                                              <div class="space-y-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">Start Date</label>
                                                  <input formControlName="startDate" class="w-full text-[13px] outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent py-1 text-white/90" placeholder="MM/YYYY">
                                              </div>
                                              <div class="space-y-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">End Date</label>
                                                  <input formControlName="endDate" class="w-full text-[13px] outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent py-1 text-white/90" placeholder="Present or MM/YYYY">
                                              </div>
                                          </div>
                                          <div class="space-y-1">
                                              <div class="flex items-center justify-between mb-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">Description</label>
                                                  <button (click)="enhanceExperience($index)" [disabled]="isAiGenerating()" type="button" class="text-[9px] font-bold text-teal-400 hover:underline flex items-center gap-1 disabled:opacity-50">
                                                      <lucide-icon [name]="isAiGenerating() ? Loader2Icon : SparklesIcon" [class.animate-spin]="isAiGenerating()" class="h-2.5 w-2.5"></lucide-icon>
                                                      AI Enhance
                                                  </button>
                                              </div>
                                              <textarea formControlName="description" rows="3" class="w-full text-[13px] outline-none py-1 bg-transparent text-white/80 resize-none" placeholder="Key responsibilities and achievements..."></textarea>
                                          </div>
                                      </div>
                                  }
                              </div>
                          </form>
                      </div>
                  }

                  <!-- Step: Education -->
                  @if (currentStep.type === 'EDUCATION') {
                      <div class="space-y-6 animate-fade-up">
                          <div class="flex items-center justify-between">
                            <label class="text-[12px] font-semibold text-white/40 ml-1">Education Background</label>
                            <button (click)="addEducation()" class="text-[11px] font-bold text-teal-400 hover:underline flex items-center gap-1">
                                <lucide-icon [name]="PlusIcon" class="h-3 w-3"></lucide-icon>
                                Add School
                            </button>
                          </div>
                          
                          <form [formGroup]="educationForm" class="space-y-4">
                              <div formArrayName="items" class="space-y-4">
                                  @for (item of educationItems.controls; track $index) {
                                      <div [formGroupName]="$index" class="p-5 rounded-2xl glass border border-white/5 relative group">
                                          <button (click)="removeEducation($index)" class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/20 shadow-sm">
                                              <lucide-icon [name]="Trash2Icon" class="h-3 w-3"></lucide-icon>
                                          </button>
                                          <div class="grid grid-cols-2 gap-4">
                                              <div class="space-y-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">School/Uni</label>
                                                  <input formControlName="school" class="w-full text-[13px] outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent py-1 text-white/90" placeholder="Stanford University">
                                              </div>
                                              <div class="space-y-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">Degree</label>
                                                  <input formControlName="degree" class="w-full text-[13px] outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent py-1 text-white/90" placeholder="B.S. Computer Science">
                                              </div>
                                          </div>
                                      </div>
                                  }
                              </div>
                          </form>
                      </div>
                  }

                  <!-- Step: Skills -->
                  @if (currentStep.type === 'SKILLS') {
                      <form [formGroup]="skillsForm" class="space-y-6 animate-fade-up">
                          <div class="space-y-1.5">
                              <label class="text-[12px] font-semibold text-white/40 ml-1">Technical Skills</label>
                              <p class="text-[11px] text-white/20 mb-2">Separate skills with commas (e.g. Java, Python, AWS)</p>
                              <textarea formControlName="skills" rows="8" class="glass-input w-full py-4 text-[14px] leading-relaxed resize-none custom-scrollbar" placeholder="Java, Spring Boot, Angular, PostgreSQL..."></textarea>
                          </div>
                      </form>
                  }

                  <!-- Step: Projects -->
                  @if (currentStep.type === 'PROJECTS') {
                      <div class="space-y-6 animate-fade-up">
                          <div class="flex items-center justify-between">
                            <label class="text-[12px] font-semibold text-white/40 ml-1">Key Projects</label>
                            <button (click)="addProject()" class="text-[11px] font-bold text-teal-400 hover:underline flex items-center gap-1">
                                <lucide-icon [name]="PlusIcon" class="h-3 w-3"></lucide-icon>
                                Add Project
                            </button>
                          </div>
                          
                          <form [formGroup]="projectsForm" class="space-y-4">
                              <div formArrayName="items" class="space-y-4">
                                  @for (item of projectItems.controls; track $index) {
                                      <div [formGroupName]="$index" class="p-5 rounded-2xl glass border border-white/5 relative group">
                                          <button (click)="removeProject($index)" class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/20 shadow-sm">
                                              <lucide-icon [name]="Trash2Icon" class="h-3 w-3"></lucide-icon>
                                          </button>
                                          <div class="space-y-3">
                                              <input formControlName="name" class="w-full text-[14px] font-bold outline-none border-b border-transparent focus:border-teal-500/30 bg-transparent text-white/90" placeholder="Project Name">
                                              <input formControlName="role" class="w-full text-[12px] text-white/40 outline-none bg-transparent" placeholder="Your Role">
                                              <div class="flex items-center justify-between mb-1">
                                                  <label class="text-[10px] font-bold uppercase text-white/20">Description</label>
                                                  <button (click)="enhanceProject($index)" [disabled]="isAiGenerating()" type="button" class="text-[9px] font-bold text-teal-400 hover:underline flex items-center gap-1 disabled:opacity-50">
                                                      <lucide-icon [name]="isAiGenerating() ? Loader2Icon : SparklesIcon" [class.animate-spin]="isAiGenerating()" class="h-2.5 w-2.5"></lucide-icon>
                                                      AI Enhance
                                                  </button>
                                              </div>
                                              <textarea formControlName="description" rows="2" class="w-full text-[12px] text-white/70 outline-none bg-transparent resize-none" placeholder="Short description..."></textarea>
                                          </div>
                                      </div>
                                  }
                              </div>
                          </form>
                      </div>
                  }

                  <!-- Step: Achievements -->
                  @if (currentStep.type === 'ACHIEVEMENTS') {
                      <form [formGroup]="achievementsForm" class="space-y-6 animate-fade-up">
                          <div class="space-y-1.5">
                              <label class="text-[12px] font-semibold text-white/40 ml-1">Key Achievements</label>
                              <p class="text-[11px] text-white/20 mb-2">Add one achievement per line.</p>
                              <textarea formControlName="achievements" rows="8" class="glass-input w-full py-4 text-[14px] leading-relaxed resize-none custom-scrollbar" placeholder="Awarded Employee of the Quarter\nReduced cloud spend by 30%\nLaunched product feature driving 20% growth"></textarea>
                          </div>
                      </form>
                  }

                }
              </div>

              @if (!isReviewMode()) {
                <div class="px-8 py-6 glass-card border-t border-white/5 flex items-center justify-between">
                    <button (click)="prevStep()" [disabled]="currentStepIndex() === 0" 
                            class="flex items-center gap-2 px-6 h-12 rounded-2xl font-semibold text-[14px] transition-all disabled:opacity-20 hover:bg-white/5 text-white/90"
                            style="background:rgba(255,255,255,0.02)">
                        <lucide-icon [name]="ChevronLeftIcon" class="h-4 w-4"></lucide-icon>
                        Back
                    </button>
                    
                    <button (click)="nextStep()" 
                            class="flex items-center gap-2 px-8 h-12 rounded-2xl font-bold text-[14px] transition-all shadow-lg shadow-teal-500/20"
                            style="background:#14B8A6; color:white">
                        {{ currentStepIndex() === steps.length - 1 ? 'Finish & Review' : 'Next Section' }}
                        <lucide-icon [name]="ChevronRightIcon" class="h-4 w-4"></lucide-icon>
                    </button>
                </div>
              }
          </aside>

          <!-- Right Column: Live Preview -->
          <main class="flex-1 overflow-auto p-12 relative flex justify-center custom-scrollbar bg-black/10">
              @if (parsedConfig()) {
                  <div class="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden">
                      <app-resume-renderer [config]="parsedConfig()!" [resumeData]="renderData()"></app-resume-renderer>
                  </div>
              } @else {
                  <!-- A4 Page Simulation -->
                  <div #resumeDocument class="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden">
                      @if (loading()) {
                          <div class="absolute inset-0 flex items-center justify-center text-[14px] text-black/30">Preparing preview...</div>
                      } @else {
                          <div class="resume-preview-container p-16 font-sans h-full">
                              <!-- Content rendering -->
                              @for (sec of sections(); track sec.sectionId) {
                                  <div class="mb-8">
                                      <h2 class="text-[18px] font-bold border-b pb-1.5 mb-3 uppercase tracking-tight text-white/90 border-white/10">{{ sec.title }}</h2>
                                      
                                      @if (sec.sectionType === 'PERSONAL_INFO') {
                                          <div class="mb-4">
                                              <div class="text-[24px] font-bold text-white/90">{{ parseJson(sec.content).name }}</div>
                                              <div class="text-[14px] font-medium text-white/60 mb-2">{{ parseJson(sec.content).title }}</div>
                                              <div class="flex flex-wrap gap-4 text-[12px] text-white/40">
                                                  <span>{{ parseJson(sec.content).email }}</span>
                                                  <span>{{ parseJson(sec.content).phone }}</span>
                                                  <span>{{ parseJson(sec.content).location }}</span>
                                              </div>
                                          </div>
                                      } @else if (sec.sectionType === 'SUMMARY') {
                                          <p class="text-[13px] leading-relaxed whitespace-pre-wrap text-white/80">{{ parseJson(sec.content).summary }}</p>
                                      } @else if (sec.sectionType === 'EXPERIENCE') {
                                          <div class="space-y-5">
                                              @for (item of parseJson(sec.content); track $index) {
                                                  <div>
                                                      <div class="flex justify-between items-baseline mb-1">
                                                          <h4 class="text-[14px] font-bold text-white/90">{{ item.position }}</h4>
                                                          <span class="text-[12px] text-white/40">{{ item.startDate }} — {{ item.endDate }}</span>
                                                      </div>
                                                      <div class="text-[13px] font-medium text-white/60 mb-2">{{ item.company }}</div>
                                                      <p class="text-[12px] leading-relaxed text-white/80 whitespace-pre-wrap">{{ item.description }}</p>
                                                  </div>
                                              }
                                          </div>
                                      } @else if (sec.sectionType === 'EDUCATION') {
                                          <div class="space-y-4">
                                              @for (item of parseJson(sec.content); track $index) {
                                                  <div class="flex justify-between items-baseline">
                                                      <div>
                                                          <div class="text-[13px] font-bold text-white/90">{{ item.school }}</div>
                                                          <div class="text-[12px] text-white/60">{{ item.degree }}</div>
                                                      </div>
                                                      <span class="text-[12px] text-white/40">{{ item.startDate }} — {{ item.endDate }}</span>
                                                  </div>
                                              }
                                          </div>
                                      } @else if (sec.sectionType === 'SKILLS') {
                                          <div class="flex flex-wrap gap-2">
                                              @for (skill of (parseJson(sec.content).skills || '').split(','); track skill) {
                                                  @if (skill.trim()) {
                                                      <span class="px-2 py-1 rounded bg-white/5 text-[12px] text-white/80">{{ skill.trim() }}</span>
                                                  }
                                              }
                                          </div>
                                      } @else if (sec.sectionType === 'PROJECTS') {
                                          <div class="space-y-4">
                                              @for (item of parseJson(sec.content); track $index) {
                                                  <div>
                                                      <div class="font-bold text-[13px] text-white/90">{{ item.name }}</div>
                                                      <div class="text-[12px] text-white/60 mb-1">{{ item.role }}</div>
                                                      <p class="text-[12px] text-white/80">{{ item.description }}</p>
                                                  </div>
                                              }
                                          </div>
                                      } @else {
                                          <p class="text-[13px] leading-relaxed whitespace-pre-wrap text-white/80">{{ getSnippet(sec.content, 2000) }}</p>
                                      }
                                  </div>
                              }
                          </div>
                      }
                  </div>
              }
          </main>
      </div>

      <!-- Export Toast -->
      @if (activeExportJob()) {
          <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] animate-fade-up">
              <div class="glass-card rounded-2xl border border-white/10 p-4 flex items-center justify-between shadow-2xl">
                  <div class="flex items-center gap-3">
                      @if (activeExportJob()?.status === 'PROCESSING' || activeExportJob()?.status === 'QUEUED') {
                          <lucide-icon [name]="Loader2Icon" class="h-4 w-4 animate-spin text-teal-400"></lucide-icon>
                          <span class="text-[13px] font-medium text-white/90">Preparing {{ activeExportJob()?.format }}...</span>
                      } @else if (activeExportJob()?.status === 'COMPLETED') {
                          <div class="h-8 w-8 rounded-full flex items-center justify-center bg-teal-500/10">
                              <lucide-icon [name]="DownloadIcon" class="h-4 w-4 text-teal-400"></lucide-icon>
                          </div>
                          <span class="text-[13px] font-medium text-white/90">Ready to download</span>
                      }
                  </div>
                  <div class="flex items-center gap-2">
                      @if (activeExportJob()?.status === 'COMPLETED') {
                          <a [href]="activeExportJob()?.fileUrl" target="_blank" class="btn-primary px-3 py-1.5 text-[12px]">
                              Get file
                          </a>
                      }
                      <button (click)="activeExportJob.set(null)" class="p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-white/20">
                          <lucide-icon [name]="Trash2Icon" class="h-3.5 w-3.5"></lucide-icon>
                      </button>
                  </div>
              </div>
          </div>
      }

      <!-- ATS Overlay -->
      @if (showAtsPanel()) {
          <div class="!fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <div class="absolute inset-0 bg-black/15 backdrop-blur-sm" (click)="showAtsPanel.set(false)"></div>
              <div class="relative w-full max-w-lg glass-modal rounded-3xl p-10" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-8">
                    <h3 class="text-[20px] font-medium text-white/90">ATS Audit</h3>
                    <button (click)="showAtsPanel.set(false)" class="text-[13px] hover:underline text-white/40">Close</button>
                  </div>
                  
                  @if (atsResult()) {
                      <div class="space-y-8">
                          <div class="flex items-center gap-10">
                              <div class="h-28 w-28 rounded-full border-4 flex items-center justify-center text-[28px] font-medium relative text-teal-400 border-teal-500/10">
                                  {{ atsResult()?.score }}%
                                  <div class="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin-slow border-teal-500"></div>
                              </div>
                              <div class="flex-1">
                                  <p class="font-medium text-[15px] text-white/90">Quality Score</p>
                                  <p class="text-[13px] mt-1 leading-relaxed text-white/40">Your resume matches {{ atsResult()?.score }}% of common industry requirements.</p>
                              </div>
                          </div>


                          <div class="space-y-4">
                              <h4 class="text-[12px] uppercase tracking-widest font-medium flex items-center gap-2 text-white/30">
                                  <lucide-icon [name]="AlertCircleIcon" class="h-3.5 w-3.5"></lucide-icon>
                                  Missing Keywords
                              </h4>
                              <div class="flex flex-wrap gap-2">
                                  @for (key of atsResult()?.keywordsMissing; track key) {
                                      <span class="px-3 py-1 rounded-lg text-[12px] bg-red-500/10 text-red-400 border border-red-500/20">{{ key }}</span>
                                  }
                              </div>
                          </div>

                          <div class="space-y-4">
                              <h4 class="text-[12px] uppercase tracking-widest font-medium flex items-center gap-2 text-white/30">
                                  <lucide-icon [name]="Wand2Icon" class="h-3.5 w-3.5"></lucide-icon>
                                  AI Optimization
                              </h4>
                              <ul class="space-y-3">
                                  @for (sug of atsResult()?.suggestions; track sug.action) {
                                      <li class="text-[13px] flex items-start gap-3 text-white/50">
                                          <div class="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-teal-500"></div>
                                          <span class="font-bold text-[11px] uppercase mr-1" [ngStyle]="{color: sug.priority === 'HIGH' ? '#F87171' : '#4FD1C5'}">[{{ sug.priority }}]</span>
                                          {{ sug.action }}
                                      </li>
                                  }
                              </ul>
                          </div>

                      </div>
                  } @else {
                    <div class="text-center py-20 flex flex-col items-center gap-4">
                        <div class="h-10 w-10 rounded-full animate-spin border-2 border-white/10 border-t-teal-500"></div>
                        <p class="text-[14px] text-white/40">Running audit...</p>
                    </div>

                  }
              </div>
          </div>
      }
    
      <!-- AI Selection Overlay -->
      @if (aiSelectionOptions()) {
          <div class="!fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <div class="absolute inset-0 bg-black/40 backdrop-blur-md" (click)="aiSelectionOptions.set(null)"></div>
              <div class="relative w-full max-w-2xl glass-modal rounded-[32px] p-10 overflow-hidden border border-white/10" (click)="$event.stopPropagation()">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>
                  
                  <div class="flex items-center justify-between mb-8">
                    <div>
                        <h3 class="text-[22px] font-bold text-white/90 flex items-center gap-2">
                            <lucide-icon [name]="SparklesIcon" class="h-6 w-6 text-teal-400"></lucide-icon>
                            Choose Your Version
                        </h3>
                        <p class="text-[13px] text-white/40 mt-1">Select the version that best fits your professional brand.</p>
                    </div>
                    <button (click)="aiSelectionOptions.set(null)" class="h-10 w-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                        <lucide-icon [name]="Trash2Icon" class="h-5 w-5 text-white/20"></lucide-icon>
                    </button>
                  </div>
                  
                  <div class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                      @for (opt of aiSelectionOptions(); track $index) {
                          <div (click)="selectAiOption(opt)" 
                               class="group relative p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-teal-500/30 hover:bg-white/10 transition-all cursor-pointer">
                              <div class="absolute top-4 right-4 h-6 w-6 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                  <lucide-icon [name]="CheckCircleIcon" class="h-4 w-4"></lucide-icon>
                              </div>
                              <p class="text-[14px] leading-relaxed text-white/60 group-hover:text-white/90 transition-colors">{{ opt }}</p>
                              <div class="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-400 opacity-0 group-hover:opacity-100 transition-all">
                                  <span>Select Version {{ $index + 1 }}</span>
                                  <lucide-icon [name]="ChevronRightIcon" class="h-3 w-3"></lucide-icon>
                              </div>
                          </div>
                      }
                  </div>
                  
                  <div class="mt-8 flex justify-center">
                      <button (click)="regenerateCurrentAi()" class="text-[13px] font-medium text-white/40 hover:text-white/60 transition-colors flex items-center gap-2">
                          <lucide-icon [name]="Wand2Icon" class="h-4 w-4"></lucide-icon>
                          Regenerate options
                      </button>
                  </div>
              </div>
          </div>
      }

      <!-- Global AI Loader -->
      @if (isAiGenerating()) {
          <div class="!fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
              <div class="flex flex-col items-center gap-4">
                  <div class="relative">
                      <lucide-icon [name]="SparklesIcon" class="h-12 w-12 text-teal-400 animate-pulse"></lucide-icon>
                      <lucide-icon [name]="Loader2Icon" class="h-20 w-20 text-white/5 animate-spin absolute -top-4 -left-4"></lucide-icon>
                  </div>
                  <div class="flex flex-col items-center">
                    <p class="text-[18px] font-bold tracking-tight text-white/90">AI is working its magic...</p>
                    <p class="text-[12px] text-white/40 mt-1">Generating professional content for you</p>
                  </div>
              </div>
          </div>
      }
    </div>

  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `]
})
export class LiveBuilderComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private resumeService = inject(ResumeService);
    private fb = inject(FormBuilder);
    private aiService = inject(AiService);
    private usage = inject(UsageLimitsService);
    private exportService = inject(ExportService);
    private templateService = inject(TemplateService);
    private dataMapper = inject(ResumeDataMapperService);

    isEditingTitle = signal(false);
    titleInput = signal('');

    startEditingTitle() {
        this.titleInput.set(this.resume()?.title || '');
        this.isEditingTitle.set(true);
    }

    saveTitle() {
        const newTitle = this.titleInput().trim();
        const current = this.resume();
        if (newTitle && current && newTitle !== current.title) {
            this.resumeService.updateResume(current.resumeId, {
                title: newTitle,
                targetJobTitle: current.targetJobTitle,
                templateId: current.templateId
            }).subscribe({
                next: (updated) => {
                    this.resume.set(updated);
                    this.isEditingTitle.set(false);
                },
                error: (err) => {
                    console.error('Failed to update title', err);
                    this.isEditingTitle.set(false);
                }
            });
        } else {
            this.isEditingTitle.set(false);
        }
    }

    @ViewChild('resumeDocument') resumeDocument?: ElementRef;
    @ViewChild(ResumeRendererComponent) resumeRendererRef!: ResumeRendererComponent;

    usageSummary = computed(() => {
        this.usage.changed();
        return this.usage.getCurrentUserSummary();
    });

    readonly Unlimited = Number.POSITIVE_INFINITY;
    readonly ChevronLeftIcon = ChevronLeft;
    readonly SaveIcon = Save;
    readonly PlusIcon = Plus;
    readonly GripVerticalIcon = GripVertical;
    readonly Trash2Icon = Trash2;
    readonly Edit3Icon = Edit3;
    readonly TypeIcon = Type;
    readonly SparklesIcon = Sparkles;
    readonly Wand2Icon = Wand2;
    readonly TargetIcon = Target;
    readonly ZapIcon = Zap;
    readonly AlertCircleIcon = AlertCircle;
    readonly DownloadIcon = Download;
    readonly FileJsonIcon = FileJson;
    readonly FileTextIcon = FileText;
    readonly Loader2Icon = Loader2;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronRightIcon = ChevronRight;
    readonly UserIcon = User;
    readonly BriefcaseIcon = Briefcase;
    readonly GraduationCapIcon = GraduationCap;
    readonly AwardIcon = Award;
    readonly MessageSquareIcon = MessageSquare;
    readonly GlobeIcon = Globe;
    readonly CheckCircleIcon = CheckCircle;
    readonly EditIcon = Edit3;

    resumeId = signal<number | null>(null);
    resume = signal<BackendResume | null>(null);
    sections = signal<BackendSection[]>([]);
    loading = signal(true);

    templates = signal<BackendTemplate[]>([]);
    selectedTemplate = signal<BackendTemplate | null>(null);
    parsedConfig = computed<TemplateLayoutConfig | null>(() => {
        const template = this.selectedTemplate();
        if (!template?.layoutConfig) return DEFAULT_LAYOUT_CONFIG;
        try {
            return JSON.parse(template.layoutConfig) as TemplateLayoutConfig;
        } catch {
            return DEFAULT_LAYOUT_CONFIG;
        }
    });
    isExportingPdf = signal(false);

    // Structured Forms
    personalInfoForm = this.fb.nonNullable.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        location: [''],
        title: [''],
        linkedin: [''],
        website: ['']
    });

    summaryForm = this.fb.nonNullable.group({
        summary: ['', Validators.required]
    });

    experienceForm = this.fb.nonNullable.group({
        items: this.fb.array([])
    });

    educationForm = this.fb.nonNullable.group({
        items: this.fb.array([])
    });

    skillsForm = this.fb.nonNullable.group({
        skills: [''] // Comma separated or array
    });

    projectsForm = this.fb.nonNullable.group({
        items: this.fb.array([])
    });

    achievementsForm = this.fb.nonNullable.group({
        achievements: ['']
    });

    // Legacy/Internal form (kept for section metadata)
    sectionForm = this.fb.nonNullable.group({
        sectionType: ['CUSTOM', Validators.required],
        title: ['', Validators.required],
        content: ['', Validators.required]
    });
    
    // Live Form Signals for Real-time Preview
    private personalInfoValue = toSignal(this.personalInfoForm.valueChanges, { initialValue: this.personalInfoForm.getRawValue() });
    private summaryValue = toSignal(this.summaryForm.valueChanges, { initialValue: this.summaryForm.getRawValue() });
    private experienceValue = toSignal(this.experienceForm.valueChanges, { initialValue: this.experienceForm.getRawValue() });
    private educationValue = toSignal(this.educationForm.valueChanges, { initialValue: this.educationForm.getRawValue() });
    private skillsValue = toSignal(this.skillsForm.valueChanges, { initialValue: this.skillsForm.getRawValue() });
    private projectsValue = toSignal(this.projectsForm.valueChanges, { initialValue: this.projectsForm.getRawValue() });
    private achievementsValue = toSignal(this.achievementsForm.valueChanges, { initialValue: this.achievementsForm.getRawValue() });

    renderData = computed<ResumeRenderData>(() => {
        // Fallback to saved data if needed, but prioritize live form values
        const res = this.resume();
        const personal = this.personalInfoValue();
        const summary = this.summaryValue();
        const experience = this.experienceValue();
        const education = this.educationValue();
        const skills = this.skillsValue();
        const projects = this.projectsValue();
        const achievements = this.achievementsValue();

        return {
            personal: {
                name: personal?.name || res?.ownerName || '',
                email: personal?.email || '',
                phone: personal?.phone || '',
                location: personal?.location || '',
                linkedin: personal?.linkedin || '',
                website: personal?.website || '',
                subtitle: personal?.title || ''
            },
            summary: summary?.summary || '',
            experience: (experience?.items || []).map((it: any) => ({
                company: it.company || '',
                title: it.position || '',
                startDate: it.startDate || '',
                endDate: it.endDate || '',
                bullets: (it.description || '').split('\n').filter((b: string) => b.trim())
            })),
            education: (education?.items || []).map((it: any) => ({
                institution: it.school || '',
                degree: it.degree || '',
                year: it.startDate && it.endDate ? `${it.startDate} - ${it.endDate}` : (it.startDate || it.endDate || ''),
                gpa: it.cgpa || undefined
            })),
            projects: (projects?.items || []).map((it: any) => ({
                name: it.name || '',
                role: it.role || '',
                description: it.description || ''
            })),
            skills: (skills?.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
            achievements: (achievements?.achievements || '').split('\n').filter((a: string) => a.trim()),
            languages: [], // Add language form if needed
            certifications: '' // Add certifications form if needed
        };
    });

    // Wizard State
    currentStepIndex = signal(0);
    steps = [
        { label: 'Template', type: 'TEMPLATE', icon: Type },
        { label: 'Personal Info', type: 'PERSONAL_INFO', icon: User },
        { label: 'Summary', type: 'SUMMARY', icon: MessageSquare },
        { label: 'Experience', type: 'EXPERIENCE', icon: Briefcase },
        { label: 'Education', type: 'EDUCATION', icon: GraduationCap },
        { label: 'Skills', type: 'SKILLS', icon: Award },
        { label: 'Projects', type: 'PROJECTS', icon: Zap },
        { label: 'Achievements', type: 'ACHIEVEMENTS', icon: CheckCircle }
    ];

    isEditorOpen = signal(false);
    editingSectionId = signal<number | null>(null);

    isAiGenerating = signal(false);
    showAtsPanel = signal(false);
    atsResult = signal<AtsReport | null>(null);
    activeExportJob = signal<ExportJob | null>(null);
    isReviewMode = signal(false);
    isPublishing = signal(false);
    aiSelectionOptions = signal<string[] | null>(null);
    aiSelectionTarget = signal<{ type: 'SUMMARY' | 'EXPERIENCE' | 'PROJECT', index?: number } | null>(null);

    private templateConfigCache = new Map<number, TemplateLayoutConfig>();


    ngOnInit() {
        this.loadTemplates();
        const idStr = this.route.snapshot.paramMap.get('resumeId');
        if (idStr) {
            const id = parseInt(idStr, 10);
            this.resumeId.set(id);
            this.loadData(id);

            // Handle step redirection from Explore page
            const skipTemplate = this.route.snapshot.queryParamMap.get('skipTemplate');
            if (skipTemplate === 'true') {
                this.currentStepIndex.set(1); // Move to Personal Info step
            }
        } else {
            this.router.navigate(['/dashboard']);
        }
    }

    loadTemplates() {
        this.templateService.getAllTemplates().subscribe({
            next: (data) => this.templates.set(data),
            error: (err) => console.error('Failed to load templates', err)
        });
    }

    loadData(id: number) {
        this.resumeService.getResumeById(id).subscribe({
            next: (data) => {
                this.resume.set(data);
                this.sections.set(data.sections || []);
                this.syncFormsWithSections(data.sections || []);
                
                // Set the selected template based on resume data
                const tid = data.templateId || 1;
                this.templateService.getTemplateById(tid).subscribe({
                    next: (template) => {
                        this.selectedTemplate.set(template);
                    },
                    error: (err) => {
                        console.error('Failed to load template', err);
                    }
                });
                
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.router.navigate(['/dashboard']);
            }
        });
    }

    // Wizard Logic
    syncFormsWithSections(sections: BackendSection[]) {
        sections.forEach(sec => {
            try {
                const content = JSON.parse(sec.content);
                switch (sec.sectionType) {
                    case 'PERSONAL_INFO':
                        this.personalInfoForm.patchValue(content);
                        break;
                    case 'SUMMARY':
                        this.summaryForm.patchValue(content);
                        break;
                    case 'EXPERIENCE':
                        this.setFormArray(this.experienceForm, 'items', content);
                        break;
                    case 'EDUCATION':
                        this.setFormArray(this.educationForm, 'items', content);
                        break;
                    case 'SKILLS':
                        this.skillsForm.patchValue(content);
                        break;
                    case 'PROJECTS':
                        this.setFormArray(this.projectsForm, 'items', content);
                        break;
                    case 'ACHIEVEMENTS':
                        this.achievementsForm.patchValue({ achievements: this.extractAchievementText(content) });
                        break;
                }
            } catch (e) {
                // Fallback for non-JSON content if needed
            }
        });
    }

    private setFormArray(form: FormGroup, key: string, data: any[]) {
        const array = form.get(key) as FormArray;
        array.clear();
        if (Array.isArray(data)) {
            data.forEach(item => {
                const group = this.fb.group(item);
                array.push(group);
            });
        }
    }

    private extractAchievementText(content: unknown): string {
        if (Array.isArray(content)) {
            return content.filter((item): item is string => typeof item === 'string').join('\n');
        }
        if (content && typeof content === 'object') {
            const record = content as Record<string, unknown>;
            const achievements = record['achievements'];
            if (Array.isArray(achievements)) {
                return achievements.filter((item): item is string => typeof item === 'string').join('\n');
            }
            if (typeof achievements === 'string') {
                return achievements;
            }
        }
        if (typeof content === 'string') {
            return content;
        }
        return '';
    }

    private splitAchievementLines(value: string): string[] {
        return value
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean);
    }

    get currentStep() { return this.steps[this.currentStepIndex()]; }

    nextStep() {
        this.saveCurrentStep().subscribe(() => {
            if (this.currentStepIndex() < this.steps.length - 1) {
                this.currentStepIndex.update(i => i + 1);
            } else {
                this.isReviewMode.set(true);
            }
        });
    }

    prevStep() {
        if (this.currentStepIndex() > 0) {
            this.currentStepIndex.update(i => i - 1);
        }
    }

    saveCurrentStep() {
        const step = this.currentStep;
        if (step.type === 'TEMPLATE') {
            return of(void 0);
        }
        let content: any;
        switch (step.type) {
            case 'PERSONAL_INFO': content = this.personalInfoForm.value; break;
            case 'SUMMARY': content = this.summaryForm.value; break;
            case 'EXPERIENCE': content = this.experienceForm.value.items; break;
            case 'EDUCATION': content = this.educationForm.value.items; break;
            case 'SKILLS': content = this.skillsForm.value; break;
            case 'PROJECTS': content = this.projectsForm.value.items; break;
            case 'ACHIEVEMENTS': content = this.splitAchievementLines(this.achievementsForm.value.achievements || ''); break;
        }

        const existingSection = this.sections().find(s => s.sectionType === step.type);
        const request: SectionRequest = {
            sectionType: step.type,
            title: step.label,
            content: JSON.stringify(content),
            displayOrder: existingSection?.displayOrder ?? this.sections().length
        };

        if (existingSection) {
            return this.resumeService.updateSection(existingSection.sectionId, request).pipe(
                switchMap(() => this.resumeService.getResumeById(this.resumeId()!)),
                switchMap(data => {
                    this.resume.set(data);
                    this.sections.set(data.sections || []);
                    return of(void 0);
                })
            );
        } else {
            return this.resumeService.addSection(this.resumeId()!, request).pipe(
                switchMap(() => this.resumeService.getResumeById(this.resumeId()!)),
                switchMap(data => {
                    this.resume.set(data);
                    this.sections.set(data.sections || []);
                    return of(void 0);
                })
            );
        }
    }

    // Form Array Helpers
    get experienceItems() { return this.experienceForm.get('items') as FormArray; }
    addExperience() {
        this.experienceItems.push(this.fb.group({
            company: [''], position: [''], startDate: [''], endDate: [''], description: ['']
        }));
    }
    removeExperience(index: number) { this.experienceItems.removeAt(index); }

    get educationItems() { return this.educationForm.get('items') as FormArray; }
    addEducation() {
        this.educationItems.push(this.fb.group({
            school: [''], degree: [''], startDate: [''], endDate: ['']
        }));
    }
    removeEducation(index: number) { this.educationItems.removeAt(index); }

    get projectItems() { return this.projectsForm.get('items') as FormArray; }
    addProject() {
        this.projectItems.push(this.fb.group({
            name: [''], role: [''], description: [''], link: ['']
        }));
    }
    removeProject(index: number) { this.projectItems.removeAt(index); }

    goBack() { this.router.navigate(['/dashboard']); }

    parseJson(content: string): any {
        if (!content) return {};
        try {
            return JSON.parse(content);
        } catch {
            return {};
        }
    }

    selectTemplate(template: BackendTemplate) {
        this.selectedTemplate.set(template);
        if (this.resumeId() && template.templateId) {
            const current = this.resume();
            if (current) {
                this.resumeService.updateResume(this.resumeId()!, {
                    title: current.title,
                    targetJobTitle: current.targetJobTitle,
                    templateId: template.templateId
                }).subscribe({
                    next: (updated) => {
                        this.resume.set(updated);
                        console.log('Template selection saved:', template.name);
                    },
                    error: (err) => console.error('Failed to save template selection', err)
                });
            }
        }
    }

    getTemplatePreviewUrl(template: BackendTemplate): string | null {
        return template.previewUrl || template.thumbnailUrl || null;
    }

    getTemplateConfig(template: BackendTemplate): TemplateLayoutConfig | null {
        if (!template.layoutConfig) return null;
        if (template.templateId && this.templateConfigCache.has(template.templateId)) {
            return this.templateConfigCache.get(template.templateId) || null;
        }
        try {
            const parsed = JSON.parse(template.layoutConfig) as TemplateLayoutConfig;
            if (template.templateId) {
                this.templateConfigCache.set(template.templateId, parsed);
            }
            return parsed;
        } catch {
            return null;
        }
    }

    generateWithAi() {
        const title = this.personalInfoForm.value.title || 'Professional';
        this.isAiGenerating.set(true);
        this.aiSelectionTarget.set({ type: 'SUMMARY' });
        this.aiService.generateSummary(this.resumeId()!, title, 5).subscribe({
            next: (res) => {
                if (res && res.options) {
                    this.aiSelectionOptions.set(res.options);
                }
                this.isAiGenerating.set(false);
            },
            error: () => this.isAiGenerating.set(false)
        });
    }

    enhanceExperience(index: number) {
        const item = this.experienceItems.at(index);
        const content = item.value.description;
        if (!content) return;

        this.isAiGenerating.set(true);
        this.aiSelectionTarget.set({ type: 'EXPERIENCE', index });
        this.aiService.enhanceText(content).subscribe({
            next: (res) => {
                if (res && res.options) {
                    this.aiSelectionOptions.set(res.options);
                }
                this.isAiGenerating.set(false);
            },
            error: () => this.isAiGenerating.set(false)
        });
    }

    enhanceProject(index: number) {
        const item = this.projectItems.at(index);
        const content = item.value.description;
        if (!content) return;

        this.isAiGenerating.set(true);
        this.aiSelectionTarget.set({ type: 'PROJECT', index });
        this.aiService.enhanceText(content).subscribe({
            next: (res) => {
                if (res && res.options) {
                    this.aiSelectionOptions.set(res.options);
                }
                this.isAiGenerating.set(false);
            },
            error: () => this.isAiGenerating.set(false)
        });
    }

    selectAiOption(option: string) {
        const target = this.aiSelectionTarget();
        if (!target) return;

        if (target.type === 'SUMMARY') {
            this.summaryForm.patchValue({ summary: option });
        } else if (target.type === 'EXPERIENCE' && target.index !== undefined) {
            this.experienceItems.at(target.index).patchValue({ description: option });
        } else if (target.type === 'PROJECT' && target.index !== undefined) {
            this.projectItems.at(target.index).patchValue({ description: option });
        }
        this.aiSelectionOptions.set(null);
        this.aiSelectionTarget.set(null);
    }

    regenerateCurrentAi() {
        const target = this.aiSelectionTarget();
        if (!target) return;

        if (target.type === 'SUMMARY') {
            this.generateWithAi();
        } else if (target.type === 'EXPERIENCE' && target.index !== undefined) {
            this.enhanceExperience(target.index);
        } else if (target.type === 'PROJECT' && target.index !== undefined) {
            this.enhanceProject(target.index);
        }
    }

    getSnippet(content: string, len: number = 80) {
        if (!content) return 'No content';
        try {
            const obj = JSON.parse(content);
            return JSON.stringify(obj).substring(0, len) + '...';
        } catch {
            return content.substring(0, len) + (content.length > len ? '...' : '');
        }
    }

    openAtsCheck() {
        if (!this.resumeId()) return;
        this.showAtsPanel.set(true);
        this.atsResult.set(null);

        const resumeContent = buildStructuredResumeText(this.resume()!);

        this.aiService.checkAts(this.resumeId()!, resumeContent, "General Professional Role").subscribe({
            next: (res: AtsReport) => this.atsResult.set(res),
            error: (err: any) => {
                console.error(err);
                this.showAtsPanel.set(false);
            }
        });
    }

    async triggerExport(format: 'PDF' | 'DOCX' | 'JSON') {
        if (!this.resumeId()) return;
        if (format !== 'PDF') {
            this.exportService.startExportJob(this.resumeId()!, format).subscribe((job: ExportJob) => {
                this.activeExportJob.set(job);
                this.pollExportStatus(job.jobId);
            });
            return;
        }

        const config = this.parsedConfig();
        if (!config) {
            await this.exportBasicPdf();
            return;
        }

        this.isExportingPdf.set(true);

        try {
            await document.fonts.ready;

            const rendererEl = this.resumeRendererRef?.resumeRoot?.nativeElement;
            if (!rendererEl) throw new Error('Renderer not mounted');

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

            const resumeTitle = this.resume()?.title ?? 'resume';
            pdf.save(`${resumeTitle}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            this.isExportingPdf.set(false);
        }
    }

    private pollExportStatus(jobId: string) {
        interval(2000).pipe(
            switchMap(() => this.exportService.getExportStatus(jobId)),
            takeWhile((job: ExportJob) => job.status === 'QUEUED' || job.status === 'PROCESSING', true)
        ).subscribe((job: ExportJob) => {
            this.activeExportJob.set(job);
        });
    }

    downloadPdf() {
        if (this.parsedConfig()) {
            this.triggerExport('PDF');
        } else {
            this.exportBasicPdf();
        }
    }

    async exportBasicPdf(): Promise<void> {
        const data = this.resumeDocument?.nativeElement;
        if (!data) return;

        try {
            await document.fonts.ready;
            const canvas = await html2canvas(data, { scale: 2 });
            const imgWidth = 208;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const contentDataURL = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${this.resume()?.title || 'resume'}.pdf`);
        } catch (err) {
            console.error('Basic PDF export failed:', err);
        }
    }

    publishResume() {
        if (!this.resumeId()) return;
        this.isPublishing.set(true);
        this.resumeService.publishResume(this.resumeId()!, true).subscribe({
            next: (res) => {
                this.resume.set(res);
                this.isPublishing.set(false);
                alert('Resume published to community successfully!');
            },
            error: (err) => {
                console.error(err);
                this.isPublishing.set(false);
            }
        });
    }

    applyForJobs() {
        this.router.navigate(['/job-matching'], {
            queryParams: { resumeId: this.resumeId() }
        });
    }
}
