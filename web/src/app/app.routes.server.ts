import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'lore', renderMode: RenderMode.Prerender },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'cart/success', renderMode: RenderMode.Client },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
