import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Declaration } from '../models/pollution';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { AuthService } from '../services/auth.service';
import { PollutionService } from '../services/pollution.service';

@Component({
  selector: 'app-pollution-detail',
  imports: [PollutionRecap, RouterLink],
  templateUrl: './pollution-detail.html',
  styleUrl: './pollution-detail.css',
})
export class PollutionDetail implements OnInit {
  private readonly api = inject(PollutionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Paramètre :id de la route (withComponentInputBinding)
  readonly id = input.required<string>();

  protected readonly pollution = signal<Declaration | null>(null);
  protected readonly chargement = signal(true);
  protected readonly suppression = signal(false);
  protected readonly erreur = signal('');
  // Message transmis par la page d'édition après un enregistrement
  protected readonly succes: string =
    this.router.currentNavigation()?.extras.state?.['message'] ?? '';

  protected readonly estAuteur = computed(
    () => this.pollution()?.auteur === this.auth.utilisateur()?.login,
  );

  protected readonly message = computed(() => {
    const p = this.pollution();
    if (!p) {
      return '';
    }
    const auteur = this.estAuteur() ? 'toi' : p.auteur;
    let texte = `Déclarée par ${auteur} le ${new Date(p.dateCreation).toLocaleDateString('fr-FR')}`;
    if (p.dateModification) {
      texte += `, modifiée le ${new Date(p.dateModification).toLocaleDateString('fr-FR')}`;
    }
    return texte;
  });

  ngOnInit(): void {
    this.api
      .obtenir(this.id())
      .pipe(
        finalize(() => this.chargement.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (p) => this.pollution.set(p),
        error: (e: Error) => this.erreur.set(e.message),
      });
  }

  supprimer(): void {
    const p = this.pollution();
    if (!p || this.suppression() || !confirm(`Supprimer la pollution « ${p.titre} » ?`)) {
      return;
    }
    this.erreur.set('');
    this.suppression.set(true);
    this.api
      .supprimer(p.id)
      .pipe(
        finalize(() => this.suppression.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/pollutions'),
        error: (e: Error) => this.erreur.set(e.message),
      });
  }
}
