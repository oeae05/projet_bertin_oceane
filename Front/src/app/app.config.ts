import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { fausseApiInterceptor } from './mock/fausse-api.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // withComponentInputBinding : les paramètres de route (:id) arrivent dans les input()
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      // l'ordre compte : l'en-tête d'identité est ajouté avant que la fausse API lise la requête
      withInterceptors([authInterceptor, ...(environment.fausseApi ? [fausseApiInterceptor] : [])]),
    ),
    { provide: LOCALE_ID, useValue: 'fr' },
  ]
};
