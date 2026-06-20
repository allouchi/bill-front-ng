import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core'; // 👈 Ajout de Injector
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

  // 1. On injecte uniquement l'Injector d'Angular ici pour casser la dépendance circulaire
  constructor(private readonly injector: Injector) { }

  // Getters privés pour récupérer tes services "à la demande" sans bloquer l'initialisation d'Angular
  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  private get router(): Router {
    return this.injector.get(Router);
  }

  private get alertService(): AlertService {
    return this.injector.get(AlertService);
  }

  private get isAuthService(): IsAuthService {
    return this.injector.get(IsAuthService);
  }

  private get libelleCompanyService(): LibelleCompanyService {
    return this.injector.get(LibelleCompanyService);
  }

  private get sharedMessagesService(): SharedMessagesService {
    return this.injector.get(SharedMessagesService);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    // 🔥 BYPASS BOT (aucune auth)
    if (req.url.includes('/api/bot')) {
      return next.handle(req);
    }

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