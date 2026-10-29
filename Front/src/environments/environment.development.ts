// Configuration de développement (ng serve), remplace environment.ts via angular.json
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  // Pas encore de backend : on simule l'API en local (voir mock/fausse-api.interceptor.ts)
  fausseApi: true,
};
