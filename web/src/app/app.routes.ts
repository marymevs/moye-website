import { Routes } from '@angular/router';
import { APP_ROUTES } from './core/constants/app-routes';

export const routes: Routes = [
  {
    path: APP_ROUTES.home,
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.page'),
    title: 'moye.world',
  },
  {
    path: APP_ROUTES.lore,
    loadComponent: () => import('./features/lore/lore.page'),
    title: '.lore — moye.world',
  },
  {
    path: APP_ROUTES.cart,
    loadComponent: () => import('./features/cart/cart.page'),
    title: '.cart — moye.world',
  },
  { path: '**', redirectTo: '' },
];
