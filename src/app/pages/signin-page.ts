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
  template: `
    <app-page-shell innerClassName="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl sm:text-5xl text-on-glass font-medium leading-tight">
            @if (view() === 'login') {
              Welcome <em class="italic font-serif-display font-normal text-on-glass/80">back</em>
            } @else if (view() === 'forgot-password') {
              Forgot <em class="italic font-serif-display font-normal text-on-glass/80">password?</em>
            } @else {
              Reset <em class="italic font-serif-display font-normal text-on-glass/80">password</em>
            }
          </h1>
          <p class="text-base text-on-glass-muted mt-6 leading-relaxed">
            @if (view() === 'login') {
              Sign in to continue building your perfect resume
            } @else if (view() === 'forgot-password') {
              Enter your email and we'll send you an OTP to reset your password
            } @else {
              Enter the OTP sent to your email and choose a new password
            }
          </p>
        </div>

        <!-- Form Card -->
        <div class="glass rounded-3xl p-8 sm:p-10 backdrop-blur transition-all duration-500">
          <!-- Server Error -->
          @if (serverError()) {
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-600 text-sm mb-6">
              {{ serverError() }}
            </div>
          }

          <!-- Success Message -->
          @if (successMessage()) {
            <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-600 text-sm mb-6">
              {{ successMessage() }}
            </div>
          }

          @if (view() === 'login') {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
              <!-- Email Field -->
              <div class="flex flex-col gap-3">
                <label for="email" class="text-on-glass text-sm font-semibold tracking-wide">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass placeholder:text-on-glass/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>

              <!-- Password Field -->
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <label for="password" class="text-on-glass text-sm font-semibold tracking-wide">
                    Password
                  </label>
                  <a (click)="showForgotPassword()" class="text-xs text-on-glass/60 hover:text-on-glass transition-colors cursor-pointer">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass placeholder:text-on-glass/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>

              <!-- Sign In Button -->
              <button
                type="submit"
                [disabled]="isLoading()"
                class="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 h-12 mt-2 font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading() ? 'Signing in...' : 'Sign in' }}
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
          } @else if (view() === 'forgot-password') {
            <form [formGroup]="forgotPasswordForm" (ngSubmit)="onForgotPasswordSubmit()" class="flex flex-col gap-6">
              <div class="flex flex-col gap-3">
                <label for="forgot-email" class="text-on-glass text-sm font-semibold tracking-wide">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  formControlName="email"
                  class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass placeholder:text-on-glass/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>

              <button
                type="submit"
                [disabled]="isLoading()"
                class="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 h-12 mt-2 font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading() ? 'Sending OTP...' : 'Send OTP' }}
              </button>

              <button type="button" (click)="showLogin()" class="text-sm text-on-glass-muted hover:text-on-glass transition-colors text-center">
                Back to Sign in
              </button>
            </form>
          } @else if (view() === 'reset-password') {
            <form [formGroup]="resetPasswordForm" (ngSubmit)="onResetPasswordSubmit()" class="flex flex-col gap-6">
              <!-- OTP Field -->
              <div class="flex flex-col gap-3">
                <label for="otp" class="text-on-glass text-sm font-semibold tracking-wide">
                  6-Digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  formControlName="otp"
                  maxlength="6"
                  placeholder="000000"
                  class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass text-center text-2xl tracking-[1rem] placeholder:text-on-glass/20 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>

              <!-- New Password -->
              <div class="flex flex-col gap-3">
                <label for="newPassword" class="text-on-glass text-sm font-semibold tracking-wide">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>

              <!-- Confirm Password -->
              <div class="flex flex-col gap-3">
                <label for="confirmPassword" class="text-on-glass text-sm font-semibold tracking-wide">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-on-glass backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>

              <button
                type="submit"
                [disabled]="isLoading()"
                class="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 h-12 mt-2 font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading() ? 'Resetting Password...' : 'Reset Password' }}
              </button>

              <button type="button" (click)="showLogin()" class="text-sm text-on-glass-muted hover:text-on-glass transition-colors text-center">
                Cancel
              </button>
            </form>
          }
        </div>
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
  successMessage = signal<string | null>(null);
  view = signal<'login' | 'forgot-password' | 'reset-password'>('login');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetPasswordForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
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

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);
    const email = this.forgotPasswordForm.get('email')?.value!;

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.view.set('reset-password');
        this.successMessage.set('OTP has been sent to your email.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.message || 'Failed to send OTP. Please try again.');
      },
    });
  }

  onResetPasswordSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const { otp, newPassword, confirmPassword } = this.resetPasswordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.serverError.set('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);
    const email = this.forgotPasswordForm.get('email')?.value || this.form.get('email')?.value!;

    this.auth.resetPassword({
      email,
      token: otp!,
      newPassword: newPassword!,
      confirmPassword: confirmPassword!,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.view.set('login');
        this.successMessage.set('Password reset successfully. You can now sign in.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.message || 'Failed to reset password. Please check your OTP.');
      },
    });
  }

  showForgotPassword(): void {
    console.log('Switching to forgot-password view');
    this.view.set('forgot-password');
    this.serverError.set(null);
    this.successMessage.set(null);
  }

  showLogin(): void {
    this.view.set('login');
    this.serverError.set(null);
    this.successMessage.set(null);
  }

  continueWithGoogle() {
    this.serverError.set('Google login coming soon');
  }
}
