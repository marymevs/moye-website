export const APP_ROUTES = {
  home: '',
  lore: 'lore',
  cart: 'cart',
  privacy: 'privacy',
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;

export const NAV_ITEMS: ReadonlyArray<{ key: AppRouteKey; label: string; path: string }> = [
  { key: 'home', label: '.world', path: '/' },
  { key: 'lore', label: '.lore', path: `/${APP_ROUTES.lore}` },
  { key: 'cart', label: '.cart', path: `/${APP_ROUTES.cart}` },
];
