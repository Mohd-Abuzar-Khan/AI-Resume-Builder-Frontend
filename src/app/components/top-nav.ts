import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, LogOut, User as UserIcon, LayoutDashboard, Crown } from 'lucide-angular';
import { AuthService } from '../core/services/auth.service';
import { cn } from '../lib/utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="glass-nav px-5 py-2.5 flex items-center justify-between">
      <!-- Left -->
      <a routerLink="/" class="flex items-center gap-1.5 pl-2 pr-3 group cursor-pointer">
        <span class="font-serif-display text-xl text-white/90">Resumade</span>
      </a>

      <!-- Center -->
      <div class="hidden md:flex items-center gap-1">
        @for (link of links; track link.to) {
          <a
            [routerLink]="link.to"
            routerLinkActive="text-white font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-4 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer text-white/50 hover:text-white/80"
          >
            {{ link.label }}
          </a>
        }
      </div>

      <!-- Right -->
      <div class="flex items-center gap-2">
        @if (auth.isLoggedIn()) {
          <div class="relative">
            <button (click)="toggleDropdown()" class="outline-none cursor-pointer relative group">
              <div class="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden transition-colors border border-white/10">
                <div [class]="cn('text-xs font-medium h-full w-full flex items-center justify-center transition-all',
                    auth.user()?.plan === 'PREMIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/90')">
                  {{ auth.user()?.initials }}
                </div>
              </div>
              @if (auth.user()?.plan === 'PREMIUM') {
                <div class="absolute -top-1.5 -right-1.5 rounded-full p-0.5 shadow-lg bg-amber-600 border border-white/20">
                  <lucide-icon [name]="CrownIcon" class="h-3 w-3 text-white" [strokeWidth]="3"></lucide-icon>
                </div>
              }
            </button>

            @if (dropdownOpen()) {
              <div class="absolute right-0 mt-2 w-56 glass-modal rounded-xl p-1 shadow-xl z-50 animate-fade-up border border-white/10">
                <div class="px-3 py-2 border-b border-white/5">
                  <span class="text-[14px] font-medium block text-white/90">{{ auth.user()?.fullName }}</span>
                  <span class="text-[12px] opacity-40">{{ auth.user()?.email }}</span>
                </div>
                <a [routerLink]="dashboardLink()" (click)="dropdownOpen.set(false)"
                   class="w-full flex items-center px-3 py-2 text-[13px] rounded-lg transition-colors cursor-pointer text-white/70 hover:bg-white/5">
                  <lucide-icon [name]="DashboardIcon" class="mr-2 h-4 w-4 opacity-40"></lucide-icon>
                  Dashboard
                </a>
                <button (click)="signOut()"
                   class="w-full flex items-center px-3 py-2 text-[13px] rounded-lg transition-colors cursor-pointer text-red-400 hover:bg-red-500/10">
                  <lucide-icon [name]="LogOutIcon" class="mr-2 h-4 w-4"></lucide-icon>
                  Sign out
                </button>
              </div>
            }
          </div>
        } @else {
          <a
            routerLink="/auth/login"
            class="btn-secondary text-[13px] !py-1.5"
          >
            Sign in
          </a>
        }

        <!-- Mobile Menu Toggle -->
        <button (click)="toggleMobileMenu()" class="md:hidden rounded-lg p-2 cursor-pointer hover:bg-white/5 text-white/50">
          <lucide-icon [name]="MenuIcon" class="h-5 w-5"></lucide-icon>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    @if (mobileMenuOpen()) {
      <div class="fixed inset-0 z-[60] md:hidden">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" (click)="toggleMobileMenu()"></div>
        <div class="fixed right-0 top-0 bottom-0 w-72 glass-modal p-6 shadow-2xl animate-fade-up">
          <div class="flex flex-col gap-2 mt-8">
            @for (link of links; track link.to) {
              <a [routerLink]="link.to" (click)="toggleMobileMenu()"
                 class="px-4 py-3 rounded-lg text-[15px] transition-colors cursor-pointer hover:bg-white/5 text-white/70">
                {{ link.label }}
              </a>
            }
            @if (auth.isLoggedIn()) {
              <a [routerLink]="dashboardLink()" (click)="toggleMobileMenu()"
                 class="px-4 py-3 rounded-lg text-[15px] transition-colors cursor-pointer hover:bg-white/5 text-white/70">
                Dashboard
              </a>
              <button (click)="signOut(); toggleMobileMenu()"
                      class="px-4 py-3 rounded-lg text-[15px] transition-colors cursor-pointer text-left text-red-400 hover:bg-red-500/10">
                Sign out
              </button>
            } @else {
              <a routerLink="/auth/login" (click)="toggleMobileMenu()"
                 class="px-4 py-3 rounded-lg text-[15px] transition-colors cursor-pointer hover:bg-white/5 text-white/70">
                Sign in
              </a>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class TopNavComponent {
  auth = inject(AuthService);

  readonly MenuIcon = Menu;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = UserIcon;
  readonly DashboardIcon = LayoutDashboard;
  readonly CrownIcon = Crown;
  cn = cn;

  dropdownOpen = signal(false);
  mobileMenuOpen = signal(false);

  dashboardLink = computed(() => {
    return this.auth.user()?.role === 'ADMIN' ? '/admin' : '/dashboard';
  });

  links = [
    { to: '/explore', label: 'Explore' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/community', label: 'Community' },
  ];

  toggleDropdown() { this.dropdownOpen.update(v => !v); }
  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }

  signOut() {
    this.auth.logout();
    this.dropdownOpen.set(false);
  }
}
