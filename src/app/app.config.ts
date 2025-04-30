import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BILLING_ROUTE } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
;


export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(BILLING_ROUTE),
        provideHttpClient()]
};