import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, provideAppInitializer } from '@angular/core';
import {
  catchError,
  Observable,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  EMPTY,
} from 'rxjs';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alertService';
import { IsAuthService } from '../../services/shared/islogin-service';
import { LibelleCompanyService } from '../../services/shared/libelle-company-service';
import { SharedMessagesService } from '../../services/shared/messages.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly isAuthService: IsAuthService,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly sharedMessagesService: SharedMessagesService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();

    let cloned = req;

    if (token) {
      cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // ⚠️ éviter refresh sur login/refresh endpoint

        if (req.url.includes('/login') || req.url.includes('/refresh-token')) {
          return throwError(() => error);
        }

        if (error.status === 401) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      }),
    );
  }

  reload() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.isAuthService.setIsAuth(false);
      this.sharedMessagesService.setMessage('');
      this.libelleCompanyService.setMessage('');
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;

          const newToken = this.authService.getAccessToken();
          this.refreshTokenSubject.next(newToken);

          return next.handle(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            }),
          );
        }),
        catchError((err) => {
          this.isRefreshing = false;

          // ❌ refresh échoué → logout
          this.reload();
          this.alertService.showFunctionlError(err);
          return EMPTY;
        }),
      );
    } else {
      // ⏳ attendre que le refresh se termine
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) =>
          next.handle(
            req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            }),
          ),
        ),
      );
    }
  }
}
