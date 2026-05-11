import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PageShellComponent } from '../../components/page-shell';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [PageShellComponent],
  template: `
    <app-page-shell innerClassName="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h2 class="text-2xl text-on-glass font-medium mb-4">Verifying with Google...</h2>
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    </app-page-shell>
  `
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit(): void {
    // Google returns fragment for id_token
    console.log('Google callback component initialized');
    console.log('Full URL:', window.location.href);
    console.log('Hash:', window.location.hash);

    const fragment = window.location.hash.substring(1);
    console.log('Fragment (after #):', fragment);

    if (!fragment) {
      console.warn('Google callback: No hash fragment received');
      this.router.navigate(['/auth/login'], { queryParams: { error: 'no_token' } });
      return;
    }

    const params = new URLSearchParams(fragment);
    console.log('Parsed params:', {
      hasIdToken: params.has('id_token'),
      hasError: params.has('error'),
      paramKeys: Array.from(params.keys())
    });

    const idToken = params.get('id_token');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      console.warn('Google OAuth error:', error, errorDescription);
      this.router.navigate(['/auth/login'], { queryParams: { error: 'google_' + error } });
      return;
    }

    if (!idToken) {
      console.warn('Google callback: No id_token in hash fragment');
      console.log('Available params:', Array.from(params.entries()));
      this.router.navigate(['/auth/login'], { queryParams: { error: 'no_token' } });
      return;
    }

    console.log('Token extracted successfully');
    console.log('Token length:', idToken.length);
    console.log('Token preview (first 50 chars):', idToken.substring(0, 50));
    console.log('Token format valid:', idToken.includes('.') && idToken.split('.').length === 3 ? 'YES (JWT format)' : 'NO (not JWT)');

    console.log('Sending token to backend for verification...');
    this.auth.googleLogin(idToken).subscribe({
      next: (response) => {
        console.log('Google login successful', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Google login verification failed');
        console.error('Error status:', err.status);
        console.error('Error message:', err.error?.message || err.message);
        console.error('Full error:', err);
        this.router.navigate(['/auth/login'], { queryParams: { error: 'token_verification_failed' } });
      }
    });
  }
}
