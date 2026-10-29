import { Response } from "express";
import { ValidationError } from "sequelize";

// Réponse d'erreur au format attendu par le front : { message }
export function repondreErreur(res: Response, err: unknown, contexte: string): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(contexte, err);
  res.status(500).json({ message: `${contexte} : ${message}` });
}
