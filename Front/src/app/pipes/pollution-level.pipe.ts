import { Pipe, PipeTransform } from '@angular/core';

export type NiveauPollution = 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse';

// Indice de dangerosité -> niveau (partagé avec HighlightPollutionDirective)
export function niveauPollution(indice: number | null | undefined): NiveauPollution | null {
  if (indice === null || indice === undefined || !Number.isFinite(indice) || indice < 0) {
    return null;
  }
  if (indice <= 20) {
    return 'Faible';
  }
  if (indice <= 50) {
    return 'Modérée';
  }
  if (indice <= 100) {
    return 'Élevée';
  }
  return 'Dangereuse';
}

// Usage : {{ pollution.indice | pollutionLevel }}
@Pipe({ name: 'pollutionLevel' })
export class PollutionLevelPipe implements PipeTransform {
  transform(indice: number | null | undefined): string {
    return niveauPollution(indice) ?? 'Inconnu';
  }
}
