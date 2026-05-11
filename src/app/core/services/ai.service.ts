import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsageLimitsService } from './usage-limits.service';
import { UpgradePromptService } from './upgrade-prompt.service';

export interface AtsReport {
  score: number;
  breakdown: ScoreBreakdown;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: AtsSuggestion[];
  verdict: string;
}

export interface ScoreBreakdown {
  keywordMatch: CategoryScore;
  experienceRelevance: CategoryScore;
  quantifiedAchievements: CategoryScore;
  formatReadability: CategoryScore;
  summaryAlignment: CategoryScore;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  matchRate?: number | null;
}

export interface AtsSuggestion {
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  category: string;
  action: string;
}

export interface AiOptionsResponse {
  options: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private usage = inject(UsageLimitsService);
  private upgradePrompt = inject(UpgradePromptService);
  private baseUrl = `${environment.apiBaseUrl}/ai`;

  private createLimitError(message: string) {
    return {
      name: 'UsageLimitError',
      message,
      error: { message },
      code: 'USAGE_LIMIT_REACHED',
    };
  }

  private blockIfLimitReached(feature: string) {
    if (this.usage.canUseAiCalls()) {
      return true;
    }

    this.upgradePrompt.open({
      title: 'You have reached your free AI limit',
      message: 'Free plans include 5 AI calls per month. Upgrade to billing to keep using AI tools.',
      ctaLabel: 'Upgrade to billing',
    });
    return false;
  }

  private trackAiCall<T>(feature: string, request$: Observable<T>): Observable<T> {
    if (!this.blockIfLimitReached(feature)) {
      return throwError(() => this.createLimitError('You have used all 5 free AI calls for this month. Upgrade your plan to continue.'));
    }

    return request$.pipe(tap(() => this.usage.recordAiCall(feature)));
  }

  generateSummary(resumeId: number, jobTitle: string, yearsExp: number): Observable<AiOptionsResponse> {
    return this.trackAiCall('SUMMARY', this.http.post<AiOptionsResponse>(`${this.baseUrl}/summary`, { resumeId, jobTitle, yearsExp }));
  }

  generateBullets(resumeId: number, jobRole: string, company: string): Observable<string> {
    return this.trackAiCall('BULLETS', this.http.post<string>(`${this.baseUrl}/bullets`, { resumeId, jobRole, company }, { responseType: 'text' as 'json' }));
  }

  checkAts(resumeId: number, resumeContent: string, jobDescription: string): Observable<AtsReport> {
    return this.trackAiCall('ATS_CHECK', this.http.post<AtsReport>(`${this.baseUrl}/ats-check`, { resumeId, resumeContent, jobDescription }));
  }

  suggestSkills(jobTitle: string): Observable<string[]> {
    return this.trackAiCall('SUGGEST_SKILLS', this.http.get<string[]>(`${this.baseUrl}/suggest-skills`, { params: { jobTitle } }));
  }

  generateSectionContent(sectionType: string, context: string): Observable<{content: string}> {
    return this.trackAiCall('GENERATE_SECTION', this.http.post<{content: string}>(`${this.baseUrl}/generate-section`, { sectionType, context }));
  }

  enhanceText(content: string, tone: string = 'professional'): Observable<AiOptionsResponse> {
    return this.trackAiCall('ENHANCE_TEXT', this.http.post<AiOptionsResponse>(`${this.baseUrl}/improve-section`, { content, tone }));
  }

  testAi(prompt: string): Observable<string> {
    return this.trackAiCall('TEST_AI', this.http.post<string>(`${this.baseUrl}/test`, { prompt }, { responseType: 'text' as 'json' }));
  }

  generateCoverLetter(resumeId: number, resumeContent: string, jobDescription: string): Observable<string> {
    return this.trackAiCall('COVER_LETTER', this.http.post<string>(`${this.baseUrl}/cover-letter`, { resumeId, resumeContent, jobDescription }, { responseType: 'text' as 'json' }));
  }

  tailorResume(resumeId: number, resumeContent: string, jobDescription: string): Observable<string> {
    return this.trackAiCall('TAILOR_RESUME', this.http.post<string>(`${this.baseUrl}/tailor`, { resumeId, resumeContent, jobDescription }, { responseType: 'text' as 'json' }));
  }

  // SSE Streaming for real-time text generation
  streamAiResponse(prompt: string, type: string): Observable<string> {
    if (!this.blockIfLimitReached('STREAM_AI')) {
      return throwError(() => this.createLimitError('You have used all 5 free AI calls for this month. Upgrade your plan to continue.'));
    }

    this.usage.recordAiCall('STREAM_AI');

    return new Observable<string>(observer => {
      const eventSource = new EventSource(`${this.baseUrl}/stream?prompt=${encodeURIComponent(prompt)}&type=${type}`);
      
      eventSource.onmessage = (event) => {
        observer.next(event.data);
      };

      eventSource.onerror = (error) => {
        if (eventSource.readyState === EventSource.CLOSED) {
          observer.complete();
        } else {
          observer.error(error);
          eventSource.close();
        }
      };

      return () => {
        eventSource.close();
      };
    });
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`);
  }
}
