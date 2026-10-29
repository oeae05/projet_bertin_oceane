// Configuration de production (ng build)
export const environment = {
  production: true,
  // API déployée sur Render (dossier api/)
  apiUrl: 'https://pollution-api-nxdm.onrender.com/api',
  // true : les appels à l'API sont simulés dans le navigateur (pas de backend)
  fausseApi: false,
};
