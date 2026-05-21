import { EnvironmentProviders, makeEnvironmentProviders, InjectionToken } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { Analytics, initializeAnalytics } from 'firebase/analytics';
import { environment } from '../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');
export const FIREBASE_FUNCTIONS = new InjectionToken<Functions>('FIREBASE_FUNCTIONS');
export const FIREBASE_ANALYTICS = new InjectionToken<Analytics | null>('FIREBASE_ANALYTICS');

export function provideFirebase(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_APP,
      useFactory: () => initializeApp(environment.firebase),
    },
    {
      provide: FIRESTORE,
      useFactory: (app: FirebaseApp) => getFirestore(app),
      deps: [FIREBASE_APP],
    },
    {
      provide: FIREBASE_STORAGE,
      useFactory: (app: FirebaseApp) => getStorage(app),
      deps: [FIREBASE_APP],
    },
    {
      // Region must match where Cloud Functions are deployed (us-central1 per functions/src/index.ts).
      provide: FIREBASE_FUNCTIONS,
      useFactory: (app: FirebaseApp) => getFunctions(app, 'us-central1'),
      deps: [FIREBASE_APP],
    },
    {
      // Analytics is browser-only (needs window). Returns null on SSR/Node
      // so consumers can guard with a single nullish check.
      //
      // Uses initializeAnalytics(app, { config: { send_page_view: false } })
      // instead of getAnalytics(app) so we can manually log page_view events
      // on every Angular NavigationEnd — keeps full control over SPA
      // navigation tracking and avoids double-counting if Firebase ever
      // changes the automatic-pageview default for SPAs.
      provide: FIREBASE_ANALYTICS,
      useFactory: (app: FirebaseApp): Analytics | null => {
        if (typeof window === 'undefined') return null;
        try {
          return initializeAnalytics(app, { config: { send_page_view: false } });
        } catch (err) {
          console.warn('[Analytics] init failed:', err);
          return null;
        }
      },
      deps: [FIREBASE_APP],
    },
  ]);
}
