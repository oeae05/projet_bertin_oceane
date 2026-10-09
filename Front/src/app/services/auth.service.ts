import { Injectable, computed, signal } from '@angular/core';
import { Utilisateur, UtilisateurEnregistre } from '../models/utilisateur';
import { ecrire, lire } from './stockage';

const CLE_UTILISATEURS = 'utilisateurs';
const CLE_SESSION = 'session';

export interface Inscription extends Utilisateur {
  motDePasse: string;
}

/**
 * Gestion des comptes, en local en attendant le backend :
 * seules les méthodes de ce service devront appeler l'API.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly utilisateurs = signal<UtilisateurEnregistre[]>(lire(CLE_UTILISATEURS, []));

  readonly utilisateur = signal<Utilisateur | null>(lire(CLE_SESSION, null));
  readonly connecte = computed(() => this.utilisateur() !== null);

  async inscrire(inscription: Inscription): Promise<void> {
    const login = inscription.login.trim();
    if (this.trouver(login)) {
      throw new Error('Ce login est déjà utilisé');
    }
    const utilisateur: Utilisateur = {
      login,
      nom: inscription.nom.trim(),
      prenom: inscription.prenom.trim(),
      email: inscription.email.trim(),
    };
    const motDePasseHash = await hacher(inscription.motDePasse);
    this.utilisateurs.update((liste) => [...liste, { ...utilisateur, motDePasseHash }]);
    ecrire(CLE_UTILISATEURS, this.utilisateurs());
    this.ouvrirSession(utilisateur);
  }

  async connecter(login: string, motDePasse: string): Promise<void> {
    const compte = this.trouver(login.trim());
    if (!compte || compte.motDePasseHash !== (await hacher(motDePasse))) {
      throw new Error('Login ou mot de passe incorrect');
    }
    const { motDePasseHash, ...utilisateur } = compte;
    this.ouvrirSession(utilisateur);
  }

  deconnecter(): void {
    this.utilisateur.set(null);
    ecrire(CLE_SESSION, null);
  }

  private trouver(login: string): UtilisateurEnregistre | undefined {
    return this.utilisateurs().find((u) => u.login.toLowerCase() === login.toLowerCase());
  }

  private ouvrirSession(utilisateur: Utilisateur): void {
    this.utilisateur.set(utilisateur);
    ecrire(CLE_SESSION, utilisateur);
  }
}

async function hacher(texte: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(octets), (o) => o.toString(16).padStart(2, '0')).join('');
}
