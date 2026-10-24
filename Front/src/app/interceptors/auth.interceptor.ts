import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const EN_TETE_UTILISATEUR = 'X-Utilisateur';

/**
 * Ajoute l'identité de la personne connectée à chaque requête vers l'API.
 * L'API s'en sert pour savoir qui crée, modifie ou supprime une pollution.
 * (Avec une vraie authentification, ce serait un en-tête Authorization: Bearer <jeton>.)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const login = inject(AuthService).utilisateur()?.login;
  if (!login || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { [EN_TETE_UTILISATEUR]: login } }));
};
