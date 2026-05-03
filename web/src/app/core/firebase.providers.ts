import { EnvironmentProviders, makeEnvironmentProviders, InjectionToken } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');

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
  ]);
}
