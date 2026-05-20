import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreditsService } from './credits.service';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { CreditRecord } from '../types/credit';

vi.mock('firebase/storage', () => ({
  ref: (storage: unknown, path: string) => ({ _storage: storage, _path: path }),
  getDownloadURL: (r: { _path: string }) =>
    Promise.resolve(`https://storage.example.com/${r._path}?alt=media`),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return { ...actual, collection: vi.fn(), getDocs: vi.fn(), orderBy: vi.fn(), query: vi.fn() };
});

const record: CreditRecord = {
  id: 'emit',
  artist: 'moye',
  title: 'EMIT',
  kind: 'album',
  releasedAt: new Date('2024-03-30'),
  coverPath: 'public/credits/emit.jpg',
  roles: ['vocals', 'production', 'mixing', 'mastering'],
};

describe('CreditsService', () => {
  let service: CreditsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIRESTORE, useValue: {} },
        { provide: FIREBASE_STORAGE, useValue: {} },
      ],
    });
    service = TestBed.inject(CreditsService);
  });

  it('starts empty', () => {
    expect(service.credits()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('toCreditWithImageUrl resolves coverPath to a download URL', async () => {
    const credit = await service.toCreditWithImageUrl(record);
    expect(credit.coverUrl).toBe(
      'https://storage.example.com/public/credits/emit.jpg?alt=media'
    );
  });

  it('toCreditWithImageUrl preserves all metadata verbatim', async () => {
    const credit = await service.toCreditWithImageUrl(record);
    expect(credit.id).toBe('emit');
    expect(credit.artist).toBe('moye');
    expect(credit.title).toBe('EMIT');
    expect(credit.kind).toBe('album');
    expect(credit.roles).toEqual(['vocals', 'production', 'mixing', 'mastering']);
    expect(credit.releasedAt).toEqual(new Date('2024-03-30'));
  });

  it('passes through optional contributionNote and streamingLink when present', async () => {
    const withExtras: CreditRecord = {
      ...record,
      contributionNote: "1. 'Tuscan Sun', 2. 'Bordeaux'",
      streamingLink: 'https://open.spotify.com/album/xyz',
    };
    const credit = await service.toCreditWithImageUrl(withExtras);
    expect(credit.contributionNote).toBe("1. 'Tuscan Sun', 2. 'Bordeaux'");
    expect(credit.streamingLink).toBe('https://open.spotify.com/album/xyz');
  });

  it('leaves optional fields undefined when not present on the record', async () => {
    const credit = await service.toCreditWithImageUrl(record);
    expect(credit.contributionNote).toBeUndefined();
    expect(credit.streamingLink).toBeUndefined();
  });

  it('toCreditsWithImageUrls maps all loaded records', async () => {
    service.credits.set([
      record,
      {
        ...record,
        id: 'mud',
        title: 'mud.',
        kind: 'single',
        coverPath: 'public/credits/mud.jpg',
        releasedAt: new Date('2025-09-19'),
      },
    ]);
    const credits = await service.toCreditsWithImageUrls();
    expect(credits).toHaveLength(2);
    expect(credits[0].title).toBe('EMIT');
    expect(credits[1].title).toBe('mud.');
    expect(credits[1].kind).toBe('single');
  });
});
