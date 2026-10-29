import { Application, Router } from "express";
import utilisateurController from "../controllers/utilisateur.controllers";

export default (app: Application): void => {
  const router = Router();

  router.post("/", utilisateurController.inscrire);
  router.post("/connexion", utilisateurController.connecter);

  app.use("/api/utilisateurs", router);
};
