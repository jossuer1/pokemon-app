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
    path: 'home',
    redirectTo: 'pokedex',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'pokedex',
    pathMatch: 'full',
  },
];
