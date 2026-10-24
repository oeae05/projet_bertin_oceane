import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Declaration, Pollution } from '../models/pollution';
import { versErreur } from './erreur-api';

const erreurs = versErreur({
  401: 'Il faut être connecté',
  403: "Seul l'auteur peut modifier ou supprimer cette pollution",
  404: "Cette pollution n'existe pas ou a été supprimée",
});

/**
 * Appels HTTP de l'API CRUD des pollutions.
 * L'auteur n'est jamais envoyé dans le corps : l'API le déduit de la personne connectée
 * (en-tête ajouté par interceptors/auth.interceptor.ts).
 */
@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pollutions`;

  // GET /pollutions -> 200 + toutes les pollutions
  lister(): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(this.url).pipe(catchError(erreurs));
  }

  // GET /pollutions/:id -> 200 + pollution, 404 si inconnue
  obtenir(id: string): Observable<Declaration> {
    return this.http.get<Declaration>(this.urlDe(id)).pipe(catchError(erreurs));
  }

  // POST /pollutions -> 201 + pollution créée (id, auteur et date ajoutés par l'API)
  creer(pollution: Pollution): Observable<Declaration> {
    return this.http.post<Declaration>(this.url, pollution).pipe(catchError(erreurs));
  }

  // PUT /pollutions/:id -> 200 + pollution modifiée, 403 si on n'en est pas l'auteur
  modifier(id: string, pollution: Pollution): Observable<Declaration> {
    return this.http.put<Declaration>(this.urlDe(id), pollution).pipe(catchError(erreurs));
  }

  // DELETE /pollutions/:id -> 204, 403 si on n'en est pas l'auteur
  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(this.urlDe(id)).pipe(catchError(erreurs));
  }

  private urlDe(id: string): string {
    return `${this.url}/${encodeURIComponent(id)}`;
  }
}
