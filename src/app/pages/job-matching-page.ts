import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Puzzle } from 'lucide-angular';

@Component({
  selector: 'app-job-matching',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-fade-up">
      <div>
        <h1 class="text-4xl text-white/90 font-medium underline underline-offset-8 decoration-teal-500/30">Job Matching</h1>
        <p class="text-white/60 mt-4 text-lg max-w-2xl">Find the perfect roles that match your skills and experience using our AI matching engine.</p>
      </div>

      <div class="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6 border border-white/10">
        <div class="h-20 w-20 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
          <lucide-icon [name]="PuzzleIcon" class="h-10 w-10"></lucide-icon>
        </div>
        <div>
          <h2 class="text-2xl text-white/90 font-medium">Coming Soon</h2>
          <p class="text-white/60 mt-2 max-w-md mx-auto">We're finalizing our intelligent matching algorithm to bring you the most accurate job recommendations.</p>
        </div>
        <div class="flex gap-4 pt-4">
          <div class="h-1 w-12 rounded-full bg-teal-500/50"></div>
          <div class="h-1 w-12 rounded-full bg-white/10"></div>
          <div class="h-1 w-12 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>
  `,
})
export class JobMatchingComponent {
  readonly PuzzleIcon = Puzzle;
}
