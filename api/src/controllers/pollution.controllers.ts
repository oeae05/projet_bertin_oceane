import { Request, Response } from "express";
import db from "../models";
import { PollutionAttributes } from "../models/pollutions.model";
import { repondreErreur } from "./erreur";

const Pollutions = db.pollutions;

// Identité envoyée par le front (Front/src/app/interceptors/auth.interceptor.ts)
export const EN_TETE_UTILISATEUR = "x-utilisateur";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Seuls ces champs viennent du client : id, auteur et dates sont fixés par l'API
function champsModifiables(corps: Partial<PollutionAttributes> = {}) {
  const { titre, type, description, dateObservation, lieu, latitude, longitude, photoUrl } = corps;
  return { titre, type, description, dateObservation, lieu, latitude, longitude, photoUrl: photoUrl ?? null };
}

function auteurConnecte(req: Request, res: Response): string | null {
  const login = req.header(EN_TETE_UTILISATEUR)?.trim();
  if (!login) {
    res.status(401).json({ message: "Il faut être connecté" });
    return null;
  }
  return login;
}

async function trouver(req: Request, res: Response) {
  const id = String(req.params.id);
  const pollution = UUID.test(id) ? await Pollutions.findByPk(id) : null;
  if (!pollution) {
    res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}` });
  }
  return pollution;
}

// GET /api/pollutions -> 200 + toutes les pollutions, les plus récentes d'abord
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({ order: [["dateObservation", "DESC"]] });
    res.status(200).json(data);
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de la récupération des pollutions");
  }
};

// GET /api/pollutions/:id -> 200 + pollution, 404 si inconnue
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pollution = await trouver(req, res);
    if (pollution) res.status(200).json(pollution);
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de la récupération de la pollution");
  }
};

// POST /api/pollutions -> 201 + pollution créée, 401 si non connecté
export const create = async (req: Request, res: Response): Promise<void> => {
  const auteur = auteurConnecte(req, res);
  if (!auteur) return;
  try {
    const pollution = await Pollutions.create({ ...champsModifiables(req.body), auteur } as PollutionAttributes);
    res.status(201).json(pollution);
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de la création de la pollution");
  }
};

// PUT /api/pollutions/:id -> 200 + pollution modifiée, 403 si on n'en est pas l'auteur
export const update = async (req: Request, res: Response): Promise<void> => {
  const auteur = auteurConnecte(req, res);
  if (!auteur) return;
  try {
    const pollution = await trouver(req, res);
    if (!pollution) return;
    if (pollution.auteur !== auteur) {
      res.status(403).json({ message: "Seul l'auteur peut modifier cette pollution" });
      return;
    }
    await pollution.update({ ...champsModifiables(req.body), dateModification: new Date() } as PollutionAttributes);
    res.status(200).json(pollution);
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de la modification de la pollution");
  }
};

// DELETE /api/pollutions/:id -> 204, 403 si on n'en est pas l'auteur
export const remove = async (req: Request, res: Response): Promise<void> => {
  const auteur = auteurConnecte(req, res);
  if (!auteur) return;
  try {
    const pollution = await trouver(req, res);
    if (!pollution) return;
    if (pollution.auteur !== auteur) {
      res.status(403).json({ message: "Seul l'auteur peut supprimer cette pollution" });
      return;
    }
    await pollution.destroy();
    res.status(204).end();
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de la suppression de la pollution");
  }
};

export default { getAll, getById, create, update, remove };
