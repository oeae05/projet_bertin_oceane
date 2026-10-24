import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, defer, switchMap, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription, Utilisateur } from '../models/utilisateur';
import { ecrire, lire } from '../services/stockage';
import { erreur } from './erreur';
import {
  creerPollution,
  listerPollutions,
  modifierPollution,
  obtenirPollution,
  supprimerPollution,
} from './pollutions.mock';

/**
 * Backend simulé, activé par environment.fausseApi tant que la vraie API n'existe pas.
 * Il intercepte les requêtes vers environment.apiUrl, répond aux mêmes routes que l'API
 * et stocke les données dans le localStorage. Les autres requêtes passent normalement.
 */
const CLE_UTILISATEURS = 'utilisateurs';
const LATENCE_MS = 400;

// Le mot de passe n'est jamais gardé en clair
interface UtilisateurEnregistre extends Utilisateur {
  motDePasseHash: string;
}

type Reponse = HttpResponse<unknown> | Promise<HttpResponse<unknown>>;

// Table des routes : méthode + chemin (les groupes capturés sont passés au traitement)
const ROUTES: { methode: string; chemin: RegExp; traiter: (req: HttpRequest<any>, ...p: string[]) => Reponse }[] = [
  { methode: 'POST', chemin: /^\/utilisateurs$/, traiter: inscrire },
  { methode: 'POST', chemin: /^\/utilisateurs\/connexion$/, traiter: connecter },
  { methode: 'GET', chemin: /^\/pollutions$/, traiter: listerPollutions },
  { methode: 'POST', chemin: /^\/pollutions$/, traiter: creerPollution },
  { methode: 'GET', chemin: /^\/pollutions\/([^/]+)$/, traiter: obtenirPollution },
  { methode: 'PUT', chemin: /^\/pollutions\/([^/]+)$/, traiter: modifierPollution },
  { methode: 'DELETE', chemin: /^\/pollutions\/([^/]+)$/, traiter: supprimerPollution },
];

export const fausseApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const chemin = req.url.slice(environment.apiUrl.length);
  for (const route of ROUTES) {
    const correspondance = route.chemin.exec(chemin);
    if (req.method === route.methode && correspondance) {
      const parametres = correspondance.slice(1).map(decodeURIComponent);
      return repondre(() => route.traiter(req, ...parametres));
    }
  }
  return repondre(() => {
    throw erreur(req, 404, `Route inconnue : ${req.method} ${chemin}`);
  });
};

// timer : simule le temps de réponse du réseau, y compris pour les erreurs.
// defer : le traitement n'est exécuté qu'à l'abonnement, et une exception devient une erreur HTTP
function repondre(traiter: () => Reponse): Observable<HttpEvent<unknown>> {
  return timer(LATENCE_MS).pipe(switchMap(() => defer(async () => traiter())));
}

async function inscrire(req: HttpRequest<Inscription>): Promise<HttpResponse<Utilisateur>> {
  const { motDePasse, ...utilisateur } = req.body!;
  const comptes = lire<UtilisateurEnregistre[]>(CLE_UTILISATEURS, []);
  if (trouver(comptes, utilisateur.login)) {
    throw erreur(req, 409, 'Ce login est déjà utilisé');
  }
  const motDePasseHash = await hacher(motDePasse);
  ecrire(CLE_UTILISATEURS, [...comptes, { ...utilisateur, motDePasseHash }]);
  return new HttpResponse({ status: 201, body: utilisateur, url: req.url });
}

async function connecter(
  req: HttpRequest<{ login: string; motDePasse: string }>,
): Promise<HttpResponse<Utilisateur>> {
  const { login, motDePasse } = req.body!;
  const compte = trouver(lire<UtilisateurEnregistre[]>(CLE_UTILISATEURS, []), login);
  if (!compte || compte.motDePasseHash !== (await hacher(motDePasse))) {
    throw erreur(req, 401, 'Login ou mot de passe incorrect');
  }
  const { motDePasseHash, ...utilisateur } = compte;
  return new HttpResponse({ status: 200, body: utilisateur, url: req.url });
}

function trouver(comptes: UtilisateurEnregistre[], login: string) {
  return comptes.find((u) => u.login.toLowerCase() === login.toLowerCase());
}

async function hacher(texte: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(octets), (o) => o.toString(16).padStart(2, '0')).join('');
}
