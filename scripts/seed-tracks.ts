import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedTrack {
  id: string;
  title: string;
  audioFile: string;
  coverFile?: string;
  durationSec: number;
  order: number;
}

const PROJECT_ID = process.env.FIREBASE_PROJECT ?? 'moye-website';
const STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? `${PROJECT_ID}.firebasestorage.app`;

const app = initializeApp({
  projectId: PROJECT_ID,
  credential: applicationDefault(),
  storageBucket: STORAGE_BUCKET,
});

const db = getFirestore(app);
const bucket = getStorage(app).bucket();

async function uploadIfPresent(localPath: string, destPath: string, contentType: string): Promise<void> {
  if (!existsSync(localPath)) {
    throw new Error(`File not found: ${localPath}`);
  }
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: { contentType },
  });
  console.log(`  ✓ uploaded ${destPath}`);
}

async function seed(): Promise<void> {
  const manifestPath = resolve(__dirname, 'seed/tracks.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SeedTrack[];
  if (manifest.length === 0) {
    console.log('Manifest is empty — nothing to seed. Add entries to scripts/seed/tracks.json.');
    return;
  }

  console.log(`Seeding ${manifest.length} track(s) to project=${PROJECT_ID} bucket=${STORAGE_BUCKET}\n`);

  for (const track of manifest) {
    console.log(`tracks/${track.id} (${track.title})`);

    const audioPath = `public/audio/${track.audioFile}`;
    await uploadIfPresent(
      resolve(__dirname, 'seed/audio', track.audioFile),
      audioPath,
      'audio/mpeg'
    );

    let coverPath: string | null = null;
    if (track.coverFile) {
      coverPath = `public/covers/${track.coverFile}`;
      await uploadIfPresent(
        resolve(__dirname, 'seed/covers', track.coverFile),
        coverPath,
        'image/jpeg'
      );
    }

    await db.collection('tracks').doc(track.id).set({
      title: track.title,
      audioPath,
      coverPath,
      durationSec: track.durationSec,
      order: track.order,
    });
    console.log(`  ✓ wrote Firestore doc tracks/${track.id}\n`);
  }

  console.log('Done.');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
