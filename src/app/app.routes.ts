import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pokedex',
    loadComponent: () =>
      import('./pages/pokedex/pokedex.page').then((m) => m.PokedexPage),
  },
  {
    path: 'compare',
    loadComponent: () =>
      import('./pages/compare/compare.page').then((m) => m.ComparePage),
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/stats/stats.page').then((m) => m.StatsPage),
  },
  {
    path: 'home',
    redirectTo: 'pokedex',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'pokedex',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'pokedex',
  },
];
