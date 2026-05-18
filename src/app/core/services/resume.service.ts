import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UsageLimitsService } from './usage-limits.service';
import { UpgradePromptService } from './upgrade-prompt.service';

export interface BackendResume {
  resumeId: number;
  userId: number;
  title: string;
  targetJobTitle: string;
  templateId: number;
  atsScore: number;
  status: 'DRAFT' | 'COMPLETE' | 'PUBLISHED';
  language: string;
  isPublic: boolean;
  viewCount: number;
  ownerName?: string;
  ownerAvatar?: string;
  sections?: BackendSection[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendSection {
  sectionId: number;
  sectionType: string;
  title: string;
  content: string;
  displayOrder: number;
  isVisible: boolean;
  aiGenerated: boolean;
}

export interface ResumeRequest {
  title: string;
  targetJobTitle?: string;
  templateId: number;
}

export interface SectionRequest {
  sectionType: string;
  title: string;
  content: string;
  displayOrder?: number;
}

export interface SectionOrderRequest {
  sectionId: number;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private http = inject(HttpClient);
  private apiResumes = `${environment.apiBaseUrl}/resumes`;
  private apiSections = `${environment.apiBaseUrl}/sections`;

  private auth = inject(AuthService);
  private usage = inject(UsageLimitsService);
  private upgradePrompt = inject(UpgradePromptService);

  private createLimitError(message: string) {
    return {
      name: 'UsageLimitError',
      message,
      error: { message },
      code: 'USAGE_LIMIT_REACHED',
    };
  }

  private blockIfLimitReached(): boolean {
    if (this.usage.canCreateResumes()) {
      return true;
    }

    this.upgradePrompt.open({
      title: 'You have reached your free resume limit',
      message: 'Free plans include 3 resume creations per month. Upgrade to billing to keep creating resumes.',
      ctaLabel: 'Upgrade to billing',
    });
    return false;
  }

  private trackResumeCreation<T>(request$: Observable<T>): Observable<T> {
    if (!this.blockIfLimitReached()) {
      return throwError(() => this.createLimitError('You have used all 3 free resume creations for this month. Upgrade your plan to continue.'));
    }

    return request$.pipe(tap(() => this.usage.recordResumeCreate('RESUME_CREATE')));
  }

  // Resumes
  createResume(request: ResumeRequest): Observable<BackendResume> {
    return this.trackResumeCreation(this.http.post<BackendResume>(this.apiResumes, request));
  }

  getUserResumes(): Observable<BackendResume[]> {
    return this.http.get<BackendResume[]>(this.apiResumes);
  }

  getResumeById(id: number): Observable<BackendResume> {
    return this.http.get<BackendResume>(`${this.apiResumes}/${id}`);
  }

  updateResume(id: number, request: ResumeRequest): Observable<BackendResume> {
    return this.http.put<BackendResume>(`${this.apiResumes}/${id}`, request);
  }

  deleteResume(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiResumes}/${id}`);
  }

  duplicateResume(id: number): Observable<BackendResume> {
    return this.trackResumeCreation(this.http.post<BackendResume>(`${this.apiResumes}/${id}/duplicate`, {}));
  }

  duplicatePublicResume(id: number): Observable<BackendResume> {
    // Reuses the same endpoint but explicitly for public ones
    return this.trackResumeCreation(this.http.post<BackendResume>(`${this.apiResumes}/${id}/duplicate`, {}));
  }

  publishResume(id: number, isPublic: boolean): Observable<BackendResume> {
    const ownerName = this.auth.user()?.fullName || '';
    const ownerAvatar = this.auth.user()?.profilePicture || '';
    return this.http.put<BackendResume>(`${this.apiResumes}/${id}/publish?isPublic=${isPublic}&ownerName=${ownerName}&ownerAvatar=${ownerAvatar}`, {});
  }

  getPublicResumes(query?: string): Observable<BackendResume[]> {
    const params: Record<string, string> = query ? { q: query } : {};
    return this.http.get<BackendResume[]>(`${this.apiResumes}/public`, { params });
  }

  // Sections
  addSection(resumeId: number, request: SectionRequest): Observable<BackendSection> {
    return this.http.post<BackendSection>(`${this.apiSections}/resume/${resumeId}`, request);
  }

  updateSection(sectionId: number, request: SectionRequest): Observable<BackendSection> {
    return this.http.put<BackendSection>(`${this.apiSections}/${sectionId}`, request);
  }

  deleteSection(sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiSections}/${sectionId}`);
  }

  reorderSections(resumeId: number, requests: SectionOrderRequest[]): Observable<void> {
    return this.http.put<void>(`${this.apiSections}/resume/${resumeId}/reorder`, requests);
  }

  toggleSectionVisibility(sectionId: number, isVisible: boolean): Observable<BackendSection> {
    return this.http.patch<BackendSection>(`${this.apiSections}/${sectionId}/visibility?isVisible=${isVisible}`, {});
  }
}
