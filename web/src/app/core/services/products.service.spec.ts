import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsService } from './products.service';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { ProductRecord } from '../types/product';

vi.mock('firebase/analytics', () => ({
  initializeAnalytics: () => null,
}));

vi.mock('firebase/storage', () => ({
  ref: (storage: unknown, path: string) => ({ _storage: storage, _path: path }),
  getDownloadURL: (r: { _path: string }) =>
    Promise.resolve(`https://storage.example.com/${r._path}?alt=media`),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
}));

const record: ProductRecord = {
  id: 'sable-hibiscus-vinyl',
  title: 'sable hibiscus vol. 1 (vinyl)',
  shortBio: '180g black vinyl',
  longBio: 'Limited pressing of sable hibiscus vol. 1 — ad aeternum. 180g black vinyl, gatefold sleeve.',
  priceCents: 3500,
  coverPath: 'public/products/sable-hibiscus-vinyl.jpg',
  stock: 50,
  order: 10,
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIRESTORE, useValue: {} },
        { provide: FIREBASE_STORAGE, useValue: {} },
      ],
    });
    service = TestBed.inject(ProductsService);
  });

  it('starts with empty products and no error', () => {
    expect(service.products()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('toProductWithImageUrl resolves coverPath to a download URL', async () => {
    const product = await service.toProductWithImageUrl(record);
    expect(product.coverUrl).toBe(
      'https://storage.example.com/public/products/sable-hibiscus-vinyl.jpg?alt=media'
    );
  });

  it('toProductWithImageUrl preserves all other fields verbatim', async () => {
    const product = await service.toProductWithImageUrl(record);
    expect(product.id).toBe('sable-hibiscus-vinyl');
    expect(product.title).toBe('sable hibiscus vol. 1 (vinyl)');
    expect(product.shortBio).toBe('180g black vinyl');
    expect(product.longBio).toContain('Limited pressing');
    expect(product.priceCents).toBe(3500);
    expect(product.stock).toBe(50);
  });

  it('toProductsWithImageUrls maps all loaded records', async () => {
    service.products.set([
      record,
      { ...record, id: 'tee', title: 'sable hibiscus tee', coverPath: 'public/products/tee.jpg', order: 20 },
    ]);
    const resolved = await service.toProductsWithImageUrls();
    expect(resolved).toHaveLength(2);
    expect(resolved[0].title).toBe('sable hibiscus vol. 1 (vinyl)');
    expect(resolved[1].title).toBe('sable hibiscus tee');
  });
});
