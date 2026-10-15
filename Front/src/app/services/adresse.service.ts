import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

// API Adresse (Géoplateforme IGN) : gratuite, sans clé, France uniquement
const API = 'https://data.geopf.fr/geocodage';

export interface Adresse {
  label: string;
  contexte: string;
  latitude: number;
  longitude: number;
}

interface ReponseGeocodage {
  features: {
    geometry: { coordinates: [number, number] };
    properties: { label: string; context?: string };
  }[];
}

@Injectable({ providedIn: 'root' })
export class AdresseService {
  private readonly http = inject(HttpClient);

  rechercher(texte: string): Observable<Adresse[]> {
    const params = new HttpParams().set('q', texte).set('autocomplete', 1).set('limit', 5);
    return this.http.get<ReponseGeocodage>(`${API}/search`, { params }).pipe(
      map((r) => r.features.map(versAdresse)),
      catchError(() => of([])),
    );
  }

  inverser(latitude: number, longitude: number): Observable<Adresse | null> {
    const params = new HttpParams().set('lat', latitude).set('lon', longitude).set('limit', 1);
    return this.http.get<ReponseGeocodage>(`${API}/reverse`, { params }).pipe(
      map((r) => (r.features.length ? versAdresse(r.features[0]) : null)),
      catchError(() => of(null)),
    );
  }
}

function versAdresse(f: ReponseGeocodage['features'][number]): Adresse {
  const [longitude, latitude] = f.geometry.coordinates;
  return { label: f.properties.label, contexte: f.properties.context ?? '', latitude, longitude };
}
