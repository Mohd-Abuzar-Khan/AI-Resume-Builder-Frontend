import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TopNavComponent } from './top-nav';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [TopNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative min-h-screen w-full font-sans transition-editorial" style="--color-background: oklch(0.12 0.04 18); --color-foreground: oklch(0.95 0.02 60); color: var(--color-foreground);">
      <!-- Image Background -->
      <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style="background-color: var(--color-background);">
        <div class="absolute inset-0" style="background-image: var(--page-bg-image); background-size: cover; background-position: center; background-repeat: no-repeat; opacity: 0.8;"></div>
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at center, transparent 40%, oklch(0.08 0.03 18 / 0.85) 100%)"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.08_0.03_18)]"></div>
        <div class="absolute inset-0 opacity-[0.08] mix-blend-overlay" style="background-image: url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>&quot;); background-size: 200px 200px;"></div>
      </div>
      <div class="sticky top-0 z-50">
        <app-top-nav></app-top-nav>
      </div>
      <div [class]="innerClassName || 'max-w-6xl mx-auto px-5 md:px-8 py-8 relative z-10'">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageShellComponent {
  @Input() innerClassName?: string;
}
