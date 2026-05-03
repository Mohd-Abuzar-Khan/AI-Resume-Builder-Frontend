import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const premiumGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getPlan() === 'PREMIUM') {
    return true;
  }

  router.navigate(['/pricing']);
  return false;
};
