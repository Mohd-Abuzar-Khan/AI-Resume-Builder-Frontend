import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style="color:rgba(0,0,0,0.3)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        type="text"
        [(ngModel)]="query"
        (keyup.enter)="onSearch()"
        placeholder="Search by role, skills, or company…"
        class="w-full glass-input pl-11 pr-4 py-3.5 rounded-xl text-[14px]"
      />
    </div>
  `,
})
export class SearchBarComponent {
  query = '';
  @Output() search = new EventEmitter<string>();

  onSearch() {
    this.search.emit(this.query);
  }
}
