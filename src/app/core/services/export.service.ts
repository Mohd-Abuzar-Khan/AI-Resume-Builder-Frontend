import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExportJob {
  jobId: string;
  resumeId: number;
  userId: number;
  format: 'PDF' | 'DOCX' | 'JSON';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string;
  fileSizeKb?: number;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/exports`;

  requestExport(resumeId: number, format: 'PDF' | 'DOCX' | 'JSON'): Observable<ExportJob> {
    return this.http.post<ExportJob>(this.baseUrl, { resumeId, format });
  }

  getJobStatus(jobId: string): Observable<ExportJob> {
    return this.http.get<ExportJob>(`${this.baseUrl}/status/${jobId}`);
  }

  getHistory(): Observable<ExportJob[]> {
    return this.http.get<ExportJob[]>(`${this.baseUrl}/history`);
  }

  startExportJob(resumeId: number, format: string): Observable<ExportJob> {
    return this.requestExport(resumeId, format as any);
  }

  getExportStatus(jobId: string): Observable<ExportJob> {
    return this.getJobStatus(jobId);
  }
}
