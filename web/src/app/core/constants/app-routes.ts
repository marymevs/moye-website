export const APP_ROUTES = {
  home: '',
  music: 'music',
  tour: 'tour',
  about: 'about',
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;

export const NAV_ITEMS: ReadonlyArray<{ key: AppRouteKey; label: string; path: string }> = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'music', label: 'Music', path: `/${APP_ROUTES.music}` },
  { key: 'tour', label: 'Tour', path: `/${APP_ROUTES.tour}` },
  { key: 'about', label: 'About', path: `/${APP_ROUTES.about}` },
];
