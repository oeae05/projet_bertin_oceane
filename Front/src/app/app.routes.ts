import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Connexion } from './connexion/connexion';
import { Declarations } from './declarations/declarations';
import { AuthService } from './services/auth.service';
import { SignUp } from './sign-up/sign-up';

// Pages réservées aux personnes connectées
const connecte: CanActivateFn = () =>
  inject(AuthService).connecte() || inject(Router).parseUrl('/connexion');

// Pages de connexion/inscription inutiles une fois connecté
const deconnecte: CanActivateFn = () =>
  !inject(AuthService).connecte() || inject(Router).parseUrl('/declarations');

export const routes: Routes = [
  { path: 'connexion', component: Connexion, canActivate: [deconnecte], title: 'Connexion' },
  { path: 'inscription', component: SignUp, canActivate: [deconnecte], title: 'Inscription' },
  {
    path: 'declarations',
    component: Declarations,
    canActivate: [connecte],
    title: 'Mes déclarations de pollution',
  },
  { path: '**', redirectTo: 'declarations' },
];
