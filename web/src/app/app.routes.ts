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
  {
    path: 'cart/success',
    loadComponent: () => import('./features/cart/checkout-success.page'),
    title: 'order complete — moye.world',
  },
  {
    path: APP_ROUTES.privacy,
    loadComponent: () => import('./features/legal/privacy.page'),
    title: '.privacy — moye.world',
  },
  {
    path: APP_ROUTES.terms,
    loadComponent: () => import('./features/legal/terms.page'),
    title: '.terms — moye.world',
  },
  { path: '**', redirectTo: '' },
];
