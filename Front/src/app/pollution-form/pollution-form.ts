import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Carte } from '../carte/carte';
import { ETypePollution, Pollution } from '../models/pollution';
import { Adresse, AdresseService } from '../services/adresse.service';

// Date au format AAAA-MM-JJ, existante et pas dans le futur
const dateValide: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valeur: string = control.value;
  if (!valeur) {
    return null;
  }
  const date = new Date(valeur);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur) || isNaN(date.getTime())) {
    return { dateInvalide: true };
  }
  if (date.getTime() > Date.now()) {
    return { dateFuture: true };
  }
  return null;
};

// Un champ de type number renvoie null si la saisie n'est pas un nombre
const nombreValide: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valeur = control.value;
  if (valeur === null || valeur === '') {
    return null;
  }
  return Number.isFinite(Number(valeur)) ? null : { nombre: true };
};

const arrondir = (n: number) => Math.round(n * 1e6) / 1e6;

@Component({
  selector: 'app-pollution-form',
  imports: [ReactiveFormsModule, Carte],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.css',
})
export class PollutionForm {
  private readonly fb = inject(FormBuilder);
  private readonly adresses = inject(AdresseService);
  private readonly destroyRef = inject(DestroyRef);

  readonly declarer = output<Pollution>();

  protected readonly types = Object.values(ETypePollution);
  protected readonly aujourdhui = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.group({
    titre: ['', Validators.required],
    type: ['' as ETypePollution | '', Validators.required],
    description: ['', Validators.required],
    dateObservation: ['', [Validators.required, dateValide]],
    lieu: ['', Validators.required],
    latitude: [
      null as number | null,
      [Validators.required, nombreValide, Validators.min(-90), Validators.max(90)],
    ],
    longitude: [
      null as number | null,
      [Validators.required, nombreValide, Validators.min(-180), Validators.max(180)],
    ],
    photoUrl: ['', Validators.pattern(/^https?:\/\/\S+$/)],
  });

  protected readonly suggestions = signal<Adresse[]>([]);
  protected readonly suggestionActive = signal(-1);
  protected readonly rechercheEnCours = signal(false);
  protected readonly infoPosition = signal('');
  protected readonly localisationEnCours = signal(false);

  // Coordonnées valides affichées sur la carte
  protected readonly position = signal<{ lat: number; lon: number } | null>(null);

  constructor() {
    // Saisie de l'adresse -> suggestions
    this.form.controls.lieu.valueChanges
      .pipe(
        map((v) => (v ?? '').trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => this.suggestionActive.set(-1)),
        switchMap((texte) => {
          if (texte.length < 3) {
            return of([]);
          }
          this.rechercheEnCours.set(true);
          return this.adresses.rechercher(texte);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((liste) => {
        this.rechercheEnCours.set(false);
        this.suggestions.set(liste);
      });

    // Saisie des coordonnées -> adresse correspondante
    merge(this.form.controls.latitude.valueChanges, this.form.controls.longitude.valueChanges)
      .pipe(
        debounceTime(600),
        map(() => this.coordonnees()),
        tap((c) => this.position.set(c)),
        filter((c) => c !== null),
        distinctUntilChanged((a, b) => a.lat === b.lat && a.lon === b.lon),
        tap(() => this.infoPosition.set('Recherche de l\'adresse…')),
        switchMap((c) => this.adresses.inverser(c.lat, c.lon)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((adresse) => {
        if (adresse) {
          this.form.controls.lieu.setValue(adresse.label, { emitEvent: false });
          this.form.controls.lieu.markAsTouched();
          this.infoPosition.set('Adresse mise à jour à partir des coordonnées');
        } else {
          this.infoPosition.set('Aucune adresse connue à ces coordonnées');
        }
      });
  }

  invalide(nom: string): boolean {
    const ctrl = this.form.get(nom);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  erreur(nom: string, code: string): boolean {
    return !!this.form.get(nom)?.hasError(code);
  }

  choisirAdresse(adresse: Adresse): void {
    // emitEvent: false pour ne pas relancer la recherche dans l'autre sens
    this.form.patchValue(
      {
        lieu: adresse.label,
        latitude: arrondir(adresse.latitude),
        longitude: arrondir(adresse.longitude),
      },
      { emitEvent: false },
    );
    this.form.controls.latitude.markAsTouched();
    this.form.controls.longitude.markAsTouched();
    this.position.set(this.coordonnees());
    this.fermerSuggestions();
    this.infoPosition.set('Coordonnées mises à jour à partir de l\'adresse');
  }

  naviguerSuggestions(event: KeyboardEvent): void {
    const nb = this.suggestions().length;
    if (!nb) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.suggestionActive.update((i) => (i + 1) % nb);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.suggestionActive.update((i) => (i <= 0 ? nb - 1 : i - 1));
    } else if (event.key === 'Enter' && this.suggestionActive() >= 0) {
      event.preventDefault();
      this.choisirAdresse(this.suggestions()[this.suggestionActive()]);
    } else if (event.key === 'Escape') {
      this.fermerSuggestions();
    }
  }

  fermerSuggestions(): void {
    this.suggestions.set([]);
    this.suggestionActive.set(-1);
  }

  meLocaliser(): void {
    if (!('geolocation' in navigator)) {
      this.infoPosition.set('La géolocalisation n\'est pas disponible sur ce navigateur');
      return;
    }
    this.localisationEnCours.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.localisationEnCours.set(false);
        // ici on laisse valueChanges déclencher la recherche de l'adresse
        this.form.patchValue({
          latitude: arrondir(pos.coords.latitude),
          longitude: arrondir(pos.coords.longitude),
        });
        this.form.controls.latitude.markAsTouched();
        this.form.controls.longitude.markAsTouched();
      },
      () => {
        this.localisationEnCours.set(false);
        this.infoPosition.set('Impossible de récupérer ta position');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.declarer.emit({
      titre: v.titre!.trim(),
      type: v.type as ETypePollution,
      description: v.description!.trim(),
      dateObservation: v.dateObservation!,
      lieu: v.lieu!.trim(),
      latitude: Number(v.latitude),
      longitude: Number(v.longitude),
      photoUrl: v.photoUrl?.trim() || null,
    });
  }

  private coordonnees(): { lat: number; lon: number } | null {
    const { latitude, longitude } = this.form.controls;
    if (latitude.invalid || longitude.invalid) {
      return null;
    }
    return { lat: Number(latitude.value), lon: Number(longitude.value) };
  }
}
