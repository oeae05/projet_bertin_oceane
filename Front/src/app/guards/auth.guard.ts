import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Pages réservées aux personnes connectées : sinon, retour à la connexion
export const connecteGuard: CanActivateFn = () => {
  if (inject(AuthService).connecte()) {
    return true;
  }
  return inject(Router).parseUrl('/connexion');
};

// Connexion / inscription inutiles une fois connecté : on va à la liste
export const deconnecteGuard: CanActivateFn = () => {
  if (!inject(AuthService).connecte()) {
    return true;
  }
  return inject(Router).parseUrl('/pollutions');
};
