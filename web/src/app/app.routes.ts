import { Routes } from '@angular/router';
import { APP_ROUTES } from './core/constants/app-routes';

export const routes: Routes = [
  {
    path: APP_ROUTES.home,
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.page'),
    title: 'Moye',
  },
  {
    path: APP_ROUTES.music,
    loadComponent: () => import('./features/music/music.page'),
    title: 'Music — Moye',
  },
  {
    path: APP_ROUTES.tour,
    loadComponent: () => import('./features/tour/tour.page'),
    title: 'Tour — Moye',
  },
  {
    path: APP_ROUTES.about,
    loadComponent: () => import('./features/about/about.page'),
    title: 'About — Moye',
  },
  { path: '**', redirectTo: '' },
];
