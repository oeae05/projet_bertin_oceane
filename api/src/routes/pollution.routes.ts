import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";

export default (app: Application): void => {
  const router = Router();

  router.get("/", pollutionController.getAll);
  router.get("/:id", pollutionController.getById);
  router.post("/", pollutionController.create);
  router.put("/:id", pollutionController.update);
  router.delete("/:id", pollutionController.remove);

  // Exposition sous /api/pollutions et /api/pollution (pluriel et singulier)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
