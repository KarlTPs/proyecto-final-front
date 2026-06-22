import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const adminGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const auth   = inject(Auth);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  // Autenticado pero sin rol admin → ir al catálogo
  if (auth.isAuthenticated()) return router.createUrlTree(['/books']);

  // Sin sesión → al login
  return router.createUrlTree(['/auth/login']);
};