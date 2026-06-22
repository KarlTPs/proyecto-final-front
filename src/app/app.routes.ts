import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  // Rutas públicas — sin layout
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // Rutas protegidas — con layout
  {
    path: '',
    component: MainLayout,
    canMatch: [authGuard],
    children: [
      {
        path: 'books',
        loadChildren: () => import('./features/books/books.routes').then(m => m.BOOKS_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
      },
      {
        path: 'admin',
        canMatch: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      },
      { path: '', redirectTo: 'books', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'books' },
];