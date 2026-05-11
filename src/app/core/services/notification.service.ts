import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  notificationId: number;
  recipientId: number;
  type: 'ATS_COMPLETE' | 'EXPORT_READY' | 'AI_DONE' | 'JOB_MATCH' | 'PLAN_CHANGE' | 'QUOTA_WARNING';
  title: string;
  message: string;
  channel: 'APP' | 'EMAIL' | 'BOTH';
  isRead: boolean;
  sentAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/notifications`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Start polling unread count every 30 seconds
    interval(30000).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe(count => this.unreadCount.set(count));
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(data => data.map(d => ({
        notificationId: d.notificationId ?? d.id,
        id: d.notificationId ?? d.id,
        recipientId: d.recipientId,
        type: d.type,
        title: d.title,
        message: d.message,
        channel: d.channel,
        isRead: (d.isRead ?? d.read) === true,
        read: (d.isRead ?? d.read) === true,
        sentAt: d.sentAt ?? d.time,
        time: d.sentAt ?? d.time
      }))),
      tap(normalized => this.notifications.set(normalized as Notification[]))
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count`).pipe(
        tap(count => this.unreadCount.set(count))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, {}).pipe(
        tap(() => {
            this.unreadCount.set(0);
            this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        })
    );
  }
}
