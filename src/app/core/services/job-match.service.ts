import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsageLimitsService } from './usage-limits.service';
import { UpgradePromptService } from './upgrade-prompt.service';

export interface JobMatch {
  matchId: number;
  resumeId?: number;
  userId: number;
  jobTitle: string;
  company: string;
  location: string;
  jobDescription?: string;
  applyUrl?: string; // Real redirect URL from Adzuna
  matchScore?: number;
  missingSkills?: string;
  recommendations?: string;
  strengths?: string;
  weaknesses?: string;
  verdict?: string;
  source: 'ADZUNA' | 'LINKEDIN' | 'NAUKRI' | 'MANUAL' | 'JOOBLE';
  matchedAt: string;
  isBookmarked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JobMatchService {
  private http = inject(HttpClient);
  private usage = inject(UsageLimitsService);
  private upgradePrompt = inject(UpgradePromptService);
  private baseUrl = `${environment.apiBaseUrl}/job-matches`;

  private createLimitError(message: string) {
    return {
      name: 'UsageLimitError',
      message,
      error: { message },
      code: 'USAGE_LIMIT_REACHED',
    };
  }

  private blockIfLimitReached(): boolean {
    if (this.usage.canUseAiCalls()) {
      return true;
    }

    this.upgradePrompt.open({
      title: 'You have reached your free AI limit',
      message: 'Free plans include 5 AI calls per month. Upgrade to billing to keep using job analysis.',
      ctaLabel: 'Upgrade to billing',
    });
    return false;
  }

  /**
   * Search for jobs using the new public search endpoint.
   */
  searchJobs(title: string, location: string, country: string = 'in', page: number = 1): Observable<JobMatch[]> {
    let params = new HttpParams()
      .set('title', title)
      .set('location', location)
      .set('country', country)
      .set('page', page.toString());

    return this.http.get<JobMatch[]>(`${this.baseUrl}/search`, { params });
  }


  fetchLinkedIn(title: string, location: string): Observable<JobMatch[]> {
    return this.http.post<JobMatch[]>(`${this.baseUrl}/fetch/linkedin`, { title, location });
  }

  fetchNaukri(title: string, location: string): Observable<JobMatch[]> {
    return this.http.post<JobMatch[]>(`${this.baseUrl}/fetch/naukri`, { title, location });
  }

  analyze(resumeId: number, matchId: number): Observable<JobMatch> {
    if (!this.blockIfLimitReached()) {
      return throwError(() => this.createLimitError('You have used all 5 free AI calls for this month. Upgrade your plan to continue.'));
    }

    // FIX: renamed from reshapeId to resumeId to match backend
    return this.http.post<JobMatch>(`${this.baseUrl}/analyze`, { resumeId, matchId }).pipe(
      tap(() => this.usage.recordAiCall('JOB_ANALYZE'))
    );
  }

  toggleBookmark(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/bookmark`, {});
  }

  getHistory(): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.baseUrl}/history`);
  }

  getBookmarks(): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.baseUrl}/bookmarks`);
  }

  testJooble(title: string, location: string): Observable<any> {
    let params = new HttpParams()
      .set('title', title)
      .set('location', location);
    return this.http.get<any>(`${this.baseUrl}/test-jooble`, { params });
  }
}
