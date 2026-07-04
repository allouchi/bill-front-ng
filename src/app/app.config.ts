import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { BILLING_ROUTE } from './app.routes';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './shared/interceptor/auth-interceptor';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { Observable } from 'rxjs';


export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return {
    getTranslation: (lang: string): Observable<any> =>
      http.get(`./assets/i18n/${lang}.json`)
  } as TranslateLoader;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      BILLING_ROUTE,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    importProvidersFrom([TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    })])
  ],
};

