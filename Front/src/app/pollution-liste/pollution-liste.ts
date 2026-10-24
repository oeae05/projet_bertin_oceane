import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { Declaration, ETypePollution } from '../models/pollution';
import { AuthService } from '../services/auth.service';
import { PollutionService } from '../services/pollution.service';

// Comparaison sans accents ni majuscules : « depot » trouve « Dépôt sauvage »
const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

@Component({
  selector: 'app-pollution-liste',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './pollution-liste.html',
  styleUrl: './pollution-liste.css',
})
export class PollutionListe implements OnInit {
  private readonly api = inject(PollutionService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly types = Object.values(ETypePollution);
  protected readonly login = computed(() => this.auth.utilisateur()?.login);

  protected readonly pollutions = signal<Declaration[]>([]);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal('');
  // Pollution en cours de suppression (bouton désactivé pendant l'appel)
  protected readonly suppression = signal<string | null>(null);

  protected readonly filtres = this.fb.nonNullable.group({
    recherche: '',
    type: '',
    depuis: '',
    jusqua: '',
    miennes: false,
  });

  private readonly criteres = toSignal(
    this.filtres.valueChanges.pipe(map(() => this.filtres.getRawValue())),
    { initialValue: this.filtres.getRawValue() },
  );

  protected readonly filtreActif = computed(() => {
    const c = this.criteres();
    return !!(c.recherche.trim() || c.type || c.depuis || c.jusqua || c.miennes);
  });

  // Pollutions qui respectent tous les critères, les plus récemment observées d'abord
  protected readonly resultats = computed(() => {
    const { recherche, type, depuis, jusqua, miennes } = this.criteres();
    const mots = normaliser(recherche).split(/\s+/).filter(Boolean);
    const login = this.login();
    return this.pollutions()
      .filter((p) => !type || p.type === type)
      .filter((p) => !depuis || p.dateObservation >= depuis)
      .filter((p) => !jusqua || p.dateObservation <= jusqua)
      .filter((p) => !miennes || p.auteur === login)
      .filter((p) => {
        const texte = normaliser(`${p.titre} ${p.description} ${p.lieu}`);
        return mots.every((mot) => texte.includes(mot));
      })
      .sort(
        (a, b) =>
          b.dateObservation.localeCompare(a.dateObservation) ||
          b.dateCreation.localeCompare(a.dateCreation),
      );
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set('');
    this.api
      .lister()
      .pipe(
        finalize(() => this.chargement.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (liste) => this.pollutions.set(liste),
        error: (e: Error) => this.erreur.set(e.message),
      });
  }

  supprimer(pollution: Declaration): void {
    if (this.suppression() || !confirm(`Supprimer la pollution « ${pollution.titre} » ?`)) {
      return;
    }
    this.erreur.set('');
    this.suppression.set(pollution.id);
    this.api
      .supprimer(pollution.id)
      .pipe(
        finalize(() => this.suppression.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.pollutions.update((liste) => liste.filter((p) => p.id !== pollution.id)),
        error: (e: Error) => this.erreur.set(e.message),
      });
  }

  reinitialiser(): void {
    this.filtres.reset();
  }
}
