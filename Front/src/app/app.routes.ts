import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Connexion } from './connexion/connexion';
import { Espace } from './espace/espace';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { PollutionEdition } from './pollution-edition/pollution-edition';
import { PollutionListe } from './pollution-liste/pollution-liste';
import { AuthService } from './services/auth.service';
import { SignUp } from './sign-up/sign-up';

// Pages réservées aux personnes connectées
const connecte: CanActivateFn = () =>
  inject(AuthService).connecte() || inject(Router).parseUrl('/connexion');

// Pages de connexion/inscription inutiles une fois connecté
const deconnecte: CanActivateFn = () =>
  !inject(AuthService).connecte() || inject(Router).parseUrl('/pollutions');

export const routes: Routes = [
  { path: 'connexion', component: Connexion, canActivate: [deconnecte], title: 'Connexion' },
  { path: 'inscription', component: SignUp, canActivate: [deconnecte], title: 'Inscription' },
  {
    path: '',
    component: Espace,
    canActivate: [connecte],
    children: [
      { path: 'pollutions', component: PollutionListe, title: 'Pollutions signalées' },
      // avant 'pollutions/:id', sinon « nouvelle » serait pris pour un id
      { path: 'pollutions/nouvelle', component: PollutionEdition, title: 'Déclarer une pollution' },
      { path: 'pollutions/:id', component: PollutionDetail, title: "Détail d'une pollution" },
      {
        path: 'pollutions/:id/modifier',
        component: PollutionEdition,
        title: 'Modifier une pollution',
      },
      { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
    ],
  },
  { path: '**', redirectTo: 'pollutions' },
];
