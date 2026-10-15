import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { from, switchMap, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription, Utilisateur } from '../models/utilisateur';
import { ecrire, lire } from '../services/stockage';

/**
 * Backend simulé, activé par environment.fausseApi tant que la vraie API n'existe pas.
 * Il répond aux mêmes routes que l'API et stocke les comptes dans le localStorage.
 */
const CLE_UTILISATEURS = 'utilisateurs';
const LATENCE_MS = 400;

// Le mot de passe n'est jamais gardé en clair
interface UtilisateurEnregistre extends Utilisateur {
  motDePasseHash: string;
}

export const fausseApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const route = `${req.method} ${req.url.slice(environment.apiUrl.length)}`;
  // timer : simule le temps de réponse du réseau, y compris pour les erreurs
  switch (route) {
    case 'POST /utilisateurs':
      return timer(LATENCE_MS).pipe(switchMap(() => from(inscrire(req as HttpRequest<Inscription>))));
    case 'POST /utilisateurs/connexion':
      return timer(LATENCE_MS).pipe(
        switchMap(() => from(connecter(req as HttpRequest<{ login: string; motDePasse: string }>))),
      );
    default:
      return next(req);
  }
};

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

function erreur(req: HttpRequest<unknown>, status: number, message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { message }, url: req.url });
}

async function hacher(texte: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(octets), (o) => o.toString(16).padStart(2, '0')).join('');
}
