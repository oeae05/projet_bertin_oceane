import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Declaration, Pollution } from '../models/pollution';
import { PollutionForm } from '../pollution-form/pollution-form';
import { AuthService } from '../services/auth.service';
import { PollutionService } from '../services/pollution.service';

// Création (/pollutions/nouvelle) et modification (/pollutions/:id/modifier) d'une pollution
@Component({
  selector: 'app-pollution-edition',
  imports: [PollutionForm, RouterLink],
  templateUrl: './pollution-edition.html',
  styleUrl: './pollution-edition.css',
})
export class PollutionEdition implements OnInit {
  private readonly api = inject(PollutionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Paramètre :id de la route, absent en création
  readonly id = input<string>();

  protected readonly initiale = signal<Declaration | null>(null);
  protected readonly chargement = signal(false);
  protected readonly enCours = signal(false);
  protected readonly erreur = signal('');
  // Faux si la pollution est introuvable ou appartient à quelqu'un d'autre
  protected readonly editable = signal(true);

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    this.chargement.set(true);
    this.api
      .obtenir(id)
      .pipe(
        finalize(() => this.chargement.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (p) => {
          if (p.auteur !== this.auth.utilisateur()?.login) {
            this.editable.set(false);
            this.erreur.set("Seul l'auteur peut modifier cette pollution");
            return;
          }
          this.initiale.set(p);
        },
        error: (e: Error) => {
          this.editable.set(false);
          this.erreur.set(e.message);
        },
      });
  }

  enregistrer(pollution: Pollution): void {
    const id = this.id();
    this.erreur.set('');
    this.enCours.set(true);
    const requete = id ? this.api.modifier(id, pollution) : this.api.creer(pollution);
    requete
      .pipe(
        finalize(() => this.enCours.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (p) =>
          this.router.navigate(['/pollutions', p.id], {
            state: {
              message: id
                ? 'Modifications enregistrées.'
                : 'Déclaration enregistrée, merci pour ton signalement !',
            },
          }),
        error: (e: Error) => {
          this.erreur.set(e.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
  }
}
