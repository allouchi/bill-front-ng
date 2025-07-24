import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token = this.authService.getAccessToken();

    let cloned = req;

    if (token) {
      cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return next.handle(cloned).pipe(
      catchError((err) => {
        if (err.status === 401) {
          return this.authService.refreshAccessToken().pipe(
            switchMap(() => {
              const newToken = this.authService.getAccessToken();
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next.handle(newReq);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
