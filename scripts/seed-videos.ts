import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedVideo {
  id: string;
  youtubeId: string;
  title: string;
  order: number;
}

const PROJECT_ID = process.env.FIREBASE_PROJECT ?? 'moye-website';

const app = initializeApp({
  projectId: PROJECT_ID,
  credential: applicationDefault(),
});

const db = getFirestore(app);

async function seed(): Promise<void> {
  const manifestPath = resolve(__dirname, 'seed/videos.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SeedVideo[];
  if (manifest.length === 0) {
    console.log('Manifest is empty — nothing to seed. Add entries to scripts/seed/videos.json.');
    return;
  }

  console.log(`Seeding ${manifest.length} video(s) to project=${PROJECT_ID}\n`);

  for (const video of manifest) {
    console.log(`videos/${video.id} (${video.title})`);
    await db.collection('videos').doc(video.id).set({
      youtubeId: video.youtubeId,
      title: video.title,
      order: video.order,
    });
    console.log(`  ✓ wrote Firestore doc videos/${video.id}\n`);
  }

  console.log('Done.');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
