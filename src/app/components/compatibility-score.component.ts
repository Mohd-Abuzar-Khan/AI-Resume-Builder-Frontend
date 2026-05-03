import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compatibility-score',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="compatibility-score-container">
      <div class="score-circle-wrapper">
        <svg viewBox="0 0 120 120" class="score-svg">
          <!-- Background circle -->
          <circle cx="60" cy="60" r="55" class="bg-circle" />
          
          <!-- Animated progress circle -->
          <circle 
            cx="60" 
            cy="60" 
            r="55" 
            class="progress-circle"
            [attr.stroke]="getScoreColor()"
            [style.stroke-dashoffset]="calculateStrokeDashOffset()"
          />
          
          <!-- Center circle for smooth appearance -->
          <circle cx="60" cy="60" r="48" class="center-circle" />
        </svg>
        
        <div class="score-content">
          <div class="score-number">{{ score }}</div>
          <div class="score-label">Match</div>
        </div>
      </div>
      
      <div class="score-badge">{{ getScoreLabel() }}</div>
    </div>
  `,
  styles: [`
    .compatibility-score-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .score-circle-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .score-svg {
      width: 140px;
      height: 140px;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
    }

    .bg-circle {
      fill: rgba(31, 58, 110, 0.04);
      stroke: rgba(31, 58, 110, 0.08);
      stroke-width: 1;
    }

    .progress-circle {
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      stroke-dasharray: 345.575;
      stroke-dashoffset: 0;
      transform-origin: 50% 50%;
      transform: rotate(-90deg);
      transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), 
                  stroke 0.6s ease-out;
      animation: fadeIn 0.8s ease-out;
    }

    .center-circle {
      fill: white;
      stroke: none;
    }

    .score-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
    }

    .score-number {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      animation: countUp 1s ease-out 0.2s both;
    }

    .score-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.5;
    }

    .score-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 6px 12px;
      border-radius: 20px;
      white-space: nowrap;
      animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      from {
        transform: translate(-50%, -50%) scale(0.6);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(12px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes countUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Color theming for different score ranges */
    :host.score-excellent .score-number { color: #10b981; }
    :host.score-excellent .score-label { color: #10b981; }
    :host.score-excellent .score-badge { background: rgba(16, 185, 129, 0.1); color: #059669; border: 0.5px solid rgba(16, 185, 129, 0.2); }

    :host.score-good .score-number { color: #3b82f6; }
    :host.score-good .score-label { color: #3b82f6; }
    :host.score-good .score-badge { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; border: 0.5px solid rgba(59, 130, 246, 0.2); }

    :host.score-fair .score-number { color: #f59e0b; }
    :host.score-fair .score-label { color: #f59e0b; }
    :host.score-fair .score-badge { background: rgba(245, 158, 11, 0.1); color: #d97706; border: 0.5px solid rgba(245, 158, 11, 0.2); }

    :host.score-low .score-number { color: #ef4444; }
    :host.score-low .score-label { color: #ef4444; }
    :host.score-low .score-badge { background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 0.5px solid rgba(239, 68, 68, 0.2); }
  `]
})
export class CompatibilityScoreComponent implements OnInit {
  @Input() score: number = 0;
  @HostBinding('class') hostClass: string = '';

  getScoreColor(): string {
    if (this.score >= 80) return '#10b981'; // Green - Excellent
    if (this.score >= 60) return '#3b82f6'; // Blue - Good
    if (this.score >= 40) return '#f59e0b'; // Orange - Fair
    return '#ef4444'; // Red - Low
  }

  getScoreLabel(): string {
    if (this.score >= 80) return 'Excellent Match';
    if (this.score >= 60) return 'Good Match';
    if (this.score >= 40) return 'Fair Match';
    return 'Needs Work';
  }

  getScoreClass(): string {
    if (this.score >= 80) return 'score-excellent';
    if (this.score >= 60) return 'score-good';
    if (this.score >= 40) return 'score-fair';
    return 'score-low';
  }

  calculateStrokeDashOffset(): number {
    const circumference = 345.575; // 2 * Math.PI * 55
    const offset = circumference - (this.score / 100) * circumference;
    return offset;
  }

  ngOnInit() {
    // Apply the appropriate CSS class to the host element
    this.hostClass = this.getScoreClass();
  }
}
