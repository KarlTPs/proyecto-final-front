import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
  },
  {
    path: 'affinity',
    loadComponent: () => import('./pages/affinity/affinity').then(m => m.Affinity),
  },
  {
    path: ':id/reviews',
    loadComponent: () => import('./pages/user-reviews/user-reviews').then(m => m.UserReviews),
  },
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
];