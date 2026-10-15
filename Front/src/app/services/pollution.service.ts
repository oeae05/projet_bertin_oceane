import { Injectable, computed, inject, signal } from '@angular/core';
import { Declaration, Pollution } from '../models/pollution';
import { AuthService } from './auth.service';
import { ecrire, lire } from './stockage';

const CLE_DECLARATIONS = 'declarations';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly auth = inject(AuthService);
  private readonly declarations = signal<Declaration[]>(lire(CLE_DECLARATIONS, []));

  // Seulement les déclarations de la personne connectée, les plus récentes d'abord
  readonly mesDeclarations = computed(() => {
    const login = this.auth.utilisateur()?.login;
    return this.declarations()
      .filter((d) => d.auteur === login)
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  });

  declarer(pollution: Pollution): Declaration {
    const auteur = this.auth.utilisateur();
    if (!auteur) {
      throw new Error('Il faut être connecté pour déclarer une pollution');
    }
    const declaration: Declaration = {
      ...pollution,
      id: crypto.randomUUID(),
      auteur: auteur.login,
      dateCreation: new Date().toISOString(),
    };
    this.declarations.update((liste) => [...liste, declaration]);
    ecrire(CLE_DECLARATIONS, this.declarations());
    return declaration;
  }

  supprimer(id: string): void {
    const login = this.auth.utilisateur()?.login;
    this.declarations.update((liste) => liste.filter((d) => !(d.id === id && d.auteur === login)));
    ecrire(CLE_DECLARATIONS, this.declarations());
  }
}
