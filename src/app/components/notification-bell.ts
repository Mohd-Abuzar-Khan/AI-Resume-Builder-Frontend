import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button (click)="toggle()" class="relative p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-black/[0.04]">
        <!-- Bell SVG -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/40">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        @if (unreadCount() > 0) {
          <span class="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-medium"
                style="background:#1F3A6E; color:white">
            {{ unreadCount() }}
          </span>
        }
      </button>

      @if (isOpen()) {
        <div class="absolute right-0 mt-2 w-80 glass-modal rounded-xl shadow-xl z-50 animate-fade-up overflow-hidden">
          <div class="px-4 py-3 flex items-center justify-between border-b border-white/5">
            <span class="text-[14px] font-medium text-white/90">Notifications</span>
            @if (unreadCount() > 0) {
              <button (click)="markAllRead()" class="text-[12px] cursor-pointer hover:underline text-teal-400">
                Mark all read
              </button>
            }
          </div>

          <div class="max-h-72 overflow-y-auto custom-scrollbar">
            @for (n of notifications(); track n.id) {
              <div class="px-4 py-3 transition-colors hover:bg-white/[0.02] cursor-pointer border-b border-white/5"
                   [style.background]="n.read ? 'transparent' : 'rgba(255,255,255,0.03)'">
                <p class="text-[13px] leading-snug" [style.color]="n.read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)'" [style.font-weight]="n.read ? '400' : '500'">
                  {{ n.title }}
                </p>
                <p class="text-[11px] mt-1 text-white/20">{{ n.time }}</p>
              </div>
            } @empty {
              <div class="px-4 py-8 text-center">
                <p class="text-[13px] text-white/30">No notifications</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 10px; }
  `]
})
export class NotificationBellComponent implements OnInit {
  private notifService = inject(NotificationService);

  isOpen = signal(false);
  notifications = signal<any[]>([]);
  unreadCount = signal(0);

  ngOnInit() {
    this.notifService.getNotifications().subscribe(data => {
      this.notifications.set(data);
      this.unreadCount.set(data.filter((n: any) => !n.read).length);
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, read: true })));
      this.unreadCount.set(0);
    });
  }
}
