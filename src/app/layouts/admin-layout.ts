import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { SidebarComponent } from '../components/sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen w-full overflow-hidden transition-editorial" style="--color-background: oklch(0.12 0.04 18); --color-foreground: oklch(0.95 0.02 60); color: var(--color-foreground);">
      <!-- Image Background Layers (Unified with Dashboard) -->
      <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style="background-color: var(--color-background);">
        <div class="absolute inset-0" style="background-image: var(--page-bg-image); background-size: cover; background-position: center; background-repeat: no-repeat; opacity: 0.8;"></div>

        <div class="absolute inset-0 opacity-[0.08] mix-blend-overlay" style="background-image: url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>&quot;); background-size: 200px 200px;"></div>
      </div>

      <!-- Expandable Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col relative overflow-hidden">
        
        <!-- Admin Header -->
        <header class="h-12 px-8 glass-nav flex items-center justify-between z-40">
           <div class="flex items-center gap-3">
              <span class="text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase">Admin Console</span>
              <div class="h-4 w-[1px] bg-white/10"></div>
              <span class="text-[13px] font-medium text-white/90">System Management</span>
           </div>

           <div class="flex items-center gap-4">
              <div class="flex flex-col items-end mr-2">
                <span class="text-[12px] font-medium text-white/90 leading-none">{{ auth.user()?.fullName }}</span>
                <span class="text-[9px] font-mono tracking-widest text-indigo-400 mt-1 uppercase">Administrator</span>
              </div>
              <!-- Avatar -->
              <div class="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-medium cursor-pointer"
                   style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.9); border:0.5px solid rgba(255,255,255,0.15)">
                {{ auth.user()?.initials }}
              </div>
           </div>
        </header>

        <main class="flex-1 relative overflow-y-auto custom-scrollbar">
          <div class="max-w-[1400px] mx-auto px-8 pt-10 pb-8">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <footer class="px-8 py-6 mt-12 flex items-center justify-between text-[11px] font-mono tracking-widest opacity-20"
                  style="border-top:0.5px solid rgba(255,255,255,0.06)">
            <span>RESUMADE ADMIN v2.5</span>
            <span>SECURE ACCESS ONLY</span>
          </footer>
        </main>
      </div>
    </div>

    <style>
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    </style>
  `,
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
}
