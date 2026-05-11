import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { PopupService } from '../../core/services/popup.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-up">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p class="text-[13px] mb-1 text-white/40">Admin</p>
          <h1 class="text-[28px] font-medium tracking-tight text-white/90">User Management</h1>
        </div>
        <!-- Search -->
        <input type="text" placeholder="Search users..."
               class="glass-input w-72 py-2.5 px-4" />
      </div>

      <!-- Users Table -->
      <div class="glass-card rounded-3xl p-6 overflow-hidden" style="border-color: rgba(255, 240, 230, 0.18); background: rgba(255, 255, 255, 0.05);">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[13px] min-w-[700px]">
            <thead>
              <tr class="border-b border-white/10">
                <th class="py-4 pr-6 font-medium text-white/40 uppercase tracking-widest text-[10px]">User</th>
                <th class="py-4 pr-6 font-medium text-white/40 uppercase tracking-widest text-[10px]">Tier</th>
                <th class="py-4 pr-6 font-medium text-white/40 uppercase tracking-widest text-[10px]">Status</th>
                <th class="py-4 pr-6 font-medium text-white/40 uppercase tracking-widest text-[10px]">Joined</th>
                <th class="py-4 font-medium text-right text-white/40 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (user of users(); track user.userId) {
                <tr class="hover:bg-white/5 transition-colors group">
                  <td class="py-5 pr-6">
                    <div class="flex items-center gap-3">
                      <div class="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-medium glass-badge"
                           style="border-color: rgba(255, 255, 255, 0.2);">
                        {{ getInitials(user.fullName) }}
                      </div>
                      <div>
                        <p class="text-[14px] font-medium text-white/90">{{ user.fullName }}</p>
                        <p class="text-[12px] text-white/40">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-5 pr-6">
                    <span class="glass-badge"
                          [style.color]="user.subscriptionPlan === 'PREMIUM' ? '#F6AD55' : 'rgba(255,255,255,0.6)'"
                          [style.border-color]="user.subscriptionPlan === 'PREMIUM' ? 'rgba(246,173,85,0.3)' : 'rgba(255,255,255,0.1)'">
                      {{ user.subscriptionPlan }}
                    </span>
                  </td>
                  <td class="py-5 pr-6">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                           [style.background]="user.isActive ? '#4FD1C5' : '#F87171'"
                           [style.color]="user.isActive ? '#4FD1C5' : '#F87171'"></div>
                      <span class="text-[12px] font-medium"
                            [style.color]="user.isActive ? '#4FD1C5' : '#F87171'">
                        {{ user.isActive ? 'Active' : 'Suspended' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-5 pr-6 text-[12px] text-white/40">
                    {{ user.createdAt | date:'MMM d, y' }}
                  </td>
                  <td class="py-5 text-right">
                    <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      @if (user.subscriptionPlan === 'FREE') {
                        <button (click)="upgradePlan(user)" class="text-[12px] font-medium cursor-pointer hover:text-amber-400 text-amber-400/60 transition-colors">Upgrade</button>
                      } @else {
                        <button (click)="downgradePlan(user)" class="text-[12px] font-medium cursor-pointer hover:text-white/80 text-white/40 transition-colors">Downgrade</button>
                      }
                      @if (user.isActive) {
                        <button (click)="toggleStatus(user, false)" class="text-[12px] font-medium cursor-pointer hover:text-red-400 text-red-400/60 transition-colors">Suspend</button>
                      } @else {
                        <button (click)="toggleStatus(user, true)" class="text-[12px] font-medium cursor-pointer hover:text-emerald-400 text-emerald-400/60 transition-colors">Activate</button>
                      }
                      <button (click)="deleteUser(user)" class="text-[12px] font-medium cursor-pointer hover:text-red-400 text-red-400/60 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private popup = inject(PopupService);
  users = signal<any[]>([]);

  ngOnInit() { this.loadUsers(); }

  loadUsers() { this.adminService.getAllUsers().subscribe(data => this.users.set(data)); }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  upgradePlan(user: any) {
    this.popup.confirm(
      'Upgrade Plan',
      `Are you sure you want to upgrade ${user.fullName} to PREMIUM?`,
      () => {
        this.adminService.updateUserPlan(user.userId, 'PREMIUM').subscribe({
          next: () => {
            this.loadUsers();
            this.popup.success('Success', `User ${user.fullName} upgraded to PREMIUM.`);
          },
          error: () => this.popup.error('Error', 'Failed to upgrade user plan.')
        });
      }
    );
  }

  downgradePlan(user: any) {
    this.popup.confirm(
      'Downgrade Plan',
      `Are you sure you want to downgrade ${user.fullName} to FREE?`,
      () => {
        this.adminService.updateUserPlan(user.userId, 'FREE').subscribe({
          next: () => {
            this.loadUsers();
            this.popup.success('Success', `User ${user.fullName} downgraded to FREE.`);
          },
          error: () => this.popup.error('Error', 'Failed to downgrade user plan.')
        });
      }
    );
  }

  toggleStatus(user: any, active: boolean) {
    const action = active ? 'Reactivate' : 'Suspend';
    this.popup.confirm(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} user ${user.fullName}?`,
      () => {
        this.adminService.updateUserStatus(user.userId, active).subscribe({
          next: () => {
            this.loadUsers();
            this.popup.success('Success', `User ${user.fullName} has been ${active ? 'reactivated' : 'suspended'}.`);
          },
          error: () => this.popup.error('Error', `Failed to ${action.toLowerCase()} user.`)
        });
      }
    );
  }

  deleteUser(user: any) {
    this.popup.confirm(
      'Delete User',
      `Are you sure you want to permanently delete ${user.fullName}? This action cannot be undone.`,
      () => {
        this.adminService.deleteUser(user.userId).subscribe({
          next: () => {
            this.loadUsers();
            this.popup.success('Success', `User ${user.fullName} has been deleted.`);
          },
          error: () => this.popup.error('Error', 'Failed to delete user.')
        });
      }
    );
  }
}
