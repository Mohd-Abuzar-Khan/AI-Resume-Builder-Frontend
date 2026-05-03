import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  FileSearch, 
  Scissors, 
  Briefcase, 
  Users, 
  Compass, 
  CreditCard 
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      [class]="'flex flex-col h-screen glass-sidebar z-50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ' + 
               (collapsed() ? 'w-[64px] items-center px-2' : 'w-[240px] px-3')"
    >
      <!-- Logo Area / Toggle -->
      <div [class]="'w-full flex pt-8 pb-6 ' + (collapsed() ? 'justify-center' : 'justify-between items-center px-3')">
        @if (!collapsed()) {
          <a routerLink="/" class="flex items-center cursor-pointer">
            <span class="Resumade-logo font-serif-display text-[26px] leading-none text-white/90">Resumade</span>
          </a>
        }
        <button
          (click)="toggleCollapsed()"
          class="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/40 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <lucide-icon [name]="collapsed() ? ChevronRightIcon : ChevronLeftIcon" class="h-4 w-4"></lucide-icon>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 w-full pt-4 overflow-y-auto custom-scrollbar">
        <!-- Main group -->
        <ul class="space-y-1">
          @for (item of mainItems(); track item.label) {
            <li [title]="collapsed() ? item.label : ''">
              <a
                [routerLink]="item.path"
                routerLinkActive="nav-active"
                [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' || item.path === '/admin' }"
                [class]="'flex items-center gap-3 rounded-lg py-2.5 font-mono text-[11px] tracking-[0.18em] transition-all cursor-pointer ' + 
                         (collapsed() ? 'justify-center px-0' : 'px-4')"
                style="color:rgba(255,255,255,0.45)"
              >
                <lucide-icon [name]="getIcon(item.label)" class="h-4 w-4 shrink-0"></lucide-icon>
                @if (!collapsed()) {
                  <span>{{ item.label | uppercase }}</span>
                }
              </a>
            </li>
          }
        </ul>

        @if (!collapsed()) {
          <div class="mt-8 px-4 font-mono text-[10px] tracking-[0.22em] text-white/25">
            DISCOVER
          </div>
        } @else {
          <div class="my-4 border-t border-white/5 w-8 mx-auto"></div>
        }

        <ul class="mt-2 space-y-1">
          @for (item of discoverItems; track item.label) {
            <li [title]="collapsed() ? item.label : ''">
              <a
                [routerLink]="item.path"
                routerLinkActive="nav-active"
                [class]="'flex items-center gap-3 rounded-lg py-2.5 font-mono text-[11px] tracking-[0.18em] transition-all cursor-pointer ' + 
                         (collapsed() ? 'justify-center px-0' : 'px-4')"
                style="color:rgba(255,255,255,0.45)"
              >
                <lucide-icon [name]="getIcon(item.label)" class="h-4 w-4 shrink-0"></lucide-icon>
                @if (!collapsed()) {
                  <span>{{ item.label | uppercase }}</span>
                }
              </a>
            </li>
          }
        </ul>

        @if (!collapsed()) {
          <div class="mt-8 px-4 font-mono text-[10px] tracking-[0.22em] text-white/25">
            ACCOUNT
          </div>
        } @else {
          <div class="my-4 border-t border-white/5 w-8 mx-auto"></div>
        }

        <ul class="mt-2 space-y-1">
          @for (item of accountItems; track item.label) {
            <li [title]="collapsed() ? item.label : ''">
              <a
                [routerLink]="item.path"
                routerLinkActive="nav-active"
                [class]="'flex items-center gap-3 rounded-lg py-2.5 font-mono text-[11px] tracking-[0.18em] transition-all cursor-pointer ' + 
                         (collapsed() ? 'justify-center px-0' : 'px-4')"
                style="color:rgba(255,255,255,0.45)"
              >
                <lucide-icon [name]="getIcon(item.label)" class="h-4 w-4 shrink-0"></lucide-icon>
                @if (!collapsed()) {
                  <span>{{ item.label | uppercase }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- User Profile -->
      <div class="mt-auto w-full">
        @if (!collapsed()) {
          <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 px-2 py-2">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black font-mono text-[11px]">
                {{ auth.user()?.initials }}
              </div>
              <div class="min-w-0">
                <div class="text-[13px] font-medium truncate text-white/90">{{ auth.user()?.fullName }}</div>
                <span class="mt-0.5 inline-block rounded-sm border border-white/20 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.2em] text-white/40">
                  {{ auth.user()?.plan }}
                </span>
              </div>
            </div>
            <button (click)="signOut()"
                    class="w-full mt-2 text-left px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-white/25 hover:text-white/50 transition-colors cursor-pointer">
              SIGN OUT
            </button>
          </div>
        } @else {
          <div class="py-4 border-t border-white/5 flex justify-center w-full">
            <div class="grid h-9 w-9 place-items-center rounded-full bg-white text-black font-mono text-[10px]">
              {{ auth.user()?.initials }}
            </div>
          </div>
        }
      </div>
    </aside>

    <style>
      .nav-active {
        background: rgba(255,255,255,0.12) !important;
        color: #fff !important;
        font-weight: 500 !important;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.06);
        border-radius: 10px;
      }
    </style>
  `,
})
export class SidebarComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  private userItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'ATS Audit', path: '/ats-audit' },
    { label: 'Tailor Resume', path: '/tailor-resume' },
    { label: 'Job Matching', path: '/job-matching' },
  ];

  private adminItems = [
    { label: 'Admin Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Templates', path: '/admin/templates' },
    { label: 'Broadcast', path: '/admin/broadcast' },
    { label: 'AI Test Lab', path: '/admin/ai-test' },
  ];

  mainItems = computed(() => (this.auth.user()?.role === 'ADMIN' ? this.adminItems : this.userItems));

  discoverItems = [
    { label: 'Community', path: '/community' },
    { label: 'Explore', path: '/explore' },
  ];

  accountItems = [
    { label: 'Billing', path: '/billing' },
    { label: 'Profile', path: '/profile' },
  ];

  private iconMap: Record<string, any> = {
    'Dashboard': LayoutDashboard,
    'Admin Dashboard': LayoutDashboard,
    'ATS Audit': FileSearch,
    'Tailor Resume': Scissors,
    'Job Matching': Briefcase,
    'Community': Users,
    'Explore': Compass,
    'Billing': CreditCard,
    'Profile': Users,
    'Users': Users,
    'Templates': LayoutDashboard,
    'Broadcast': Compass,
    'AI Test Lab': FileSearch,
  };

  getIcon(label: string) {
    return this.iconMap[label] || LayoutDashboard;
  }

  toggleCollapsed() {
    this.collapsed.update(v => !v);
  }

  signOut() {
    this.auth.logout();
  }
}
