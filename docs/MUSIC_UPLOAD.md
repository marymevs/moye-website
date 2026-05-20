# Uploading music to moye.world

Music files live in **Firebase Storage** under `/public/**` (publicly readable). Release metadata (title, tracklist, roles, etc.) lives in **Firestore** in the `releases` collection. The site joins them at runtime via `ReleasesService`.

This doc walks through uploading one release end-to-end.

## 1. Prep the audio

Per-track:
- Format: **MP3, 320kbps** (web streaming format). High-res masters can be archived elsewhere.
- Filename: `{order}-{slug}.mp3` — e.g. `01-opening.mp3`, `02-closing.mp3`. Two-digit order so files sort correctly in the bucket UI.
- Note the **duration in seconds** — you'll need it for the Firestore doc. Get it with:
  ```
  ffprobe -v error -show_entries format=duration -of csv=p=0 01-opening.mp3
  ```
  Round down to the nearest second.

Cover art:
- Format: **JPG, square** (1500x1500 or 3000x3000).
- Filename: `{releaseId}.jpg` — e.g. `midnight-blue.jpg`.

## 2. Pick a release ID

A short, URL-safe slug — kebab-case, lowercase, no spaces. Examples: `midnight-blue`, `garden-sessions`, `single-april-2026`. This is the Firestore doc ID and also the folder name in Storage.

## 3. Upload to Storage

Via the Firebase Console (https://console.firebase.google.com → Storage):

```
public/
  audio/
    {releaseId}/
      01-opening.mp3
      02-closing.mp3
      ...
  covers/
    {releaseId}.jpg
```

Or via CLI:
```
firebase storage:upload ./local/01-opening.mp3 public/audio/{releaseId}/01-opening.mp3
firebase storage:upload ./local/midnight-blue.jpg public/covers/{releaseId}.jpg
```

The `/public/**` path is publicly readable per [storage.rules](../storage.rules) — no auth needed for the player to fetch.

## 4. Create the Firestore doc

Console → Firestore → `releases` collection → Add document → set the document ID to your `releaseId` from step 2. Paste this shape (see [sample-release.json](sample-release.json)):

```json
{
  "title": "Midnight Blue",
  "kind": "project",
  "coverPath": "public/covers/midnight-blue.jpg",
  "releasedAt": "<Timestamp: 2026-01-15 00:00:00 UTC>",
  "roles": ["vocals", "production"],
  "tracks": [
    {
      "title": "Opening",
      "audioPath": "public/audio/midnight-blue/01-opening.mp3",
      "durationSec": 187,
      "order": 1
    },
    {
      "title": "Closing",
      "audioPath": "public/audio/midnight-blue/02-closing.mp3",
      "durationSec": 203,
      "order": 2
    }
  ]
}
```

**Field reference:**

| Field | Type | Notes |
|---|---|---|
| `title` | string | Display title |
| `kind` | `'single'` \| `'project'` | Single = one track, project = album/EP |
| `coverPath` | string | Storage path, not URL |
| `releasedAt` | Timestamp | Used for ordering the `.lore` timeline (desc) |
| `roles` | string[] | Any of `'vocals'`, `'production'`, `'engineering'` |
| `tracks[]` | array | Embedded; sorted by `order` at read time |
| `tracks[].audioPath` | string | Storage path, not URL |
| `tracks[].durationSec` | number | Integer seconds |
| `tracks[].order` | number | Track number (1-indexed) |

## 5. Verify

```
cd web && npm start
```

Open the dev console:
```js
const svc = ng.getInjector(document.querySelector('app-root')).get('ReleasesService');
await svc.load();
console.log(svc.releases());
```

You should see your release in the array. The `.listen` and `.lore` pages (once built) will render it automatically.

## Notes

- **Don't commit audio files** to the repo. Storage only.
- **Write access is denied** by Firestore rules — populate via Console / CLI for now. Admin auth lands in a later ticket.
- **Migrating the schema later**: embedded `tracks` arrays make schema changes a doc-by-doc rewrite. Plan field additions carefully.
