import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { AiService } from '../core/services/ai.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { PopupService } from '../core/services/popup.service';
import { cn } from '../lib/utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[800px] grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-up">
      
      <!-- Main Settings -->
      <div class="lg:col-span-7 space-y-10">
        <!-- Personal Info Section -->
        <div>
          <h2 class="text-[15px] font-medium mb-6 text-white/90">Personal information</h2>
          
          <!-- Profile Picture Selection -->
          <div class="mb-8">
            <label class="text-[12px] block mb-3 text-white/40 uppercase tracking-widest">Profile Picture</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-4">
              @for (pfp of profilePictures; track pfp) {
                <button (click)="selectProfilePicture(pfp)" 
                        [class]="cn('relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer',
                                profileData.profilePicture === pfp ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/5 hover:border-white/20')">
                  <img [src]="'/' + pfp" class="w-full h-full object-cover p-1" />
                  @if (profileData.profilePicture === pfp) {
                    <div class="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                      <div class="bg-indigo-500 rounded-full p-1">
                        <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  }
                </button>
              }
            </div>
          </div>

          <div class="space-y-5">
            <!-- Full Name -->
            <div>
              <label class="text-[12px] block mb-1.5 text-white/40 uppercase tracking-widest">Full name</label>
              <input type="text" [(ngModel)]="profileData.fullName" class="glass-input w-full" />
            </div>
            <!-- Email -->
            <div>
              <label class="text-[12px] block mb-1.5 text-white/40 uppercase tracking-widest">Email</label>
              <input type="email" [(ngModel)]="profileData.email" class="glass-input w-full text-white/60" />
            </div>
            <!-- Phone -->
            <div>
              <label class="text-[12px] block mb-1.5 text-white/40 uppercase tracking-widest">Phone</label>
              <input type="tel" [(ngModel)]="profileData.phone" placeholder="" class="glass-input w-full" />
            </div>
            <div class="flex justify-end">
              <button (click)="saveProfile()" [disabled]="isSaving()" class="btn-primary text-[13px]">
                {{ isSaving() ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Account Section -->
        <div>
          <h2 class="text-[15px] font-medium mb-6 text-white/90">Account</h2>
          <div class="space-y-4">
            <!-- Subscription -->
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2">
                <span class="text-[14px] text-white/80">Subscription</span>
                <span class="glass-badge"
                      [style.color]="auth.user()?.plan === 'PREMIUM' ? '#FCD34D' : 'rgba(255,255,255,0.4)'"
                      [style.border-color]="auth.user()?.plan === 'PREMIUM' ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'">
                  {{ auth.user()?.plan }}
                </span>
              </div>
              <a routerLink="/pricing" class="text-[13px] hover:underline text-indigo-400">Manage</a>
            </div>

            <!-- Password -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <span class="text-[14px] text-white/80">Password</span>
                <button (click)="showPasswordFields.set(!showPasswordFields())" 
                        class="text-[13px] hover:underline cursor-pointer text-indigo-400">
                  {{ showPasswordFields() ? 'Cancel' : 'Change password' }}
                </button>
              </div>
              
              @if (showPasswordFields()) {
                <div class="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-fade-in">
                  <div class="relative">
                    <input [type]="showCurrentPassword() ? 'text' : 'password'" [(ngModel)]="passwordData.current" placeholder="Current password" class="glass-input w-full text-[13px] pr-10" />
                    <button type="button" (click)="showCurrentPassword.set(!showCurrentPassword())"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      <lucide-icon [name]="showCurrentPassword() ? EyeOffIcon : EyeIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                  </div>
                  <div class="relative">
                    <input [type]="showNewPassword() ? 'text' : 'password'" [(ngModel)]="passwordData.new" placeholder="New password" class="glass-input w-full text-[13px] pr-10" />
                    <button type="button" (click)="showNewPassword.set(!showNewPassword())"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      <lucide-icon [name]="showNewPassword() ? EyeOffIcon : EyeIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                  </div>
                  <div class="relative">
                    <input [type]="showConfirmPassword() ? 'text' : 'password'" [(ngModel)]="passwordData.confirm" placeholder="Confirm new password" class="glass-input w-full text-[13px] pr-10" />
                    <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      <lucide-icon [name]="showConfirmPassword() ? EyeOffIcon : EyeIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                  </div>
                  <button (click)="updatePassword()" [disabled]="isChangingPassword()" class="btn-primary w-full text-[12px] py-2">
                    Update Password
                  </button>
                </div>
              }
            </div>

            <!-- Danger zone -->
            <div class="border-t pt-4 mt-4 border-white/5">
              <button (click)="deactivateAccount()" class="text-[13px] cursor-pointer hover:underline text-rose-400">
                Deactivate account
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Generation History -->
      <div class="lg:col-span-5">
        <div class="glass-card p-6 rounded-2xl sticky top-6">
          <h2 class="text-[15px] font-medium mb-4 text-white/90">Recent AI Activity</h2>
          
          <div class="space-y-4">
            @for (item of aiHistory(); track item.requestId) {
              <div class="flex items-start gap-3 pb-4 border-b last:border-0 border-white/5">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                     style="background:rgba(79,209,197,0.1); color:#4FD1C5">
                  <span class="text-[10px] font-bold">{{ item.requestType.substring(0,2) }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-[13px] font-medium truncate text-white/90">{{ item.requestType | titlecase }}</p>
                  <p class="text-[11px] text-white/40">{{ item.createdAt | date:'MMM d, h:mm a' }}</p>
                </div>
                <div class="ml-auto text-[11px] font-medium" 
                     [style.color]="item.status === 'COMPLETED' ? '#4FD1C5' : '#F87171'">
                  {{ item.status === 'COMPLETED' ? 'Done' : 'Failed' }}
                </div>
              </div>
            } @empty {
              <div class="py-8 text-center">
                <p class="text-[12px] text-white/30">No recent activity.</p>
              </div>
            }
          </div>

          <div class="mt-6 pt-4 border-t border-white/5">
            <div class="flex justify-between items-center text-[12px]">
              <span class="text-white/40">Total Generations</span>
              <span class="font-medium text-white/90">{{ aiHistory().length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfilePageComponent implements OnInit {
  auth = inject(AuthService);
  aiService = inject(AiService);
  private popup = inject(PopupService);

  isSaving = signal(false);
  isChangingPassword = signal(false);
  showPasswordFields = signal(false);
  aiHistory = signal<any[]>([]);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  cn = cn;

  profileData = {
    fullName: '',
    email: '',
    phone: '',
    profilePicture: ''
  };

  readonly profilePictures = [
    '5e53523cf3aa4b6f462b2ec0_peep-17.svg',
    '5e5354a47488c290a747829e_peep-31.svg',
    '5e53573df5fa1a2163f8ed70_peep-48.svg',
    '5e535935f5fa1a5daffaf786_peep-65.svg',
    '5e535c42c67e79a7a6962d19_peep-91.svg',
    '5e535d14550b766b43f85cf9_peep-98.svg'
  ];

  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.profileData.fullName = user.fullName;
      this.profileData.email = user.email;
      this.profileData.profilePicture = user.profilePicture || '';
    }
    this.loadAiHistory();
  }

  selectProfilePicture(pfp: string) {
    this.profileData.profilePicture = pfp;
  }

  loadAiHistory() {
    this.aiService.getHistory().subscribe(history => {
      this.aiHistory.set(history.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
    });
  }

  saveProfile() {
    const user = this.auth.user();
    if (!user) return;
    
    this.isSaving.set(true);
    this.auth.updateProfile(user.userId, this.profileData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.popup.success('Profile Updated', 'Your profile information has been updated successfully!');
      },
      error: () => this.isSaving.set(false)
    });
  }

  updatePassword() {
    const user = this.auth.user();
    if (!user) return;

    if (this.passwordData.new !== this.passwordData.confirm) {
      this.popup.error('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    this.isChangingPassword.set(true);
    this.auth.changePassword(user.userId, {
      currentPassword: this.passwordData.current,
      newPassword: this.passwordData.new,
      confirmPassword: this.passwordData.confirm
    }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.showPasswordFields.set(false);
        this.passwordData = { current: '', new: '', confirm: '' };
        this.popup.success('Password Changed', 'Your password has been updated successfully!');
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.popup.error('Error', err.error?.message || 'Failed to change password. Please verify your current password.');
      }
    });
  }

  deactivateAccount() {
    const user = this.auth.user();
    if (!user) return;

    this.popup.confirm(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action cannot be undone and you will lose access to all your resumes.',
      () => {
        this.auth.deactivateAccount(user.userId).subscribe({
          next: () => {
            this.popup.info('Account Deactivated', 'Your account has been deactivated. You will be logged out.');
            this.auth.logout();
          },
          error: () => this.popup.error('Error', 'Failed to deactivate account. Please try again later.')
        });
      }
    );
  }
}
