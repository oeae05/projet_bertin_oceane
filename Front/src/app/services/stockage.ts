// Accès au localStorage protégé : il peut être indisponible (navigation privée, quota...)
export function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

export function ecrire(cle: string, valeur: unknown): void {
  try {
    if (valeur === null) {
      localStorage.removeItem(cle);
    } else {
      localStorage.setItem(cle, JSON.stringify(valeur));
    }
  } catch {
    // stockage indisponible : les données restent en mémoire pour la session
  }
}
