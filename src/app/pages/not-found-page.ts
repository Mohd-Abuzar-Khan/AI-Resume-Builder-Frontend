import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageShellComponent } from '../components/page-shell';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [PageShellComponent, RouterLink, CommonModule],
  template: `
    <app-page-shell>
      <div class="flex flex-col items-center text-center gap-6 py-16">
        <span class="tracked-caps text-on-glass-muted">Error 404</span>
        <h1 class="text-6xl sm:text-7xl text-on-glass font-medium">
          Page <em class="italic font-serif-display font-normal text-on-glass/85">missing</em>
        </h1>
        <p class="text-on-glass-muted max-w-md">
          We couldn't find what you were looking for. Let's get you back to
          building something great.
        </p>
        <a
          routerLink="/"
          class="rounded-full bg-white text-slate-900 hover:bg-white/90 px-8 h-11 flex items-center justify-center font-medium transition-all cursor-pointer"
        >
          Back to home
        </a>
      </div>
    </app-page-shell>
  `,
})
export class NotFoundComponent implements OnInit {
  router = inject(Router);

  ngOnInit() {
    console.error('404 Error: User attempted to access non-existent route:', this.router.url);
  }
}
