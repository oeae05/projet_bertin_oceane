import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Les composants n'ont pas à connaître HttpErrorResponse : on renvoie un message lisible.
 * `messages` précise le texte à afficher pour un code HTTP si le serveur n'en donne pas.
 */
export function versErreur(messages: Record<number, string> = {}) {
  return (err: HttpErrorResponse): Observable<never> => {
    const messageServeur: unknown = err.error?.message;
    let message: string;
    if (typeof messageServeur === 'string' && messageServeur) {
      message = messageServeur;
    } else if (err.status === 0) {
      message = 'Le serveur est injoignable, réessaie plus tard';
    } else if (messages[err.status]) {
      message = messages[err.status];
    } else {
      message = `Une erreur est survenue (code ${err.status})`;
    }
    return throwError(() => new Error(message));
  };
}
