import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/layouts/body/app.component';
import { appConfig } from './app/app.config';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(AppComponent, appConfig).then((appRef) => {
  const injector = appRef.injector;
  const translate = injector.get(TranslateService);

  translate.setDefaultLang('fr');
  translate.use('fr'); // important !
});