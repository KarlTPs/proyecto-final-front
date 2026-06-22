import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/book-catalog/book-catalog').then(m => m.BookCatalog),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/book-detail/book-detail').then(m => m.BookDetail),
  },
  {
    // Solo admin llega aquí — el adminGuard ya lo garantiza desde app.routes.ts
    path: ':id/edit',
    loadComponent: () => import('./pages/book-form/book-form').then(m => m.BookForm),
    canDeactivate: [unsavedChangesGuard],
  },
];