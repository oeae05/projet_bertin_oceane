/**
 * Configuration lue dans les variables d'environnement.
 * En local : fichier .env (voir .env.example). Sur Render : onglet Environment du service.
 * Aucun secret n'est écrit dans le code.
 */
export const config = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  port: Number(process.env.PORT) || 3000,
  // Origines autorisées à appeler l'API (séparées par des virgules), * par défaut
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL manquante : copier .env.example en .env et la renseigner");
}

export default config;
