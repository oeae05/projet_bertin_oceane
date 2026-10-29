import db from "./models";
import { PollutionCreationAttributes } from "./models/pollutions.model";

// Jeu de données inséré au premier démarrage, quand la table pollution est vide
const EXEMPLES: PollutionCreationAttributes[] = [
  {
    titre: "Bouteilles plastiques sur la plage",
    type: "Plastique",
    description: "Une dizaine de bouteilles et des sacs plastiques laissés près des rochers.",
    dateObservation: "2026-09-12",
    lieu: "Plage du Prado, Marseille",
    latitude: 43.259,
    longitude: 5.375,
    auteur: "exemple",
  },
  {
    titre: "Dépôt de gravats en forêt",
    type: "Dépôt sauvage",
    description: "Gravats et pots de peinture abandonnés au bord du chemin forestier.",
    dateObservation: "2026-10-02",
    lieu: "Forêt de Haye, Nancy",
    latitude: 48.672,
    longitude: 6.108,
    auteur: "exemple",
  },
  {
    titre: "Mousse suspecte dans la Moselle",
    type: "Eau",
    description: "Mousse blanche et odeur chimique à la sortie d'une canalisation.",
    dateObservation: "2026-10-18",
    lieu: "Quai Paul Vautrin, Metz",
    latitude: 49.121,
    longitude: 6.17,
    auteur: "exemple",
  },
];

export async function initialiserDonnees(): Promise<void> {
  if ((await db.pollutions.count()) === 0) {
    await db.pollutions.bulkCreate(EXEMPLES);
    console.log("Jeu de données initial inséré dans la table pollution.");
  }
}
