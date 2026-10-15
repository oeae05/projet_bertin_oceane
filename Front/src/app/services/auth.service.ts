import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Inscription, Utilisateur } from '../models/utilisateur';
import { ecrire, lire } from './stockage';
import { UtilisateurService } from './utilisateur.service';

const CLE_SESSION = 'session';

/**
 * Session de la personne connectée.
 * Les comptes sont gérés par l'API, via UtilisateurService.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(UtilisateurService);

  readonly utilisateur = signal<Utilisateur | null>(lire(CLE_SESSION, null));
  readonly connecte = computed(() => this.utilisateur() !== null);

  // Une inscription réussie connecte directement
  inscrire(inscription: Inscription): Observable<Utilisateur> {
    return this.api.inscrire(inscription).pipe(tap((u) => this.ouvrirSession(u)));
  }

  connecter(login: string, motDePasse: string): Observable<Utilisateur> {
    return this.api.connecter(login, motDePasse).pipe(tap((u) => this.ouvrirSession(u)));
  }

  deconnecter(): void {
    this.utilisateur.set(null);
    ecrire(CLE_SESSION, null);
  }

  private ouvrirSession(utilisateur: Utilisateur): void {
    this.utilisateur.set(utilisateur);
    ecrire(CLE_SESSION, utilisateur);
  }
}
