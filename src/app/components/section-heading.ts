import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="align === 'center' ? 'text-center' : ''">
      @if (eyebrow) {
        <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-3 text-white/40">
          {{ eyebrow }}
        </p>
      }
      <h2 class="text-[28px] sm:text-[36px] font-medium tracking-tight leading-tight text-white/90">
        <ng-content></ng-content>
      </h2>
    </div>
  `,
})
export class SectionHeadingComponent {
  @Input() eyebrow = '';
  @Input() align: 'left' | 'center' = 'left';
}
