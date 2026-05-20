import { Injectable, inject, signal } from '@angular/core';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { Product, ProductRecord } from '../types/product';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly firestore = inject(FIRESTORE);
  private readonly storage = inject(FIREBASE_STORAGE);

  readonly products = signal<ProductRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const q = query(collection(this.firestore, 'products'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const records: ProductRecord[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<ProductRecord, 'id'>),
      }));
      this.products.set(records);
    } catch (err) {
      console.warn('[Products] load() failed:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      this.loading.set(false);
    }
  }

  async toProductWithImageUrl(record: ProductRecord): Promise<Product> {
    const coverUrl = await getDownloadURL(ref(this.storage, record.coverPath));
    return {
      id: record.id,
      title: record.title,
      shortBio: record.shortBio,
      longBio: record.longBio,
      priceCents: record.priceCents,
      coverUrl,
      stock: record.stock,
    };
  }

  async toProductsWithImageUrls(): Promise<Product[]> {
    return Promise.all(this.products().map(r => this.toProductWithImageUrl(r)));
  }
}
