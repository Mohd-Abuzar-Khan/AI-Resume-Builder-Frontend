import { Injectable, signal } from '@angular/core';

export type PopupType = 'alert' | 'confirm' | 'success' | 'error' | 'info';

export interface PopupState {
  type: PopupType;
  title: string;
  message: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  onPrimaryClick?: () => void | Promise<void>;
  onSecondaryClick?: () => void | Promise<void>;
  icon?: string; // lucide icon name
}

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private readonly popupStack = signal<PopupState[]>([]);
  
  readonly popups = this.popupStack.asReadonly();
  readonly activePopup = signal<PopupState | null>(null);

  show(state: PopupState): void {
    // Set as active if no popup is currently active
    if (!this.activePopup()) {
      this.activePopup.set(state);
    } else {
      // Queue it in the stack
      this.popupStack.update(stack => [...stack, state]);
    }
  }

  close(): void {
    // Move to next popup in stack if available
    const nextPopup = this.popupStack()[0];
    
    if (nextPopup) {
      this.popupStack.update(stack => stack.slice(1));
      this.activePopup.set(nextPopup);
    } else {
      this.activePopup.set(null);
    }
  }

  // Convenience methods
  alert(title: string, message: string, primaryButtonLabel = 'OK'): void {
    this.show({
      type: 'alert',
      title,
      message,
      primaryButtonLabel,
      icon: 'AlertCircle'
    });
  }

  error(title: string, message: string, primaryButtonLabel = 'OK'): void {
    this.show({
      type: 'error',
      title,
      message,
      primaryButtonLabel,
      icon: 'AlertTriangle'
    });
  }

  success(title: string, message: string, primaryButtonLabel = 'OK'): void {
    this.show({
      type: 'success',
      title,
      message,
      primaryButtonLabel,
      icon: 'CheckCircle'
    });
  }

  info(title: string, message: string, primaryButtonLabel = 'OK'): void {
    this.show({
      type: 'info',
      title,
      message,
      primaryButtonLabel,
      icon: 'Info'
    });
  }

  confirm(
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void | Promise<void>,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel'
  ): void {
    this.show({
      type: 'confirm',
      title,
      message,
      primaryButtonLabel: confirmLabel,
      secondaryButtonLabel: cancelLabel,
      onPrimaryClick: onConfirm,
      onSecondaryClick: onCancel,
      icon: 'AlertCircle'
    });
  }
}
