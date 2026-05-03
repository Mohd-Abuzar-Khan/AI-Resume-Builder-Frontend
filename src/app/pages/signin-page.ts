import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PageShellComponent } from '../components/page-shell';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [PageShellComponent, RouterLink, CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-shell innerClassName="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl sm:text-5xl text-on-glass font-medium leading-tight">
            Welcome <em class="italic font-serif-display font-normal text-on-glass/80">back</em>
          </h1>
          <p class="text-base text-on-glass-muted mt-6 leading-relaxed">
            Sign in to continue building your perfect resume
          </p>
        </div>

        <!-- Form Card -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="glass rounded-3xl p-8 sm:p-10 flex flex-col gap-6 backdrop-blur">
          <!-- Server Error -->
          @if (serverError()) {
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-600 text-sm">
              {{ serverError() }}
            </div>
          }

          <!-- Email Field -->
          <div class="flex flex-col gap-3">
            <label for="email" class="text-on-glass text-sm font-semibold tracking-wide">
              Email address
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder=""
              class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass placeholder:text-on-glass/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
            />
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <span class="text-red-500 text-xs">Email is required</span>
            }
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <span class="text-red-500 text-xs">Please enter a valid email</span>
            }
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <label for="password" class="text-on-glass text-sm font-semibold tracking-wide">
                Password
              </label>
              <a href="#" class="text-xs text-on-glass/60 hover:text-on-glass transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder=""
              class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass placeholder:text-on-glass/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
            />
            @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
              <span class="text-red-500 text-xs">Password is required</span>
            }
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            [disabled]="isLoading()"
            class="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 h-12 mt-2 font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isLoading()) {
              Signing in...
            } @else {
              Sign in
            }
          </button>

          <!-- Divider -->
          <div class="relative my-2 text-center">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-white/15"></span>
            </div>
            <span class="relative bg-transparent px-3 tracked-caps text-on-glass-muted text-xs">
              or continue with
            </span>
          </div>

          <!-- Google Button -->
          <button
            type="button"
            class="rounded-full h-12 bg-white/10 border border-white/20 text-on-glass hover:bg-white/15 backdrop-blur font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
            (click)="continueWithGoogle()"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
            </svg>
            Google
          </button>

          <!-- Sign Up Link -->
          <p class="text-center text-sm text-on-glass-muted mt-6 leading-relaxed">
            New here?
            <a routerLink="/auth/register" class="text-on-glass font-semibold hover:underline transition-colors">
              Create an account
            </a>
          </p>
        </form>
      </div>
    </app-page-shell>
  `,
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  serverError = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth.login({
      email: email!,
      password: password!,
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.message || 'Invalid email or password.');
      },
    });
  }

  continueWithGoogle() {
    // TODO: Implement Google OAuth login
    this.serverError.set('Google login coming soon');
  }
}
