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

## seed-videos.ts

Writes YouTube music video metadata to the Firestore `videos` collection. No Storage uploads — YouTube hosts the actual videos.

### Adding a video

1. Add an entry to `scripts/seed/videos.json`:
   ```json
   {
     "id": "necropolis",
     "youtubeId": "o5hw1BVWmco",
     "title": "necropolis",
     "order": 20
   }
   ```
2. Run:
   ```
   cd scripts && npm run seed:videos
   ```

The `youtubeId` is the 11-character ID from the URL (e.g. `https://www.youtube.com/watch?v=o5hw1BVWmco` → `o5hw1BVWmco`).

Idempotent — re-running with the same manifest overwrites in place, no duplicates.

### Manifest schema

| Field | Type | Notes |
|---|---|---|
| `id` | string | Firestore doc ID — short slug |
| `youtubeId` | string | 11-character YouTube video ID |
| `title` | string | Display caption shown below the embed |
| `order` | number | Ascending sort key. Spaced (10, 20, 30) so inserts are cheap |

## seed-products.ts

Uploads product cover images to Firebase Storage, then writes the corresponding docs to the Firestore `products` collection.

### Adding a product

1. Drop a square JPG cover into `scripts/seed/products/` — e.g. `vinyl.jpg`.
2. Add an entry to `scripts/seed/products.json`:
   ```json
   {
     "id": "vinyl",
     "title": "sable hibiscus vol. 1 (vinyl)",
     "shortBio": "180g black vinyl",
     "longBio": "Limited pressing. Gatefold sleeve.",
     "priceCents": 3500,
     "coverFile": "vinyl.jpg",
     "stock": 50,
     "order": 10
   }
   ```
3. Run:
   ```
   cd scripts && npm run seed:products
   ```

Idempotent — re-running overwrites in place.

### Placeholder cover images

Unlike `scripts/seed/audio/` (gitignored, expects real artist-owned files), `scripts/seed/products/` **is** committed so anyone cloning the repo can run `npm run seed:products` immediately and see the buy UI populated. The committed JPGs are simple colored squares with type labels (`VINYL`, `TEE`, etc.) — they're dev fixtures.

Replace them with real product photography when available — drop new JPGs at the same filenames and re-seed. If those real photos get large, gitignore the folder at that point.

### Manifest schema

| Field | Type | Notes |
|---|---|---|
| `id` | string | Firestore doc ID — short slug |
| `title` | string | Display title in the buy grid and modal |
| `shortBio` | string | Hover-overlay text in the grid |
| `longBio` | string | Detail-modal body text |
| `priceCents` | number | Price in cents (integer). Avoids float math. |
| `coverFile` | string | Filename inside `scripts/seed/products/` |
| `stock` | number | Available units. `0` shows as "sold out" in UI. |
| `order` | number | Ascending sort key. Spaced (10, 20, 30) for easy inserts. |
