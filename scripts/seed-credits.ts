import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Role = 'vocals' | 'production' | 'mixing' | 'mastering';
type CreditKind = 'album' | 'single';

interface SeedCredit {
  id: string;
  artist: string;
  title: string;
  kind: CreditKind;
  releasedAt: string;
  coverFile: string;
  roles: Role[];
  contributionNote?: string;
  streamingLink?: string;
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

function contentTypeFor(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

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
  const manifestPath = resolve(__dirname, 'seed/credits.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SeedCredit[];
  if (manifest.length === 0) {
    console.log('Manifest is empty — nothing to seed. Add entries to scripts/seed/credits.json.');
    return;
  }

  console.log(`Seeding ${manifest.length} credit(s) to project=${PROJECT_ID} bucket=${STORAGE_BUCKET}\n`);

  for (const credit of manifest) {
    console.log(`credits/${credit.id} (${credit.artist} — ${credit.title})`);

    const coverPath = `public/credits/${credit.coverFile}`;
    await uploadIfPresent(
      resolve(__dirname, 'seed/credits', credit.coverFile),
      coverPath,
      contentTypeFor(credit.coverFile)
    );

    const doc: Record<string, unknown> = {
      artist: credit.artist,
      title: credit.title,
      kind: credit.kind,
      releasedAt: Timestamp.fromDate(new Date(credit.releasedAt)),
      coverPath,
      roles: credit.roles,
    };
    if (credit.contributionNote !== undefined) doc['contributionNote'] = credit.contributionNote;
    if (credit.streamingLink !== undefined) doc['streamingLink'] = credit.streamingLink;

    await db.collection('credits').doc(credit.id).set(doc);
    console.log(`  ✓ wrote Firestore doc credits/${credit.id}\n`);
  }

  console.log('Done.');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
