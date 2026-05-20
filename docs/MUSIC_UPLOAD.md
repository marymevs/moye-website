# Uploading tracks to moye.world

Tracks that play in the footer audio player live in **Firebase Storage** (the MP3 file) and **Firestore** (the metadata that points to it). This doc walks through adding one track.

## 1. Prep the audio

- Format: **MP3, 320kbps** recommended.
- Filename: lowercase, hyphenated, no spaces — e.g. `mud.mp3`, `black-orpheus.mp3`. This becomes the slug.
- Note the **duration in seconds**. Get it with:
  ```
  ffprobe -v error -show_entries format=duration -of csv=p=0 mud.mp3
  ```
  Round down to the nearest second.

Optional cover art:
- Square JPG (1500x1500 or larger).
- Filename matches the track slug: `mud.jpg`.

## 2. Upload to Storage

Firebase Console → Storage → upload to:

```
public/
  audio/
    mud.mp3
  covers/
    mud.jpg            (optional)
```

`/public/**` is publicly readable per [storage.rules](../storage.rules) — the player fetches without auth.

## 3. Create the Firestore doc

Console → Firestore → `tracks` collection → Add document. Pick a document ID (the slug — `mud`). Paste this shape (see [sample-track.json](sample-track.json)):

```json
{
  "title": "mud.",
  "audioPath": "public/audio/mud.mp3",
  "coverPath": "public/covers/mud.jpg",
  "durationSec": 214,
  "order": 1
}
```

| Field | Type | Notes |
|---|---|---|
| `title` | string | Display title shown in the player bar |
| `audioPath` | string | Storage path (not URL) — service resolves to a download URL at runtime |
| `coverPath` | string \| omit | Storage path, optional |
| `durationSec` | number | Integer seconds |
| `order` | number | Ascending sort key for the listing — pick spaced values (10, 20, 30) so you can insert later |

## 4. Verify

```
cd web && npm start
```

In the dev console (with the temporary `audioPlayer` debug hook on home.page.ts):

```js
const svc = ng.getInjector(document.querySelector('app-root')).get('TracksService');
await svc.load();
audioPlayer.setQueue(await svc.toPlayerQueue());
```

The footer player should appear and your track should start playing.

## Notes

- **Don't commit audio files** to the repo. Storage only.
- **Write access is denied** by Firestore rules — populate via Console for now. Admin auth is a later ticket.
