import { Component, Input, EventEmitter, Output } from '@angular/core';
import { BackendResume } from '../core/services/resume.service';

@Component({
  selector: 'app-public-resume-card',
  standalone: true,
  imports: [],
  template: `
    <div class="glass-card rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-md h-full flex flex-col">
      <!-- Paper preview -->
      <div class="bg-white m-3 rounded-xl p-4 h-[160px] overflow-hidden relative shadow-[0_1px_4px_rgba(0,0,0,0.06)] group-hover:scale-[1.02] transition-transform">
        <p class="text-[9px] font-medium" style="color:#111">{{ resume.title }}</p>
        <p class="text-[8px] mt-0.5" style="color:rgba(0,0,0,0.35)">{{ resume.targetJobTitle || 'Professional' }}</p>
        <div class="mt-2 space-y-1 pocket-fade">
          <div class="h-[3px] rounded-full w-full" style="background:rgba(0,0,0,0.06)"></div>
          <div class="h-[3px] rounded-full w-4/5" style="background:rgba(0,0,0,0.06)"></div>
          <div class="h-[3px] rounded-full w-3/5" style="background:rgba(0,0,0,0.04)"></div>
          <div class="h-[3px] rounded-full w-4/5" style="background:rgba(0,0,0,0.04)"></div>
        </div>
        <!-- Hover link -->
        <div class="absolute bottom-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-[12px] font-medium" style="color:#1F3A6E">Use as template</span>
        </div>
      </div>

      <!-- Info -->
      <div class="px-4 pb-3 flex flex-col flex-1">
        <p class="text-[14px] font-medium" style="color:#111">{{ resume.ownerName || resume.title }}</p>
        <p class="text-[13px]" style="color:rgba(0,0,0,0.45)">{{ resume.targetJobTitle || 'Professional' }}</p>
        <p class="text-[11px] mt-auto pt-1" style="color:rgba(0,0,0,0.28)">{{ resume.viewCount || 0 }} views</p>
      </div>
    </div>
  `,
})
export class PublicResumeCardComponent {
  @Input({ required: true }) resume!: BackendResume;
}
