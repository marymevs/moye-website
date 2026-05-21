import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import {
  FIREBASE_ANALYTICS,
  FIREBASE_APP,
  FIREBASE_FUNCTIONS,
  FIREBASE_STORAGE,
  FIRESTORE,
} from './core/firebase.providers';

describe('App', () => {
  beforeEach(async () => {
    // App eagerly injects TracksService, AudioPlayerService, MailingListService,
    // and the analytics token at construction. None of them are exercised in
    // this smoke test, but Angular's DI still resolves the dependency graph
    // when the component is instantiated. Provide stub values for every
    // Firebase token so the test doesn't try to make real network calls.
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: FIREBASE_APP, useValue: {} },
        { provide: FIRESTORE, useValue: {} },
        { provide: FIREBASE_STORAGE, useValue: {} },
        { provide: FIREBASE_FUNCTIONS, useValue: {} },
        { provide: FIREBASE_ANALYTICS, useValue: null },
      ],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
