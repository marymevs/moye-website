import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedProduct {
  id: string;
  title: string;
  shortBio: string;
  longBio: string;
  priceCents: number;
  coverFile: string;
  stock: number;
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
  const manifestPath = resolve(__dirname, 'seed/products.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SeedProduct[];
  if (manifest.length === 0) {
    console.log('Manifest is empty — nothing to seed. Add entries to scripts/seed/products.json.');
    return;
  }

  console.log(`Seeding ${manifest.length} product(s) to project=${PROJECT_ID} bucket=${STORAGE_BUCKET}\n`);

  for (const product of manifest) {
    console.log(`products/${product.id} (${product.title})`);

    const coverPath = `public/products/${product.coverFile}`;
    await uploadIfPresent(
      resolve(__dirname, 'seed/products', product.coverFile),
      coverPath,
      contentTypeFor(product.coverFile)
    );

    await db.collection('products').doc(product.id).set({
      title: product.title,
      shortBio: product.shortBio,
      longBio: product.longBio,
      priceCents: product.priceCents,
      coverPath,
      stock: product.stock,
      order: product.order,
    });
    console.log(`  ✓ wrote Firestore doc products/${product.id}\n`);
  }

  console.log('Done.');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
