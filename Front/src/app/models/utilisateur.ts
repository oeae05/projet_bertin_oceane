export interface Utilisateur {
  login: string;
  nom: string;
  prenom: string;
  email: string;
}

// Corps envoyé à l'API pour créer un compte
export interface Inscription extends Utilisateur {
  motDePasse: string;
}
