import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription, Utilisateur } from '../models/utilisateur';

/**
 * Appels HTTP de l'API des comptes utilisateurs.
 * L'URL de base vient de environment.ts : elle change selon la configuration de build.
 */
@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/utilisateurs`;

  // POST /utilisateurs -> 201 + utilisateur créé, 409 si le login est pris
  inscrire(inscription: Inscription): Observable<Utilisateur> {
    const corps: Inscription = {
      login: inscription.login.trim(),
      nom: inscription.nom.trim(),
      prenom: inscription.prenom.trim(),
      email: inscription.email.trim(),
      motDePasse: inscription.motDePasse,
    };
    return this.http.post<Utilisateur>(this.url, corps).pipe(catchError(versErreur));
  }

  // POST /utilisateurs/connexion -> 200 + utilisateur, 401 si identifiants faux
  connecter(login: string, motDePasse: string): Observable<Utilisateur> {
    return this.http
      .post<Utilisateur>(`${this.url}/connexion`, { login: login.trim(), motDePasse })
      .pipe(catchError(versErreur));
  }
}

// Les composants n'ont pas à connaître HttpErrorResponse : on renvoie un message lisible
function versErreur(err: HttpErrorResponse): Observable<never> {
  const messageServeur: unknown = err.error?.message;
  let message: string;
  if (typeof messageServeur === 'string' && messageServeur) {
    message = messageServeur;
  } else if (err.status === 0) {
    message = 'Le serveur est injoignable, réessaie plus tard';
  } else if (err.status === 409) {
    message = 'Ce login est déjà utilisé';
  } else if (err.status === 401) {
    message = 'Login ou mot de passe incorrect';
  } else {
    message = `Une erreur est survenue (code ${err.status})`;
  }
  return throwError(() => new Error(message));
}
