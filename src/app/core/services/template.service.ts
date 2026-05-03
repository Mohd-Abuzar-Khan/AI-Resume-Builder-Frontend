import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface BackendTemplate {
  templateId?: number;
  name: string;
  description: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  layoutConfig?: string;
  // Aesthetic Metadata
  colorScheme?: string;
  fontFamily?: string;
  layout?: string;
  hasPhoto?: boolean;
  hasSkillBars?: boolean;
  previewData?: string;
}

export interface TemplateUpsertRequest {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  htmlLayout?: string;
  cssStyles?: string;
  category?: string;
  isPremium?: boolean;
  isActive?: boolean;
  layoutConfig?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/templates`;

  getAllTemplates(): Observable<BackendTemplate[]> {
    return this.http.get<BackendTemplate[]>(this.apiUrl);
  }

  getFreeTemplates(): Observable<BackendTemplate[]> {
    return this.http.get<BackendTemplate[]>(`${this.apiUrl}/free`);
  }

  getPremiumTemplates(): Observable<BackendTemplate[]> {
    return this.http.get<BackendTemplate[]>(`${this.apiUrl}/premium`);
  }

  getTemplatesByCategory(category: string): Observable<BackendTemplate[]> {
    return this.http.get<BackendTemplate[]>(`${this.apiUrl}/category/${category}`);
  }

  getPopularTemplates(): Observable<BackendTemplate[]> {
    return this.http.get<BackendTemplate[]>(`${this.apiUrl}/popular`);
  }

  getTemplateById(id: number): Observable<BackendTemplate> {
    return this.http.get<BackendTemplate>(`${this.apiUrl}/${id}`);
  }

  // Admin Methods
  createTemplate(template: TemplateUpsertRequest): Observable<BackendTemplate> {
    const role = localStorage.getItem('role') || 'ADMIN';
    const headers = new HttpHeaders().set('X-User-Role', role);
    return this.http.post<BackendTemplate>(this.apiUrl, template, { headers });
  }

  updateTemplate(id: number, template: TemplateUpsertRequest): Observable<BackendTemplate> {
    const role = localStorage.getItem('role') || 'ADMIN';
    const headers = new HttpHeaders().set('X-User-Role', role);
    return this.http.put<BackendTemplate>(`${this.apiUrl}/${id}`, template, { headers });
  }

  deactivateTemplate(id: number): Observable<void> {
    const role = localStorage.getItem('role') || 'ADMIN';
    const headers = new HttpHeaders().set('X-User-Role', role);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
