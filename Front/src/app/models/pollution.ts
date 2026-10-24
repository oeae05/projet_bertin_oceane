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
  photoUrl: string | null;
}

// Pollution enregistrée par l'API, rattachée à son auteur
export interface Declaration extends Pollution {
  id: string;
  auteur: string;
  dateCreation: string;
  dateModification?: string;
}
