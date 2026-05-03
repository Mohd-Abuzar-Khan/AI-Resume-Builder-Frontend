import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpgradeModalComponent } from './components/upgrade-modal';
import { PopupComponent } from './components/popup';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UpgradeModalComponent, PopupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-upgrade-modal></app-upgrade-modal><app-popup></app-popup><router-outlet></router-outlet>`,
})
export class App {}
