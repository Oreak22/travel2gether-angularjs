// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check signal value for authentication
  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth'], {
    queryParams: { returnUrl: state.url },
  });
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check signals for both authentication and admin role
  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  // If user is authenticated but not admin, send to Not Found
  return router.createUrlTree(['/not-found']);
};

// Redirect guard used on public auth routes - prevents logged-in users from seeing auth pages
export const authRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true; // allow unauthenticated users to access auth pages
  }

  // If authenticated, route them based on role
  const user = authService.currentUser();
  if (user?.role === 'admin') {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/packages']);
};
