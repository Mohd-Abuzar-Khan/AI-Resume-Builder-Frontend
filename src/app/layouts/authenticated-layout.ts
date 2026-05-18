import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar';
import { NotificationBellComponent } from '../components/notification-bell';
import { PaymentCtaComponent } from '../components/payment-cta';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NotificationBellComponent, PaymentCtaComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen w-full overflow-hidden transition-editorial" style="--color-background: oklch(0.12 0.04 18); --color-foreground: oklch(0.95 0.02 60); color: var(--color-foreground);">
      <!-- Image Background -->
      <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style="background-color: var(--color-background);">
        <div class="absolute inset-0" style="background-image: var(--page-bg-image); background-size: cover; background-position: center; background-repeat: no-repeat; opacity: 0.8;"></div>

        <div class="absolute inset-0 opacity-[0.08] mix-blend-overlay" style="background-image: url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>&quot;); background-size: 200px 200px;"></div>
      </div>

      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col relative overflow-hidden">

        <!-- Top Header Bar -->
        <header class="h-12 px-8 glass-nav flex items-center justify-between z-40">
           <div class="flex items-center">
              <span class="text-[14px] font-medium opacity-90">Dashboard</span>
           </div>

           <div class="flex items-center gap-4">
              <app-notification-bell></app-notification-bell>
              <!-- Avatar -->
              <div class="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-medium cursor-pointer"
                   style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.9); border:0.5px solid rgba(255,255,255,0.15)">
                @if (auth.user()?.profilePicture) {
                  <img [src]="'/' + auth.user()?.profilePicture" class="h-full w-full object-cover" />
                } @else {
                  {{ auth.user()?.initials }}
                }
              </div>
           </div>
        </header>

        <main class="flex-1 relative overflow-y-auto custom-scrollbar">
          <div class="max-w-[1400px] mx-auto px-8 pt-10 pb-8">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer strip -->
          <footer class="px-8 py-6 mt-12 flex items-center justify-between text-[12px] opacity-40"
                  style="border-top:0.5px solid rgba(255,255,255,0.06)">
            <span>Resumade · AI Career Suite</span>
            <span>2026</span>
          </footer>
        </main>
      </div>
      <app-payment-cta></app-payment-cta>
    </div>

    <style>
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.06);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
    </style>
  `,
})
export class AuthenticatedLayoutComponent {
  auth = inject(AuthService);
}
