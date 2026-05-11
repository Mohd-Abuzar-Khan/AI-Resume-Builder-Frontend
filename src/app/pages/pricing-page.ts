import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { RouterLink } from '@angular/router';
import { PageShellComponent } from '../components/page-shell';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [PageShellComponent, RouterLink, CommonModule],
  template: `
    <app-page-shell innerClassName="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div class="w-full max-w-[1100px] mx-auto py-16 px-5">
        <!-- Header -->
        <div class="pricing-header text-center mb-16 opacity-0">
          <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-3 opacity-40">Pricing</p>
          <h1 class="text-[42px] font-medium tracking-tight text-white/90">
            Start free. Upgrade when you need <em class="font-serif-display font-normal italic text-white/60">more.</em>
          </h1>
        </div>

        <!-- Plan cards -->
        <div class="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <!-- Free -->
          <div class="pricing-card glass-card rounded-2xl p-8 md:p-10 flex flex-col relative overflow-hidden opacity-0">
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-4 opacity-40">Free</p>
            <p class="text-[32px] font-medium text-white/90">₹0</p>
            <p class="text-[13px] mb-5 opacity-40">forever</p>
            <div class="border-t mb-5 border-white/10"></div>
            <div class="space-y-2.5 text-[13px] mb-6 flex-1 opacity-60">
              <p>· Up to 3 resumes</p>
              <p>· 5 AI calls per month</p>
              <p>· 3 ATS checks per month</p>
              <p>· PDF export only</p>
            </div>
            @if (auth.user()?.plan === 'FREE' || !auth.isLoggedIn()) {
              <button class="btn-secondary w-full opacity-50 cursor-default">Current plan</button>
            } @else {
              <button class="btn-secondary w-full opacity-50 cursor-default">Free tier</button>
            }
          </div>

          <!-- Monthly -->
          <div class="pricing-card glass-card rounded-2xl p-8 md:p-10 flex flex-col border border-white/5 relative overflow-hidden opacity-0">
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-4 opacity-40">Monthly</p>
            <p class="text-[32px] font-medium text-white/90">₹499</p>
            <p class="text-[13px] mb-5 opacity-40">per month</p>
            <div class="border-t mb-5 border-white/10"></div>
            <div class="space-y-2.5 text-[13px] mb-6 flex-1 opacity-60">
              <p>· Unlimited resumes</p>
              <p>· Unlimited AI calls</p>
              <p>· Unlimited ATS checks</p>
              <p>· Job tailoring</p>
              <p>· Premium templates</p>
            </div>
            @if (auth.user()?.plan === 'PREMIUM') {
              <button class="btn-secondary w-full opacity-50 cursor-default">Current plan</button>
            } @else {
              <a [routerLink]="['/payment']" [queryParams]="{ price: 499 }" class="btn-secondary w-full text-center block">Get Monthly</a>
            }
          </div>

          <!-- Annual -->
          <div class="pricing-card glass-card rounded-2xl p-8 md:p-10 flex flex-col md:-translate-y-3 relative overflow-hidden opacity-0"
               style="border-color: oklch(0.85 0.10 70 / 0.55); box-shadow: 0 20px 60px -20px oklch(0.55 0.22 25 / 0.5);">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-medium px-3 py-1 rounded-full" style="background: oklch(0.85 0.10 70); color: oklch(0.20 0.08 25);">
              ✦ Best Value
            </div>
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-medium mb-4 text-amber-500">Annual</p>
            <p class="text-[32px] font-medium text-white/95">₹3,999</p>
            <p class="text-[13px] mb-1 opacity-40">per year</p>
            <p class="text-[12px] mb-5 opacity-30">₹333 / month — save 33%</p>
            <div class="border-t mb-5 border-white/10"></div>
            <div class="space-y-2.5 text-[13px] mb-6 flex-1 opacity-60">
              <p><span class="text-amber-500">·</span> Everything in Monthly</p>
              <p><span class="text-amber-500">·</span> Priority AI access</p>
              <p><span class="text-amber-500">·</span> Save ₹1,989 annually</p>
              <p><span class="text-amber-500">·</span> DOCX + JSON exports</p>
            </div>
            @if (auth.user()?.plan === 'PREMIUM') {
              <button class="btn-secondary w-full opacity-50 cursor-default">Current plan</button>
            } @else {
              <a [routerLink]="['/payment']" [queryParams]="{ price: 3999 }" class="btn-primary w-full text-center block">Upgrade to Annual</a>
            }
          </div>
        </div>
      </div>
    </app-page-shell>
  `,
})
export class PricingComponent implements AfterViewInit {
  auth = inject(AuthService);

  ngAfterViewInit() {
    this.initAnimations();
  }

  private initAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

    tl.fromTo('.pricing-header', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, delay: 0.1 }
    )
    .fromTo('.pricing-card', 
      { y: 40, opacity: 0 }, 
      { 
        y: (i, target) => target.classList.contains('md:-translate-y-3') ? -12 : 0, 
        opacity: 1, 
        stagger: 0.15 
      }, 
      '-=0.7'
    );
  }
}
