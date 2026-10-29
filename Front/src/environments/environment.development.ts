// Configuration de développement (ng serve), remplace environment.ts via angular.json
export const environment = {
  production: false,
  // API déployée sur Render (dossier api/). Pour l'API lancée en local : 'http://localhost:3000/api'
  apiUrl: 'https://pollution-api-nxdm.onrender.com/api',
  // true : les appels à l'API sont simulés dans le navigateur (voir mock/fausse-api.interceptor.ts)
  fausseApi: false,
};
