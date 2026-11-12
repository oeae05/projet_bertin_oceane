import { Directive, computed, input } from '@angular/core';
import { NiveauPollution, niveauPollution } from '../pipes/pollution-level.pipe';

const COULEURS: Record<NiveauPollution, string> = {
  Faible: '#c8f2c2', // vert clair
  Modérée: '#fff176', // jaune
  Élevée: '#ffb74d', // orange
  Dangereuse: '#ef5350', // rouge
};

// Usage : <span [appHighlightPollution]="pollution.indice">…</span>
@Directive({
  selector: '[appHighlightPollution]',
  host: { '[style.background-color]': 'couleur()' },
})
export class HighlightPollutionDirective {
  readonly appHighlightPollution = input<number | null | undefined>();

  protected readonly couleur = computed(() => {
    const niveau = niveauPollution(this.appHighlightPollution());
    return niveau ? COULEURS[niveau] : null;
  });
}
