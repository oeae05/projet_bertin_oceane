import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Request, Response } from "express";
import { Op, col, fn, where } from "sequelize";
import db from "../models";
import { UtilisateurInstance } from "../models/utilisateurs.model";
import { repondreErreur } from "./erreur";

const Utilisateurs = db.utilisateurs;
const scryptAsync = promisify(scrypt) as (mdp: string, sel: string, taille: number) => Promise<Buffer>;

// Hash stocké sous la forme "sel:hash" (scrypt, sel aléatoire par compte)
async function hacher(motDePasse: string): Promise<string> {
  const sel = randomBytes(16).toString("hex");
  const hash = await scryptAsync(motDePasse, sel, 64);
  return `${sel}:${hash.toString("hex")}`;
}

async function verifier(motDePasse: string, stocke: string): Promise<boolean> {
  const [sel, hash] = stocke.split(":");
  const calcule = await scryptAsync(motDePasse, sel, 64);
  return timingSafeEqual(calcule, Buffer.from(hash, "hex"));
}

// Les logins sont comparés sans tenir compte de la casse
function parLogin(login: string) {
  return Utilisateurs.findOne({ where: where(fn("lower", col("login")), Op.eq, login.toLowerCase()) });
}

// On ne renvoie jamais le hash au client
function publique(u: UtilisateurInstance) {
  const { login, nom, prenom, email } = u;
  return { login, nom, prenom, email };
}

// POST /api/utilisateurs -> 201 + utilisateur créé, 409 si le login est pris
export const inscrire = async (req: Request, res: Response): Promise<void> => {
  const { login, nom, prenom, email, motDePasse } = req.body ?? {};
  if (!login || !motDePasse) {
    res.status(400).json({ message: "Login et mot de passe obligatoires" });
    return;
  }
  try {
    if (await parLogin(login)) {
      res.status(409).json({ message: "Ce login est déjà utilisé" });
      return;
    }
    const utilisateur = await Utilisateurs.create({
      login,
      nom,
      prenom,
      email,
      motDePasseHash: await hacher(motDePasse),
    });
    res.status(201).json(publique(utilisateur));
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de l'inscription");
  }
};

// POST /api/utilisateurs/connexion -> 200 + utilisateur, 401 si identifiants faux
export const connecter = async (req: Request, res: Response): Promise<void> => {
  const { login, motDePasse } = req.body ?? {};
  try {
    const utilisateur = login && motDePasse ? await parLogin(login) : null;
    if (!utilisateur || !(await verifier(motDePasse, utilisateur.motDePasseHash))) {
      res.status(401).json({ message: "Login ou mot de passe incorrect" });
      return;
    }
    res.status(200).json(publique(utilisateur));
  } catch (err) {
    repondreErreur(res, err, "Erreur lors de la connexion");
  }
};

export default { inscrire, connecter };
