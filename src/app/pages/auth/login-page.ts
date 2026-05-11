import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageShellComponent } from '../../components/page-shell';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PageShellComponent, RouterLink, ReactiveFormsModule, CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-shell innerClassName="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div class="auth-v2-container">
        <!-- Corner Brackets -->
        <div class="auth-v2-bracket auth-v2-bracket-tl"></div>
        <div class="auth-v2-bracket auth-v2-bracket-tr"></div>
        <div class="auth-v2-bracket auth-v2-bracket-bl"></div>
        <div class="auth-v2-bracket auth-v2-bracket-br"></div>

        <!-- Header -->
        <div class="auth-v2-header">
          <div class="auth-v2-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full opacity-80">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 class="auth-v2-title">
            <span class="opacity-40">[</span>
            Create your account
            <span class="opacity-40">]</span>
          </h1>
          <p class="auth-v2-subtitle">
            Join the community of professionals syncing their careers.
          </p>
        </div>

        <!-- Server Error -->
        @if (serverError()) {
          <div class="rounded mb-6 px-4 py-3 text-[12px]"
               style="background:rgba(248,113,113,0.1); color:#F87171; border:1px solid rgba(248,113,113,0.15)">
            {{ serverError() }}
          </div>
        }

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col">
          <!-- Email -->
          <div class="auth-v2-input-group">
            <label for="email" class="auth-v2-label text-white/40">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="Enter your email"
                   class="auth-v2-input" />
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <span class="text-[11px] text-rose-400/80 mt-1 block">Email is required</span>
            }
          </div>

          <!-- Password -->
          <div class="auth-v2-input-group">
            <label for="password" class="auth-v2-label text-white/40">Password</label>
            <div class="relative">
              <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Enter your password"
                     class="auth-v2-input" />
              <button type="button" (click)="showPassword.set(!showPassword())"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                <lucide-icon [name]="showPassword() ? EyeOffIcon : EyeIcon" class="w-3.5 h-3.5"></lucide-icon>
              </button>
            </div>
            @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
              <span class="text-[11px] text-rose-400/80 mt-1 block">Password is required</span>
            }
          </div>

          <!-- Login Button -->
          <button type="submit" [disabled]="isLoading()" class="auth-v2-btn-main">
            @if (isLoading()) { Logging in... } @else { Log in }
          </button>

          <!-- Forgot Password -->
          <button type="button" class="auth-v2-btn-secondary">
            Forgot password
          </button>

          <!-- Divider -->
          <div class="auth-v2-divider"></div>

          <!-- Social / Register -->
          <div class="flex flex-col gap-3">
             <button type="button" (click)="continueWithGoogle()"
                    class="auth-v2-btn-secondary !mt-0 !text-white/60 !border-white/10 hover:!bg-white/5">
              <svg class="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p class="text-center text-[11px] text-white/30 mt-2">
              New here?
              <a routerLink="/auth/register" class="text-white/60 hover:underline ml-1">Create an account</a>
            </p>
          </div>
        </form>
      </div>
    </app-page-shell>
  `,
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  serverError = signal<string | null>(null);
  showPassword = signal(false);

  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      if (this.auth.getRole() === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.serverError.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const role = this.auth.getRole();
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.message || 'Invalid email or password.');
      },
    });
  }

  continueWithGoogle(): void {
    const clientId = '901877572028-p5taqah94hm8lhjrlqhmsgimge3ieuma.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:4200/auth/google';
    const scope = 'email profile openid';
    const responseType = 'id_token';
    const responseMode = 'fragment';
    const nonce = Math.random().toString(36).substring(2);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      response_mode: responseMode,
      scope: scope,
      nonce: nonce
    });

    console.log('Initiating Google OAuth with nonce:', nonce);
    console.log('Redirect URI:', redirectUri);
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
