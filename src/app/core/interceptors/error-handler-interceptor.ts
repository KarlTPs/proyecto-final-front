import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth   = inject(Auth);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.logout();
          router.navigate(['/auth/login']);
          break;
        case 403:
          router.navigate(['/403']);
          break;
        case 404:
          // Dejar que cada componente maneje su propio 404
          break;
        case 0:
          // Sin respuesta del servidor (caído, CORS, sin conexión) — Render/Railway tardan
          // en "despertar" en el plan free, así que esto puede ocurrir tras inactividad.
          router.navigate(['/500']);
          break;
        default:
          if (error.status >= 500) {
            router.navigate(['/500']);
          }
          break;
      }
      return throwError(() => error);
    })
  );
};