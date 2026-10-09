export interface Utilisateur {
  login: string;
  nom: string;
  prenom: string;
  email: string;
}

// Version stockée : le mot de passe n'est jamais gardé en clair
export interface UtilisateurEnregistre extends Utilisateur {
  motDePasseHash: string;
}
