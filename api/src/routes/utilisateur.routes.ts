import { Application, Router } from "express";
import utilisateurController from "../controllers/utilisateur.controllers";

export default (app: Application): void => {
  const router = Router();

  router.get("/", utilisateurController.lister);
  router.post("/", utilisateurController.inscrire);
  router.post("/connexion", utilisateurController.connecter);

  // /api/users (consigne du TP04) et /api/utilisateurs (ancien chemin)
  app.use("/api/users", router);
  app.use("/api/utilisateurs", router);
};
