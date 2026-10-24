import { HttpRequest, HttpResponse } from '@angular/common/http';
import { EN_TETE_UTILISATEUR } from '../interceptors/auth.interceptor';
import { Declaration, ETypePollution, Pollution } from '../models/pollution';
import { ecrire, lire } from '../services/stockage';
import { erreur } from './erreur';

/**
 * Routes /pollutions du backend simulé (voir fausse-api.interceptor.ts).
 * Les pollutions sont stockées dans le localStorage.
 */
const CLE_POLLUTIONS = 'pollutions';
// Clé utilisée avant le TP03, quand les déclarations étaient gérées sans API
const ANCIENNE_CLE = 'declarations';

// Quelques pollutions pour que la liste ne soit pas vide au premier lancement
const EXEMPLES: Declaration[] = [
  {
    id: 'exemple-1',
    titre: 'Bouteilles plastiques sur la plage',
    type: ETypePollution.PLASTIQUE,
    description: 'Une dizaine de bouteilles et des sacs plastiques laissés près des rochers.',
    dateObservation: '2026-09-12',
    lieu: 'Plage du Prado, Marseille',
    latitude: 43.259,
    longitude: 5.375,
    photoUrl: null,
    auteur: 'exemple',
    dateCreation: '2026-09-12T10:30:00.000Z',
  },
  {
    id: 'exemple-2',
    titre: 'Dépôt de gravats en forêt',
    type: ETypePollution.DEPOT_SAUVAGE,
    description: 'Gravats et pots de peinture abandonnés au bord du chemin forestier.',
    dateObservation: '2026-10-02',
    lieu: 'Forêt de Haye, Nancy',
    latitude: 48.672,
    longitude: 6.108,
    photoUrl: null,
    auteur: 'exemple',
    dateCreation: '2026-10-02T15:00:00.000Z',
  },
  {
    id: 'exemple-3',
    titre: 'Mousse suspecte dans la Moselle',
    type: ETypePollution.EAU,
    description: "Mousse blanche et odeur chimique à la sortie d'une canalisation.",
    dateObservation: '2026-10-18',
    lieu: 'Quai Paul Vautrin, Metz',
    latitude: 49.121,
    longitude: 6.17,
    photoUrl: null,
    auteur: 'exemple',
    dateCreation: '2026-10-18T08:45:00.000Z',
  },
];

export function listerPollutions(req: HttpRequest<unknown>): HttpResponse<Declaration[]> {
  return new HttpResponse({ status: 200, body: charger(), url: req.url });
}

export function obtenirPollution(req: HttpRequest<unknown>, id: string): HttpResponse<Declaration> {
  return new HttpResponse({ status: 200, body: trouver(req, charger(), id), url: req.url });
}

export function creerPollution(req: HttpRequest<Pollution>): HttpResponse<Declaration> {
  const auteur = auteurDe(req);
  const pollution: Declaration = {
    ...valider(req),
    id: crypto.randomUUID(),
    auteur,
    dateCreation: new Date().toISOString(),
  };
  enregistrer([...charger(), pollution]);
  return new HttpResponse({ status: 201, body: pollution, url: req.url });
}

export function modifierPollution(req: HttpRequest<Pollution>, id: string): HttpResponse<Declaration> {
  const pollutions = charger();
  const existante = verifierAuteur(req, trouver(req, pollutions, id));
  // id, auteur et date de création ne sont pas modifiables
  const modifiee: Declaration = {
    ...valider(req),
    id: existante.id,
    auteur: existante.auteur,
    dateCreation: existante.dateCreation,
    dateModification: new Date().toISOString(),
  };
  enregistrer(pollutions.map((p) => (p.id === id ? modifiee : p)));
  return new HttpResponse({ status: 200, body: modifiee, url: req.url });
}

export function supprimerPollution(req: HttpRequest<unknown>, id: string): HttpResponse<null> {
  const pollutions = charger();
  verifierAuteur(req, trouver(req, pollutions, id));
  enregistrer(pollutions.filter((p) => p.id !== id));
  return new HttpResponse({ status: 204, body: null, url: req.url });
}

function charger(): Declaration[] {
  return lire<Declaration[] | null>(CLE_POLLUTIONS, null) ?? lire(ANCIENNE_CLE, EXEMPLES);
}

function enregistrer(pollutions: Declaration[]): void {
  ecrire(CLE_POLLUTIONS, pollutions);
}

function trouver(req: HttpRequest<unknown>, pollutions: Declaration[], id: string): Declaration {
  const pollution = pollutions.find((p) => p.id === id);
  if (!pollution) {
    throw erreur(req, 404, "Cette pollution n'existe pas ou a été supprimée");
  }
  return pollution;
}

function auteurDe(req: HttpRequest<unknown>): string {
  const login = req.headers.get(EN_TETE_UTILISATEUR);
  if (!login) {
    throw erreur(req, 401, 'Il faut être connecté');
  }
  return login;
}

function verifierAuteur(req: HttpRequest<unknown>, pollution: Declaration): Declaration {
  if (pollution.auteur !== auteurDe(req)) {
    throw erreur(req, 403, "Seul l'auteur peut modifier ou supprimer cette pollution");
  }
  return pollution;
}

// Le serveur ne fait jamais confiance au client : on ne garde que les champs attendus
function valider(req: HttpRequest<Pollution>): Pollution {
  const b = req.body;
  const types = Object.values(ETypePollution) as string[];
  if (
    !b?.titre?.trim() ||
    !types.includes(b.type) ||
    !b.description?.trim() ||
    !b.dateObservation ||
    !b.lieu?.trim() ||
    !Number.isFinite(b.latitude) ||
    !Number.isFinite(b.longitude)
  ) {
    throw erreur(req, 400, 'Pollution incomplète ou invalide');
  }
  return {
    titre: b.titre.trim(),
    type: b.type,
    description: b.description.trim(),
    dateObservation: b.dateObservation,
    lieu: b.lieu.trim(),
    latitude: b.latitude,
    longitude: b.longitude,
    photoUrl: b.photoUrl || null,
  };
}
