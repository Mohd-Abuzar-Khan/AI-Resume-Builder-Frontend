import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

export type UsageEventType = 'AI_CALL' | 'RESUME_CREATE';

export interface UsageEvent {
  type: UsageEventType;
  feature: string;
  timestamp: string;
}

interface MonthlyUsageRecord {
  events: UsageEvent[];
}

export interface UsageSummary {
  isFreeUser: boolean;
  resumesUsed: number;
  resumesLimit: number;
  resumesRemaining: number;
  aiCallsUsed: number;
  aiCallsLimit: number;
  aiCallsRemaining: number;
  monthKey: string;
}

export interface WeeklyApiCallSeries {
  labels: string[];
  values: number[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsageLimitsService {
  private readonly storagePrefix = 'resumade_usage';
  private readonly mutation = signal(0);
  private readonly auth = inject(AuthService);

  readonly changed = this.mutation.asReadonly();
  readonly freeResumeLimit = 3;
  readonly freeAiCallLimit = 5;

  private getCurrentMonthKey(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private getUserKey(): string {
    const user = (this.auth as AuthService).user();
    return user ? String(user.userId ?? user.email ?? 'anonymous') : 'anonymous';
  }

  private getStorageKey(monthKey = this.getCurrentMonthKey(), userKey = this.getUserKey()): string {
    return `${this.storagePrefix}_${monthKey}_${userKey}`;
  }

  private readRecord(monthKey = this.getCurrentMonthKey(), userKey = this.getUserKey()): MonthlyUsageRecord {
    if (typeof localStorage === 'undefined') {
      return { events: [] };
    }

    const raw = localStorage.getItem(this.getStorageKey(monthKey, userKey));
    if (!raw) {
      return { events: [] };
    }

    try {
      const parsed = JSON.parse(raw) as MonthlyUsageRecord;
      return {
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    } catch {
      return { events: [] };
    }
  }

  private writeRecord(record: MonthlyUsageRecord, monthKey = this.getCurrentMonthKey(), userKey = this.getUserKey()): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.getStorageKey(monthKey, userKey), JSON.stringify(record));
    this.mutation.update(value => value + 1);
  }

  private isFreeUser(): boolean {
    const user = (this.auth as AuthService).user();
    if (!user) {
      return false;
    }

    return user.role !== 'ADMIN' && user.plan === 'FREE';
  }

  private getCurrentCounts(): { resumesUsed: number; aiCallsUsed: number; monthKey: string } {
    const monthKey = this.getCurrentMonthKey();
    const record = this.readRecord(monthKey);
    const resumesUsed = record.events.filter(event => event.type === 'RESUME_CREATE').length;
    const aiCallsUsed = record.events.filter(event => event.type === 'AI_CALL').length;

    return { resumesUsed, aiCallsUsed, monthKey };
  }

  canUseAiCalls(amount = 1): boolean {
    if (!this.isFreeUser()) {
      return true;
    }

    const { aiCallsUsed } = this.getCurrentCounts();
    return aiCallsUsed + amount <= this.freeAiCallLimit;
  }

  canCreateResumes(amount = 1): boolean {
    if (!this.isFreeUser()) {
      return true;
    }

    const { resumesUsed } = this.getCurrentCounts();
    return resumesUsed + amount <= this.freeResumeLimit;
  }

  recordAiCall(feature: string): void {
    this.recordEvent('AI_CALL', feature);
  }

  recordResumeCreate(feature: string): void {
    this.recordEvent('RESUME_CREATE', feature);
  }

  getCurrentUserSummary(): UsageSummary {
    const { resumesUsed, aiCallsUsed, monthKey } = this.getCurrentCounts();
    const isFreeUser = this.isFreeUser();
    const resumesLimit = isFreeUser ? this.freeResumeLimit : Number.POSITIVE_INFINITY;
    const aiCallsLimit = isFreeUser ? this.freeAiCallLimit : Number.POSITIVE_INFINITY;

    return {
      isFreeUser,
      resumesUsed,
      resumesLimit,
      resumesRemaining: isFreeUser ? Math.max(0, this.freeResumeLimit - resumesUsed) : Number.POSITIVE_INFINITY,
      aiCallsUsed,
      aiCallsLimit,
      aiCallsRemaining: isFreeUser ? Math.max(0, this.freeAiCallLimit - aiCallsUsed) : Number.POSITIVE_INFINITY,
      monthKey,
    };
  }

  getCurrentMonthApiCallsByWeek(): WeeklyApiCallSeries {
    const monthKey = this.getCurrentMonthKey();
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const values = [0, 0, 0, 0, 0];

    if (typeof localStorage === 'undefined') {
      return { labels, values, total: 0 };
    }

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(`${this.storagePrefix}_${monthKey}_`)) {
        continue;
      }

      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      try {
        const record = JSON.parse(raw) as MonthlyUsageRecord;
        for (const event of record.events || []) {
          if (event.type !== 'AI_CALL') {
            continue;
          }

          const eventDate = new Date(event.timestamp);
          if (Number.isNaN(eventDate.getTime())) {
            continue;
          }

          const weekIndex = Math.min(4, Math.floor((eventDate.getDate() - 1) / 7));
          values[weekIndex] += 1;
        }
      } catch {
        continue;
      }
    }

    return {
      labels,
      values,
      total: values.reduce((sum, value) => sum + value, 0),
    };
  }

  private recordEvent(type: UsageEventType, feature: string): void {
    const monthKey = this.getCurrentMonthKey();
    const userKey = this.getUserKey();
    const record = this.readRecord(monthKey, userKey);

    record.events.push({
      type,
      feature,
      timestamp: new Date().toISOString(),
    });

    this.writeRecord(record, monthKey, userKey);
  }
}
