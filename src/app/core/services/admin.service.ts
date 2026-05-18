import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, forkJoin, map } from 'rxjs';

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  activeUsers: number;
  totalResumes: number;
  publicResumes: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private authAdminUrl = `${environment.apiBaseUrl}/auth/admin`;
  private resumeAdminUrl = `${environment.apiBaseUrl}/resumes/admin`;
  private notifyUrl = `${environment.apiBaseUrl}/notifications`;

  getDashboardStats(): Observable<AdminStats> {
    return forkJoin({
      authStats: this.http.get<any>(`${this.authAdminUrl}/stats`),
      resumeStats: this.http.get<any>(`${this.resumeAdminUrl}/stats`)
    }).pipe(
      map(results => ({
        ...results.authStats,
        ...results.resumeStats
      }))
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.authAdminUrl}/users`);
  }

  updateUserStatus(userId: number, active: boolean): Observable<void> {
    return this.http.put<void>(`${this.authAdminUrl}/users/${userId}/status?active=${active}`, {});
  }

  updateUserPlan(userId: number, plan: string): Observable<void> {
    return this.http.put<void>(`${this.authAdminUrl}/users/${userId}/plan?plan=${plan}`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.authAdminUrl}/users/${userId}`);
  }

  broadcast(title: string, message: string, recipientType: string = 'ALL'): Observable<void> {
    return this.http.post<void>(`${this.notifyUrl}/broadcast?title=${title}&message=${message}&recipientType=${recipientType}`, {});
  }

  promoteToAdmin(userId: number): Observable<void> {
    return this.http.put<void>(`${this.authAdminUrl}/users/${userId}/promote`, {});
  }

  // Payments / Billing
  getAllPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.authAdminUrl}/payments`);
  }

  getPricing(): Observable<{ monthly: number; annual: number }> {
    return this.http.get<{ monthly: number; annual: number }>(`${environment.apiBaseUrl}/billing/pricing`);
  }

  updatePricing(monthly: number, annual: number) {
    return this.http.put<void>(`${environment.apiBaseUrl}/billing/pricing`, { monthly, annual });
  }
}
