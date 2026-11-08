import express, { Application, Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import db from "./models";
import initRoutes from "./routes";
import { initialiserDonnees } from "./seed";

const app: Application = express();

app.use(
  cors({
    origin: config.corsOrigin === "*" ? "*" : config.corsOrigin.split(","),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // X-Utilisateur : identité ajoutée par l'intercepteur Angular
    allowedHeaders: "Content-Type, Authorization, X-Utilisateur",
  }),
);
app.use(express.json());

// health checks (Render appelle /health pour savoir si le service est prêt)
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

initRoutes(app);

// Crée les tables si elles n'existent pas, puis démarre le serveur
db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    await initialiserDonnees();
    // 0.0.0.0 : écoute sur toutes les interfaces, nécessaire sur Render
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server is running on port ${config.port}.`);
    });
  })
  .catch((err: Error) => {
    console.error("Failed to sync db: " + err.message);
    process.exit(1);
  });

export default app;
