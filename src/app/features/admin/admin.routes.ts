import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
  },
  {
    path: 'books',
    loadComponent: () => import('./pages/book-management/book-management').then(m => m.BookManagement),
  },
  {
  path: 'books/new',
  loadComponent: () => import('../../features/books/pages/book-form/book-form')
    .then(m => m.BookForm),
  canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'reviews',
    loadComponent: () => import('./pages/review-moderation/review-moderation').then(m => m.ReviewModeration),
  },
];