import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'lore', renderMode: RenderMode.Prerender },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
