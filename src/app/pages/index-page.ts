import { Component, inject, computed, OnInit, signal, ElementRef, viewChildren, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ResumeService, BackendResume } from '../core/services/resume.service';
import { MiniResumePreviewComponent } from '../components/mini-resume-preview.component';
import { CommonModule } from '@angular/common';
import { TopNavComponent } from '../components/top-nav';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink, CommonModule, TopNavComponent, MiniResumePreviewComponent],
  template: `
    <div class="relative min-h-screen w-full font-sans overflow-x-hidden transition-editorial" 
         style="--color-background: oklch(0.12 0.04 18); --color-foreground: oklch(0.95 0.02 60); color: var(--color-foreground);">
      
      <!-- Image Background -->
      <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style="background-color: var(--color-background);">
        <div class="absolute inset-0" style="background-image: var(--page-bg-image); background-size: cover; background-position: center; background-repeat: no-repeat; opacity: 0.85;"></div>

        <div class="absolute inset-0 opacity-[0.08] mix-blend-overlay" style="background-image: url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>&quot;); background-size: 200px 200px;"></div>
      </div>

      <!-- TopNav -->
      <div class="fixed top-0 left-0 right-0 z-50">
        <app-top-nav></app-top-nav>
      </div>

      <main>
        <!-- Hero -->
        <section class="relative pt-40 pb-24 md:pt-52 md:pb-32">
          <div class="mx-auto max-w-6xl px-6 text-center animate-fade-in">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-xs text-foreground/70" style="border-color: rgba(255, 240, 230, 0.14);">
              <span class="h-1.5 w-1.5 rounded-full bg-foreground/80 animate-pulse"></span>
              Now with Gemini · ATS-optimized
            </div>
            <h1 class="hero-title font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight text-foreground opacity-0">
              Build a Resume That<br>
              <span class="font-serif-italic text-foreground/95">Lands the Job.</span>
            </h1>
            <p class="hero-subtitle mx-auto mt-8 max-w-xl text-base md:text-lg text-foreground/65 leading-relaxed opacity-0">
              AI-written summaries, tailored bullet points, and an ATS score that actually
              gets you past the filter. Crafted for ambitious candidates.
            </p>
            <div class="hero-cta mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0">
              <a [routerLink]="auth.isLoggedIn() ? dashboardLink() : '/auth/register'" class="btn-primary inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium w-full sm:w-auto" style="background: var(--color-foreground); color: var(--color-background);">
                Start for free →
              </a>
              <a routerLink="/community" class="btn-glass inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium w-full sm:w-auto" style="color: var(--color-foreground);">
                Browse community
              </a>
            </div>
            <p class="mt-12 text-xs text-foreground/40 tracking-wide">
              12,400+ resumes built · loved by talent at 
              <span class="text-foreground/55">Razorpay</span> · 
              <span class="text-foreground/55">CRED</span> · 
              <span class="text-foreground/55">Swiggy</span> · 
              <span class="text-foreground/55">Stripe</span>
            </p>
          </div>
        </section>

        <!-- Build With AI -->
        <section class="reveal-section relative py-24 md:py-32 opacity-0">
          <div class="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center animate-fade-in">
            <div>
              <div class="inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-xs text-foreground/70 mb-6" style="border-color: rgba(255, 240, 230, 0.14);">
                01 · Build with AI
              </div>
              <h2 class="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
                Summaries and bullets, <span class="font-serif-italic text-foreground/95">written for you.</span>
              </h2>
              <p class="mt-6 text-foreground/65 leading-relaxed max-w-md">
                Paste a rough draft or let Gemini start from scratch. Resumade turns
                scattered notes into crisp, recruiter-ready prose — every time.
              </p>
              <ul class="mt-8 space-y-3 text-sm text-foreground/75">
                @for (item of ['Tone-matched professional summaries', 'Action-verb bullet rewrites', 'Quantified achievements, automatically']; track item) {
                  <li class="flex items-center gap-3">
                    <span class="h-1 w-1 rounded-full bg-foreground/60"></span>
                    {{ item }}
                  </li>
                }
              </ul>
            </div>
            <div class="relative">
              <div class="glass-card p-6 md:p-8 pocket-fade min-h-[420px]" style="border-color: rgba(255, 240, 230, 0.14);">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-medium" style="background: oklch(0.95 0.02 60 / 0.12); color: oklch(0.95 0.02 60);">
                    <span class="h-1.5 w-1.5 rounded-full" style="background: oklch(0.95 0.02 60);"></span>
                    Generated by Gemini
                  </div>
                  <span class="text-[10px] text-foreground/40">resume.pdf</span>
                </div>
                <div class="space-y-1 mb-6">
                  <div class="font-display text-xl text-foreground">Ananya Shukla</div>
                  <div class="text-xs text-foreground/55">Senior Product Designer · Bengaluru</div>
                </div>
                <div class="space-y-2 mb-6">
                  <div class="text-[10px] uppercase tracking-widest text-foreground/40">Summary</div>
                  <div class="space-y-1.5">
                    <div class="h-2 rounded-full bg-foreground/15 w-full"></div>
                    <div class="h-2 rounded-full bg-foreground/15 w-[92%]"></div>
                    <div class="h-2 rounded-full bg-foreground/15 w-[78%]"></div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-[10px] uppercase tracking-widest text-foreground/40">Experience</div>
                  <div class="space-y-3">
                    @for (i of [1, 2, 3]; track i) {
                      <div class="space-y-1.5">
                        <div class="h-2 rounded-full bg-foreground/20 w-1/3"></div>
                        <div class="h-1.5 rounded-full bg-foreground/10 w-full"></div>
                        <div class="h-1.5 rounded-full bg-foreground/10 w-[88%]"></div>
                      </div>
                    }
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ATS Score -->
        <section class="reveal-section relative py-24 md:py-32 opacity-0">
          <div class="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center animate-fade-in" style="animation-delay: 150ms;">
            <div class="md:order-2">
              <div class="glass-card p-8 md:p-10 relative overflow-hidden" style="border-color: rgba(255, 240, 230, 0.14);">
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-xs uppercase tracking-widest text-foreground/45">ATS Score</span>
                  <span class="text-xs text-foreground/45">Live analysis</span>
                </div>
                <div class="flex items-baseline gap-2 mb-6">
                  <span class="font-display text-7xl md:text-8xl tracking-tight text-foreground">82</span>
                  <span class="font-display text-3xl text-foreground/40">/100</span>
                </div>
                <div class="h-2 w-full rounded-full bg-foreground/10 overflow-hidden mb-8">
                  <div class="h-full rounded-full animate-progress" style="background: linear-gradient(90deg, oklch(0.70 0.20 30), oklch(0.95 0.02 60)); --progress: 82%;"></div>
                </div>
                <div class="mb-5">
                  <div class="text-[10px] uppercase tracking-widest text-foreground/45 mb-3">Found Keywords</div>
                  <div class="flex flex-wrap gap-2">
                    @for (k of ['React', 'TypeScript', 'Figma', 'Design Systems', 'User Research', 'Prototyping']; track k) {
                      <span class="text-xs rounded-full px-3 py-1" style="background: oklch(0.95 0.02 60 / 0.14); color: oklch(0.97 0.01 60); border: 1px solid oklch(0.95 0.02 60 / 0.20);">
                        {{ k }}
                      </span>
                    }
                  </div>
                </div>
                <div>
                  <div class="text-[10px] uppercase tracking-widest text-foreground/45 mb-3">Missing Keywords</div>
                  <div class="flex flex-wrap gap-2">
                    @for (k of ['Accessibility', 'GraphQL', 'A/B Testing']; track k) {
                      <span class="text-xs rounded-full px-3 py-1 border border-foreground/15 text-foreground/40">
                        {{ k }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div class="md:order-1">
              <div class="inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-xs text-foreground/70 mb-6" style="border-color: rgba(255, 240, 230, 0.14);">
                02 · ATS Optimization
              </div>
              <h2 class="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
                Get past the filter, <span class="font-serif-italic text-foreground/95">not just the recruiter.</span>
              </h2>
              <p class="mt-6 text-foreground/65 leading-relaxed max-w-md">
                Resumade scans every word against the job description, scores your fit out
                of 100, and tells you exactly which keywords to add — no guesswork.
              </p>
            </div>
          </div>
        </section>

        <!-- Tailor Resume -->
        <section class="reveal-section relative py-24 md:py-32 opacity-0">
          <div class="mx-auto max-w-6xl px-6 animate-fade-in">
            <div class="text-center max-w-2xl mx-auto mb-14">
              <div class="inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-xs mb-6" style="color: oklch(0.85 0.10 70); border-color: oklch(0.85 0.10 70 / 0.30);">
                ✦ Premium · Tailor Resume
              </div>
              <h2 class="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
                One resume. <span class="font-serif-italic text-foreground/95">Every job description.</span>
              </h2>
              <p class="mt-6 text-foreground/65 leading-relaxed">
                Paste a JD and watch Resumade rewrite your bullets to match the role —
                data, verbs, and vocabulary calibrated for the hire.
              </p>
            </div>
            <div class="grid md:grid-cols-2 gap-5">
              <div class="glass-card p-7 opacity-70" style="border-color: rgba(255, 240, 230, 0.14);">
                <div class="text-[10px] uppercase tracking-widest text-foreground/45 mb-4">Before</div>
                <div class="text-sm text-foreground/70 leading-relaxed">
                  "Worked on the design team to improve the product. Helped launch new
                  features and worked with engineers."
                </div>
                <div class="mt-6 flex items-center gap-2 text-xs text-foreground/40">
                  <span class="h-1.5 w-1.5 rounded-full bg-foreground/30"></span>
                  Generic · Low match
                </div>
              </div>
              <div class="glass-card p-7 relative" style="border-color: oklch(0.95 0.02 60 / 0.35);">
                <div class="absolute top-4 right-4 text-[10px] font-medium px-2.5 py-1 rounded-full" style="background: oklch(0.95 0.02 60 / 0.14); color: oklch(0.97 0.01 60);">
                  +38% match
                </div>
                <div class="text-[10px] uppercase tracking-widest text-foreground/55 mb-4">After</div>
                <div class="text-sm text-foreground leading-relaxed">
                  "Led 3 cross-functional design sprints that shipped 4 product features,
                  increasing weekly active users by 27% and reducing onboarding drop-off by 41%."
                </div>
                <div class="mt-6 flex items-center gap-2 text-xs text-foreground/65">
                  <span class="h-1.5 w-1.5 rounded-full bg-foreground"></span>
                  Tailored · Quantified · ATS-aligned
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Community Showcase -->
        <section class="relative py-24 md:py-32">
          <div class="mx-auto max-w-6xl px-6 mb-12 animate-fade-in">
            <div class="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div class="inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-xs text-foreground/70 mb-6" style="border-color: rgba(255, 240, 230, 0.14);">
                  03 · Community
                </div>
                <h2 class="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-xl">
                  Real resumes, from <span class="font-serif-italic text-foreground/95">real hires.</span>
                </h2>
              </div>
              <a routerLink="/community" class="text-sm text-foreground/60 hover:text-foreground transition-colors">
                View all →
              </a>
            </div>
          </div>
          <div class="edge-fade-x">
            <div class="overflow-hidden pb-6">
              <div class="flex gap-5 px-6 animate-marquee w-max">
                <!-- First Set -->
                @for (s of communityResumes(); track s.resumeId) {
                  <article [routerLink]="['/community/resume', s.resumeId]" class="glass-card shrink-0 w-[260px] md:w-[280px] p-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer group" style="border-color: rgba(255, 240, 230, 0.14);">
                    <div class="rounded-xl overflow-hidden relative border border-white/5 group-hover:border-teal-500/20 transition-all mb-4">
                      <app-mini-resume-preview
                        [resumeId]="s.resumeId"
                        [scaleFactor]="0.28"
                        [containerHeight]="280">
                      </app-mini-resume-preview>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm text-foreground truncate">{{ s.ownerName || 'Anonymous' }}</div>
                        <div class="text-xs text-foreground/50 truncate">{{ s.targetJobTitle || 'Professional' }}</div>
                      </div>
                      <span class="text-[10px] rounded-full px-2 py-1 glass-badge text-foreground/70 shrink-0 ml-2" style="border-color: rgba(255, 240, 230, 0.14);">
                        View
                      </span>
                    </div>
                  </article>
                }
                <!-- Second Set (Duplicate for seamless scroll) -->
                @for (s of communityResumes(); track 'dup-' + s.resumeId) {
                  <article [routerLink]="['/community/resume', s.resumeId]" class="glass-card shrink-0 w-[260px] md:w-[280px] p-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer group" style="border-color: rgba(255, 240, 230, 0.14);">
                    <div class="rounded-xl overflow-hidden relative border border-white/5 group-hover:border-teal-500/20 transition-all mb-4">
                      <app-mini-resume-preview
                        [resumeId]="s.resumeId"
                        [scaleFactor]="0.28"
                        [containerHeight]="280">
                      </app-mini-resume-preview>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm text-foreground truncate">{{ s.ownerName || 'Anonymous' }}</div>
                        <div class="text-xs text-foreground/50 truncate">{{ s.targetJobTitle || 'Professional' }}</div>
                      </div>
                      <span class="text-[10px] rounded-full px-2 py-1 glass-badge text-foreground/70 shrink-0 ml-2" style="border-color: rgba(255, 240, 230, 0.14);">
                        View
                      </span>
                    </div>
                  </article>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Pricing Teaser -->
        <section id="pricing" class="relative py-24 md:py-32">
          <div class="mx-auto max-w-6xl px-6 animate-fade-in">
            <div class="text-center max-w-2xl mx-auto mb-14">
              <div class="inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-xs text-foreground/70 mb-6" style="border-color: rgba(255, 240, 230, 0.14);">
                04 · Pricing
              </div>
              <h2 class="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
                Simple plans, <span class="font-serif-italic text-foreground/95">serious results.</span>
              </h2>
            </div>
            <div class="grid md:grid-cols-3 gap-5">
              @for (t of tiers; track t.name) {
                <div class="glass-card p-8 md:p-10 flex flex-col relative overflow-visible"
                     [class.md:-translate-y-3]="t.featured"
                     [style.borderColor]="t.featured ? 'oklch(0.85 0.10 70 / 0.55)' : 'rgba(255, 240, 230, 0.14)'"
                     [style.boxShadow]="t.featured ? '0 20px 60px -20px oklch(0.55 0.22 25 / 0.5)' : ''">
                  
                  @if (t.featured) {
                    <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap z-10" style="background: oklch(0.85 0.10 70); color: oklch(0.20 0.08 25);">
                      ✦ Best Value
                    </div>
                  }
                  
                  <div class="text-sm text-foreground/60 mb-2">{{ t.name }}</div>
                  <div class="flex items-baseline gap-1 mb-3">
                    <span class="font-display text-5xl tracking-tight">{{ t.price }}</span>
                    <span class="text-sm text-foreground/45">{{ t.period }}</span>
                  </div>
                  <p class="text-sm text-foreground/55 mb-6">{{ t.desc }}</p>
                  
                  <ul class="space-y-3 text-sm text-foreground/75 mb-8 flex-1">
                    @for (f of t.features; track f) {
                      <li class="flex items-start gap-2.5">
                        <span class="mt-2 h-1 w-1 rounded-full bg-foreground/60 shrink-0"></span>
                        {{ f }}
                      </li>
                    }
                  </ul>
                  
                  <a [routerLink]="t.name === 'Free' ? '/auth/register' : '/payment'"
                     [queryParams]="t.priceValue ? { price: t.priceValue } : null"
                     class="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
                     [style.background]="t.variant === 'primary' ? 'var(--color-foreground)' : 'rgba(255, 240, 230, 0.05)'"
                     [style.color]="t.variant === 'primary' ? 'var(--color-background)' : 'var(--color-foreground)'"
                     [style.border]="t.variant === 'primary' ? 'none' : '1px solid rgba(255, 240, 230, 0.12)'">
                    {{ t.cta }}
                  </a>
                </div>
              }
            </div>
          </div>
        </section>
      </main>

      <!-- Footer -->
      <footer class="relative border-t mt-16" style="border-color: rgba(255,255,255,0.1);">
        <div class="mx-auto max-w-6xl px-6 py-14">
          <div class="grid md:grid-cols-4 gap-10 mb-12">
            <div class="md:col-span-1">
              <div class="font-serif-italic text-3xl text-foreground/80 mb-3">Resumade</div>
              <p class="text-sm text-foreground/40 max-w-xs">
                AI-built resumes that land interviews — tailored, scored, and shipped.
              </p>
            </div>
            
            <div>
              <div class="text-xs uppercase tracking-widest text-foreground/45 mb-4">Product</div>
              <ul class="space-y-2.5">
                <li><a routerLink="/explore" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Templates</a></li>
                <li><a routerLink="/community" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Community</a></li>
                <li><a routerLink="/pricing" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Pricing</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <div class="text-xs uppercase tracking-widest text-foreground/45 mb-4">Company</div>
              <ul class="space-y-2.5">
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">About</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Careers</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Blog</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <div class="text-xs uppercase tracking-widest text-foreground/45 mb-4">Legal</div>
              <ul class="space-y-2.5">
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Privacy</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Terms</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Cookies</a></li>
                <li><a routerLink="#" class="text-sm text-foreground/55 hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between pt-8 border-t gap-3" style="border-color: rgba(255,255,255,0.1);">
            <p class="text-xs text-foreground/35">© 2026 Resumade. Made for ambitious candidates.</p>
            <p class="text-xs text-foreground/35">Crafted with Gemini · Hosted on Lovable</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class IndexComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  auth = inject(AuthService);
  resumeService = inject(ResumeService);

  communityResumes = signal<BackendResume[]>([]);

  dashboardLink = computed(() => {
    return this.auth.user()?.role === 'ADMIN' ? '/admin' : '/dashboard';
  });

  ngOnInit() {
    this.resumeService.getPublicResumes().subscribe({
      next: (resumes) => {
        this.communityResumes.set(resumes.slice(0, 8));
      }
    });
  }

  ngAfterViewInit() {
    this.initAnimations();
  }

  private initAnimations() {
    // Hero Entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });
    
    tl.fromTo('.hero-title', 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, delay: 0.2 }
    )
    .fromTo('.hero-subtitle', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1 }, 
      '-=0.8'
    )
    .fromTo('.hero-cta', 
      { y: 15, opacity: 0 }, 
      { y: 0, opacity: 1 }, 
      '-=0.8'
    );

    // Scroll Reveal Sections
    gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
      gsap.fromTo(section, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  tiers = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      desc: "Get started with the essentials.",
      features: ["3 resumes", "Basic AI summaries", "PDF export", "Community templates"],
      cta: "Get started",
      variant: "glass",
      featured: false,
      priceValue: 0
    },
    {
      name: "Monthly",
      price: "₹499",
      period: "/ month",
      desc: "For active job seekers.",
      features: ["Unlimited resumes", "Gemini everywhere", "ATS scoring", "Job tailoring"],
      cta: "Get Monthly",
      variant: "glass",
      featured: false,
      priceValue: 499
    },
    {
      name: "Annual",
      price: "₹3,999",
      period: "/ year",
      desc: "Best value · ₹333/mo.",
      features: ["Everything in Monthly", "Tailor Resume (Premium)", "Priority AI access", "Save 33% annually"],
      cta: "Upgrade to Annual",
      variant: "primary",
      featured: true,
      priceValue: 3999
    },
  ];
}
