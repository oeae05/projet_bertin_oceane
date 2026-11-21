import { Routes } from '@angular/router';
import { connecteGuard, deconnecteGuard } from './guards/auth.guard';

// Lazy loading : chaque page est téléchargée seulement quand on y va (loadComponent)
export const routes: Routes = [
  {
    path: 'connexion',
    loadComponent: () => import('./connexion/connexion').then((m) => m.Connexion),
    canActivate: [deconnecteGuard],
    title: 'Connexion',
  },
  {
    path: 'inscription',
    loadComponent: () => import('./sign-up/sign-up').then((m) => m.SignUp),
    canActivate: [deconnecteGuard],
    title: 'Inscription',
  },
  {
    path: '',
    loadComponent: () => import('./espace/espace').then((m) => m.Espace),
    canActivate: [connecteGuard],
    children: [
      {
        path: 'pollutions',
        loadComponent: () =>
          import('./pollution-liste/pollution-liste').then((m) => m.PollutionListe),
        title: 'Pollutions signalées',
      },
      // avant 'pollutions/:id', sinon « nouvelle » serait pris pour un id
      {
        path: 'pollutions/nouvelle',
        loadComponent: () =>
          import('./pollution-edition/pollution-edition').then((m) => m.PollutionEdition),
        title: 'Déclarer une pollution',
      },
      {
        path: 'pollutions/:id',
        loadComponent: () =>
          import('./pollution-detail/pollution-detail').then((m) => m.PollutionDetail),
        title: "Détail d'une pollution",
      },
      {
        path: 'pollutions/:id/modifier',
        loadComponent: () =>
          import('./pollution-edition/pollution-edition').then((m) => m.PollutionEdition),
        title: 'Modifier une pollution',
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./utilisateur-liste/utilisateur-liste').then((m) => m.UtilisateurListe),
        title: 'Utilisateurs',
      },
      { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
    ],
  },
  { path: '**', redirectTo: 'pollutions' },
];
