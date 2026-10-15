import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Aperçu OpenStreetMap centré sur un point, sans dépendance externe
@Component({
  selector: 'app-carte',
  template: `<iframe [src]="url()" [title]="titre()" loading="lazy"></iframe>`,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      border-radius: 18px;
      background: var(--peche-clair);
    }

    iframe {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 220px;
      border: 0;
    }
  `,
})
export class Carte {
  private readonly sanitizer = inject(DomSanitizer);

  readonly latitude = input.required<number>();
  readonly longitude = input.required<number>();
  readonly titre = input('Carte de la position');

  protected readonly url = computed<SafeResourceUrl>(() => {
    const lat = this.latitude();
    const lon = this.longitude();
    const d = 0.005;
    const bbox = [lon - d, lat - d, lon + d, lat + d].join(',');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`,
    );
  });
}
