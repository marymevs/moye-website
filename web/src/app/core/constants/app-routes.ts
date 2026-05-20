export const APP_ROUTES = {
  home: '',
  lore: 'lore',
  cart: 'cart',
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;

export const NAV_ITEMS: ReadonlyArray<{ key: AppRouteKey; label: string; path: string }> = [
  { key: 'lore', label: '.lore', path: `/${APP_ROUTES.lore}` },
];
