import { Component, OnInit, inject, signal } from '@angular/core';
import { Utilisateur } from '../models/utilisateur';
import { UtilisateurService } from '../services/utilisateur.service';

// Liste des utilisateurs inscrits (GET /users)
@Component({
  selector: 'app-utilisateur-liste',
  templateUrl: './utilisateur-liste.html',
})
export class UtilisateurListe implements OnInit {
  private readonly api = inject(UtilisateurService);

  protected readonly utilisateurs = signal<Utilisateur[]>([]);
  protected readonly erreur = signal('');

  ngOnInit(): void {
    this.api.lister().subscribe({
      next: (liste) => this.utilisateurs.set(liste),
      error: (e: Error) => this.erreur.set(e.message),
    });
  }
}
