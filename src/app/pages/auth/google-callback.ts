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
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const idToken = params.get('id_token');

    if (idToken) {
      this.auth.googleLogin(idToken).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Google login failed', err);
          this.router.navigate(['/auth/login'], { queryParams: { error: 'google_failed' } });
        }
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
