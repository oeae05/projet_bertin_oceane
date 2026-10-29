import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription, Utilisateur } from '../models/utilisateur';
import { versErreur } from './erreur-api';

const erreurs = versErreur({
  409: 'Ce login est déjà utilisé',
  401: 'Login ou mot de passe incorrect',
});

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
    return this.http.post<Utilisateur>(this.url, corps).pipe(catchError(erreurs));
  }

  // POST /utilisateurs/connexion -> 200 + utilisateur, 401 si identifiants faux
  connecter(login: string, motDePasse: string): Observable<Utilisateur> {
    return this.http
      .post<Utilisateur>(`${this.url}/connexion`, { login: login.trim(), motDePasse })
      .pipe(catchError(erreurs));
  }
}
