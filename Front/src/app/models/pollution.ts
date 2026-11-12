export enum ETypePollution {
  PLASTIQUE = 'Plastique',
  CHIMIQUE = 'Chimique',
  DEPOT_SAUVAGE = 'Dépôt sauvage',
  EAU = 'Eau',
  AIR = 'Air',
  AUTRE = 'Autre',
}

export interface Pollution {
  titre: string;
  type: ETypePollution;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  // Indice de dangerosité (0 et plus), voir PollutionLevelPipe
  indice: number;
  photoUrl: string | null;
}

// Pollution enregistrée par l'API, rattachée à son auteur
export interface Declaration extends Pollution {
  id: string;
  auteur: string;
  dateCreation: string;
  dateModification?: string;
}
