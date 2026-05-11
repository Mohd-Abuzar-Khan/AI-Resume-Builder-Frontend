import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Minus } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume-card',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Outer pocket wrapper -->
    <div class="resume-pocket">

      <!-- Main glass card container -->
      <div class="resume-glass-card group cursor-pointer hover:-translate-y-1 transition-all duration-300">
        
        <!-- Top label row -->
        <div class="px-5 pt-5 pb-3 flex items-start justify-between">
          <div>
            <div class="text-[14px] font-semibold text-[#1a1a2e]">{{ title }}</div>
            <div class="mt-0.5 text-[10px] text-black/40">{{ subtitle }}</div>
          </div>
        </div>

        <!-- Document preview — dark glass inner card -->
        <div class="mx-3 rounded-xl overflow-hidden relative"
             style="background: hsl(220 60% 20% / 0.55); 
                    backdrop-filter: blur(12px); 
                    border: 1px solid hsl(0 0% 100% / 0.08); 
                    min-height: 160px; 
                    padding: 20px;">
          
          <!-- Skeleton lines -->
          <div class="space-y-2">
            <div class="h-[3px] rounded-full w-3/4 bg-white/10"></div>
            <div class="h-[3px] rounded-full w-full bg-white/5"></div>
            <div class="h-[3px] rounded-full w-5/6 bg-white/5"></div>
            <div class="h-[3px] rounded-full w-full bg-white/5"></div>
            <div class="h-[3px] rounded-full w-2/3 bg-white/5"></div>
          </div>
          <div class="mt-6 space-y-2">
            <div class="h-[3px] rounded-full w-11/12 bg-white/5"></div>
            <div class="h-[3px] rounded-full w-9/12 bg-white/5"></div>
            <div class="h-[3px] rounded-full w-10/12 bg-white/5"></div>
          </div>

          <!-- Hover overlay -->
          <div class="resume-hover-overlay">
            <ng-content select="[slot=actions]"></ng-content>
          </div>
        </div>

        <!-- Bottom info row -->
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <div class="text-[13px] font-medium text-[#1a1a2e]">{{ title }}</div>
            <div class="mt-0.5 text-[10px] text-black/40">{{ updatedAgo }}</div>
          </div>
          <button (click)="$event.stopPropagation()"
                  class="grid h-8 w-8 place-items-center rounded-full border border-black/10 text-black/40 hover:bg-black/5 transition-colors cursor-pointer">
            <lucide-icon [name]="MinusIcon" class="h-3.5 w-3.5"></lucide-icon>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .resume-pocket {
      position: relative;
    }

    .resume-glass-card {
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(28px) saturate(160%);
      -webkit-backdrop-filter: blur(28px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.60);
      border-radius: 20px;
      box-shadow: 
        0 4px 20px rgba(100, 120, 160, 0.10),
        0 1px 0 rgba(255,255,255,0.75) inset;
      overflow: hidden;
    }

    .resume-hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(20, 30, 70, 0.40);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      z-index: 10;
    }

    .resume-glass-card:hover .resume-hover-overlay {
      opacity: 1;
    }
  `]
})
export class ResumeCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() atsScore?: number;
  @Input() updatedAgo = '2 days ago';

  readonly MinusIcon = Minus;
}
