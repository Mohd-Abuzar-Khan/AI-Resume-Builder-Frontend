import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BackendTemplate } from '../core/services/template.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group glass-card rounded-2xl p-3 transition-all hover:shadow-md relative cursor-pointer" (click)="selectTemplate.emit(template)">
      @if (template.isPremium) {
        <div class="absolute -top-2 -right-2 z-10 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Premium
        </div>
      }

      <!-- Resume preview -->
      <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10">
        @if (template.thumbnailUrl || template.previewUrl) {
          <img [src]="template.thumbnailUrl || template.previewUrl" 
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
               [alt]="template.name" />
        } @else {
          <div class="absolute inset-0 bg-white/5 rounded-xl pocket-fade">
            <div class="h-10 w-full opacity-40" [style.background]="'hsl(' + (200 + (template.templateId ?? 0) * 20) + ' 30% 60%)'"></div>
            <div class="p-3 space-y-1.5">
              <div class="h-2 w-3/5 rounded-full bg-white/10"></div>
              <div class="h-1.5 w-2/5 rounded-full bg-white/5"></div>
              <div class="pt-2 space-y-1">
                <div class="h-1 w-full rounded-full bg-white/5"></div>
                <div class="h-1 w-11/12 rounded-full bg-white/5"></div>
                <div class="h-1 w-9/12 rounded-full bg-white/5"></div>
              </div>
              <div class="pt-2 space-y-1">
                <div class="h-1.5 w-2/5 rounded-full bg-white/10"></div>
                <div class="h-1 w-full rounded-full bg-white/5"></div>
                <div class="h-1 w-10/12 rounded-full bg-white/5"></div>
              </div>
            </div>
          </div>
        }

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-20">
          <button class="bg-white text-black rounded-lg px-4 py-2 text-[13px] font-medium transition-all cursor-pointer">
            View Preview
          </button>
        </div>
      </div>

      <div class="px-1 pt-3 pb-1">
        <p class="text-[14px] font-medium text-white/90">{{ template.name }}</p>
        <p class="text-[12px] mt-0.5 line-clamp-1 opacity-40">{{ template.description }}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-[11px] opacity-30">{{ formatCategory(template.category) }}</span>
          <span class="text-[11px] opacity-30">{{ template.usageCount }} uses</span>
        </div>
      </div>
    </div>
  `,
})
export class TemplateCardComponent {
  @Input({ required: true }) template!: BackendTemplate;
  @Output() selectTemplate = new EventEmitter<BackendTemplate>();

  formatCategory(c: string): string {
    return c.replace('_', ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  }
}
