import { Application } from "express";
import pollutionRoutes from "./pollution.routes";
import utilisateurRoutes from "./utilisateur.routes";

export default (app: Application): void => {
  pollutionRoutes(app);
  utilisateurRoutes(app);
};
