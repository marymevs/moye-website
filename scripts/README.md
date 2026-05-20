# Seed scripts

One-off Node scripts for populating Firebase services from local manifests.

## seed-tracks.ts

Uploads MP3s and (optionally) cover art to Firebase Storage, then writes the corresponding docs to the Firestore `tracks` collection.

### One-time setup

1. Install deps:
   ```
   cd scripts && npm install
   ```
2. Auth with Google Cloud (the admin SDK auto-picks these up):
   ```
   gcloud auth application-default login
   ```
   If `gcloud` isn't installed, get it from https://cloud.google.com/sdk/docs/install.

### Adding a track

1. Drop the MP3 into `scripts/seed/audio/` — e.g. `mud.mp3`.
2. (Optional) Drop a square JPG cover into `scripts/seed/covers/` — e.g. `mud.jpg`.
3. Add an entry to `scripts/seed/tracks.json`:
   ```json
   {
     "id": "mud",
     "title": "mud.",
     "audioFile": "mud.mp3",
     "coverFile": "mud.jpg",
     "durationSec": 214,
     "order": 1
   }
   ```
4. Run:
   ```
   cd scripts && npm run seed
   ```

The script uploads files to Storage and writes (or overwrites) the Firestore docs. **Idempotent** — running it again with the same manifest produces the same state, doesn't duplicate.

### Config

Defaults to the project from `web/src/environments/environment.ts`:
- Project: `moye-website`
- Bucket: `moye-website.firebasestorage.app`

Override either via env vars:
```
FIREBASE_PROJECT=moye-website-dev STORAGE_BUCKET=moye-website-dev.firebasestorage.app npm run seed
```

### Manifest schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Firestore doc ID — short slug |
| `title` | string | yes | Display title |
| `audioFile` | string | yes | Filename inside `scripts/seed/audio/` |
| `coverFile` | string | no | Filename inside `scripts/seed/covers/` |
| `durationSec` | number | yes | Integer seconds. Get with `ffprobe -v error -show_entries format=duration -of csv=p=0 file.mp3` |
| `order` | number | yes | Ascending sort key. Pick spaced values (10, 20, 30) so you can insert later |

### Notes

- Audio and cover files under `scripts/seed/audio/` and `scripts/seed/covers/` are gitignored. Only the manifest is committed.
- The script bypasses Firestore security rules (admin SDK) — that's expected for tooling.
- Running against the wrong project? Set `FIREBASE_PROJECT` explicitly to be safe.
