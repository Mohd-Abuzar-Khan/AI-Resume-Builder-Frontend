import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { PopupService } from '../../core/services/popup.service';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl space-y-10 animate-fade-up">
      <div>
        <p class="text-[13px] mb-1 text-white/40 uppercase tracking-widest">Admin</p>
        <h1 class="text-[28px] font-medium tracking-tight text-white/90">System Broadcast</h1>
        <p class="text-[14px] mt-1 text-white/40">Send platform-wide notifications to specific user cohorts.</p>
      </div>

      <div class="glass-card p-8 rounded-3xl space-y-8" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
        <!-- Target chips -->
        <div>
          <p class="text-[12px] font-medium mb-4 text-white/40 uppercase tracking-widest">Target audience</p>
          <div class="flex gap-3">
            @for (opt of ['ALL', 'FREE', 'PREMIUM']; track opt) {
              <button (click)="target.set(opt)"
                      class="px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer glass-badge"
                      [style.background]="target() === opt ? 'rgba(129, 140, 248, 0.2)' : 'transparent'"
                      [style.color]="target() === opt ? '#818CF8' : 'rgba(255,255,255,0.4)'"
                      [style.border-color]="target() === opt ? 'rgba(129, 140, 248, 0.4)' : 'rgba(255,255,255,0.1)'">
                {{ opt === 'ALL' ? 'All Users' : opt === 'FREE' ? 'Free Tier' : 'Premium Tier' }}
              </button>
            }
          </div>
        </div>

        <!-- Title -->
        <div class="space-y-2">
          <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Notification title</label>
          <input type="text" [(ngModel)]="title" placeholder="New Feature Update!" class="glass-input w-full py-3" />
        </div>

        <!-- Message -->
        <div class="space-y-2">
          <label class="text-[12px] font-medium text-white/40 uppercase tracking-widest">Message content</label>
          <textarea [(ngModel)]="message" rows="5" placeholder="Describe the update or announcement here..."
                    class="glass-input w-full resize-none py-3"></textarea>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-6 border-t border-white/5">
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
            <p class="text-[12px] text-white/30 font-medium">Estimated reach: ~12,400 active users</p>
          </div>
          <button (click)="send()" [disabled]="!title || !message || sending()"
                  class="btn-primary px-8 py-2.5 rounded-xl shadow-[0_0_20px_rgba(129,140,248,0.2)] disabled:opacity-50">
            {{ sending() ? 'Broadcasting...' : 'Send Broadcast' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SendNotificationComponent {
  private adminService = inject(AdminService);
  private popup = inject(PopupService);

  target = signal<string>('ALL');
  title: string = '';
  message: string = '';
  sending = signal(false);

  send() {
    this.sending.set(true);
    this.adminService.broadcast(this.title, this.message, this.target()).subscribe({
      next: () => {
        this.popup.success('Success', 'Broadcast sent successfully to all targeted users!');
        this.title = '';
        this.message = '';
        this.sending.set(false);
      },
      error: () => {
        this.popup.error('Error', 'Failed to send broadcast. Please try again.');
        this.sending.set(false);
      }
    });
  }
}
