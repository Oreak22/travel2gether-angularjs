import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  const token = isBrowser ? window.localStorage.getItem('j2g_auth_token') : null;

  const isApiUrl = req.url.startsWith(environment.apiUrl);

  // Attach token if making a request to our PHP REST API
  if (token && isApiUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && isBrowser) {
        window.localStorage.removeItem('j2g_auth_token');
        window.localStorage.removeItem('j2g_user_data');
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    }),
  );
};
