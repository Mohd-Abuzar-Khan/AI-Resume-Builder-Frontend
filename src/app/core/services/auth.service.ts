import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, interval, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

export const TOKEN_KEY = 'resumade_token';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  profilePicture?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  plan: string;
  profilePicture?: string;
}

export interface UserInfo {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  plan: string;
  initials: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user = signal<UserInfo | null>(null);
  user = this._user.asReadonly();
  currentUserProfile = computed(() => this._user());

  isLoggedIn = computed(() => this._user() !== null);
  private profileSyncSub: Subscription | null = null;
  private readonly profileSyncIntervalMs = 15000;

  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
    this.startProfileSyncIfNeeded();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }

  googleLogin(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/google`, { token }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}).subscribe({ error: () => {} });
    }
    this.clearAuth();
    this.router.navigate(['/']);
  }

  handleUnauthorized(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.stopProfileSync();
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {}).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const exp = payload['exp'] as number;
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserId(): number | null {
    return this._user()?.userId ?? null;
  }

  getRole(): string | null {
    return this._user()?.role ?? null;
  }

  getPlan(): string | null {
    return this._user()?.plan ?? null;
  }

  private handleAuthResponse(response: AuthResponse): void {
    console.log('[Auth] Response received:', response);
    
    if (!response) return;

    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
    }

    const currentToken = this.getToken();
    if (!currentToken) {
      this.clearAuth();
      return;
    }

    this._user.set({
      userId: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
      plan: response.plan,
      initials: this.getInitials(response.fullName),
      profilePicture: response.profilePicture,
    });
    this.startProfileSyncIfNeeded();
    console.log('[Auth] User session updated:', this._user());
  }

  refreshProfile(): Observable<AuthResponse> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('Not logged in'));
    
    return this.http.get<AuthResponse>(`${this.baseUrl}/profile/${userId}`).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }

  updateProfile(id: number, data: any): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.baseUrl}/profile/${id}`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  changePassword(id: number, data: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/password/${id}`, data);
  }

  deactivateAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deactivate/${id}`).pipe(
      tap(() => this.logout())
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forgot-password?email=${email}`, {});
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, request);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token || token === 'undefined' || token === 'null') {
      return;
    }

    try {
      const payload = this.decodeToken(token);
      const exp = payload['exp'] as number;

      if (Date.now() >= exp * 1000) {
        localStorage.removeItem(TOKEN_KEY);
        return;
      }

      this._user.set({
        userId: payload['userId'] as number,
        fullName: payload['fullName'] as string,
        email: payload['sub'] as string,
        role: payload['role'] as string,
        plan: payload['plan'] as string,
        initials: this.getInitials(payload['fullName'] as string),
        profilePicture: payload['profilePicture'] as string,
      });
      this.startProfileSyncIfNeeded();
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.isAuthenticated() && this.getUserId() !== null) {
      this.refreshProfile().subscribe({ error: () => {} });
    }
  };

  private startProfileSyncIfNeeded(): void {
    if (this.profileSyncSub || !this.isAuthenticated() || this.getUserId() === null) {
      return;
    }

    this.profileSyncSub = interval(this.profileSyncIntervalMs).subscribe(() => {
      if (document.visibilityState !== 'visible' || !this.isAuthenticated() || this.getUserId() === null) {
        return;
      }
      this.refreshProfile().subscribe({ error: () => {} });
    });
  }

  private stopProfileSync(): void {
    if (this.profileSyncSub) {
      this.profileSyncSub.unsubscribe();
      this.profileSyncSub = null;
    }
  }

  private decodeToken(token: string): Record<string, unknown> {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    return JSON.parse(jsonPayload);
  }

  private getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}
