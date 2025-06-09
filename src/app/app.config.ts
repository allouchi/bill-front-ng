import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BILLING_ROUTE } from './app.routes';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './shared/interceptor/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(BILLING_ROUTE),
    provideHttpClient(), // ← doit être là avant
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
