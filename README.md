# Moye

Custom website for the musician Moye.

## Stack

- **Web:** Angular 21 (standalone components, signals, OnPush), TypeScript 5.9, SCSS, Vitest
- **Backend:** Firebase Hosting + Firestore + Cloud Functions v2 (ESM, Node 22) + Storage
- **Validation:** Zod at the function boundary
- Pure `firebase` SDK — not `@angular/fire`

## Repo layout

```
.
├── web/                    Angular workspace
│   └── src/app/
│       ├── core/           cross-cutting: providers, route constants
│       ├── shared/         reusable UI (nav, footer)
│       └── features/       route-owned pages (home, music, tour, about)
├── functions/              Cloud Functions v2, ESM, Node 22
├── firebase.json           hosting + emulators + rules wiring
├── firestore.rules         deny-all by default
├── storage.rules           public read on /public/**, deny writes
└── .firebaserc             Firebase project alias
```

## Prerequisites

- **Node 22 (LTS).** Angular 21 does not officially support Node 25. Use `nvm install 22 && nvm use 22`.
- **npm** (ships with Node)
- **Firebase CLI:** `npm i -g firebase-tools` then `firebase login`
- **Angular CLI** (optional, for generators): `npm i -g @angular/cli`

## First-time setup

```bash
# Install web dependencies
cd web && npm install

# Install function dependencies
cd ../functions && npm install
```

The Firebase web config lives in [web/src/environments/environment.ts](web/src/environments/environment.ts). It is committed and points at the production Firebase project. Web SDK config is not a secret — security is enforced server-side by Firestore/Storage rules.

If you switch Firebase projects, update both [web/src/environments/environment.ts](web/src/environments/environment.ts) (web SDK config) and [.firebaserc](.firebaserc) (CLI alias) so the two stay in sync — `firebase deploy` uses `.firebaserc` and the Angular runtime uses `environment.ts`.

## Daily scripts

From `web/`:

| Command | What it does |
|---|---|
| `npm start` | Dev server at http://localhost:4200, HMR on |
| `npm run build` | Production build → `web/dist/web/browser/` (prerendered) |
| `npm test` | Vitest unit tests |
| `npm run watch` | Rebuild on change (development config) |

From `functions/`:

| Command | What it does |
|---|---|
| `npm run build` | Compile TS → `functions/lib/` |
| `npm run build:watch` | Recompile on change |
| `npm run serve` | Build + start the Functions emulator only |
| `npm run logs` | Tail deployed function logs |

From the repo root:

```bash
firebase emulators:start
```

Boots hosting (5000), functions (5001), firestore (8080), storage (9199), and the emulator UI (4000). Use this for end-to-end testing without touching production.

## Routing — how to add a page

1. Create a standalone component at `web/src/app/features/<name>/<name>.page.ts` with `export default class …Page`.
2. Add the path to [web/src/app/core/constants/app-routes.ts](web/src/app/core/constants/app-routes.ts) (typed `APP_ROUTES`) and to `NAV_ITEMS` if it should appear in the nav.
3. Add a route in [web/src/app/app.routes.ts](web/src/app/app.routes.ts) using `loadComponent: () => import(...)`.
4. If the page should be prerendered (it usually should), add an entry to [web/src/app/app.routes.server.ts](web/src/app/app.routes.server.ts) with `RenderMode.Prerender`. Routes with dynamic segments (`/album/:id`) need either `getPrerenderParams` or `RenderMode.Server`.

## Firebase services

Firebase is wired in once via `provideFirebase()` in [web/src/app/core/firebase.providers.ts](web/src/app/core/firebase.providers.ts). To use a service in a component:

```ts
import { inject } from '@angular/core';
import { FIRESTORE } from '../../core/firebase.providers';
import { collection, getDocs } from 'firebase/firestore';

const db = inject(FIRESTORE);
const snap = await getDocs(collection(db, 'shows'));
```

The same pattern applies to `FIRESTORE` and `FIREBASE_STORAGE`. To add a new service (e.g. Auth), add a provider in `firebase.providers.ts` — that's the single source of truth.

## Cloud Functions

Functions live in [functions/src/index.ts](functions/src/index.ts). The current file is a placeholder with a commented `submitContact` example showing the expected pattern: parse the request body with Zod, return 400 on parse failure, do the work, return JSON.

When adding a function:

1. Validate inputs with Zod at the boundary.
2. Use Functions v2 imports (`firebase-functions/v2/https`, `firebase-functions/v2/firestore`, etc.).
3. Pin the region (`{ region: 'us-central1' }`) so deploys are predictable.
4. Run `npm run build` in `functions/` before testing in the emulator.

## Security rules

- **Firestore** ([firestore.rules](firestore.rules)) is deny-all. When you add a collection, add a `match /collectionName/{id}` rule and grant the minimum access needed.
- **Storage** ([storage.rules](storage.rules)) allows public read on `/public/**` only. Anything outside `/public/` is locked.

Both are intentionally restrictive — loosen per-collection as features land, do not relax the catch-all.

## Deploy

```bash
# Build everything
cd web && npm run build
cd ../functions && npm run build

# Deploy everything (hosting + functions + rules)
firebase deploy

# Or scope it
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules,storage:rules
```

The hosting build is fully prerendered to static HTML, so `firebase deploy --only hosting` is fast and doesn't spin up an SSR Cloud Function. If a future feature needs server-side rendering for a dynamic route, wire the SSR function then.

## Conventions cheat sheet

- **Standalone components only.** No NgModules.
- **OnPush + signals.** Default `ChangeDetectionStrategy.OnPush` on every component; use `signal()` and `computed()` for state.
- **File naming (Angular 20+):** `nav.ts`, not `nav.component.ts`. Route-level pages get a `.page.ts` suffix.
- **One default export per page.** Pages use `export default class …Page` so routes can do `loadComponent: () => import(...)`.
- **Typed routes.** Always reference paths via `APP_ROUTES` from [core/constants/app-routes.ts](web/src/app/core/constants/app-routes.ts), never raw strings.
- **Lazy-load route components.** `loadComponent` over eager `component:` for everything except the most trivial.
- **Pure `firebase` SDK.** Do not add `@angular/fire`. Use the modular `firebase/*` imports through the `provideFirebase()` providers.
- **Zod at boundaries.** Cloud Functions and any external API consumer should `safeParse` the input.
- **No comments restating the code.** Comment the why (constraint, gotcha) not the what.
