import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReleasesService } from './releases.service';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { Release } from '../types/release';

vi.mock('firebase/storage', () => ({
  ref: (storage: unknown, path: string) => ({ _storage: storage, _path: path }),
  getDownloadURL: (r: { _path: string }) =>
    Promise.resolve(`https://storage.example.com/${r._path}?alt=media`),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return { ...actual, collection: vi.fn(), getDocs: vi.fn(), orderBy: vi.fn(), query: vi.fn() };
});

const release: Release = {
  id: 'midnight-blue',
  title: 'Midnight Blue',
  kind: 'project',
  coverPath: 'public/covers/midnight-blue.jpg',
  releasedAt: new Date('2026-01-15'),
  roles: ['vocals', 'production'],
  tracks: [
    { title: 'Opening', audioPath: 'public/audio/midnight-blue/01-opening.mp3', durationSec: 187, order: 1 },
    { title: 'Closing', audioPath: 'public/audio/midnight-blue/02-closing.mp3', durationSec: 203, order: 2 },
  ],
};

describe('ReleasesService.toPlayerTrack', () => {
  let service: ReleasesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIRESTORE, useValue: {} },
        { provide: FIREBASE_STORAGE, useValue: {} },
      ],
    });
    service = TestBed.inject(ReleasesService);
  });

  it('resolves audioPath and coverPath to download URLs', async () => {
    const track = await service.toPlayerTrack(release, release.tracks[0]);
    expect(track.audioUrl).toBe('https://storage.example.com/public/audio/midnight-blue/01-opening.mp3?alt=media');
    expect(track.coverUrl).toBe('https://storage.example.com/public/covers/midnight-blue.jpg?alt=media');
  });

  it('builds a stable id from release id and track order', async () => {
    const track = await service.toPlayerTrack(release, release.tracks[1]);
    expect(track.id).toBe('midnight-blue-2');
  });

  it('carries title and durationSec through', async () => {
    const track = await service.toPlayerTrack(release, release.tracks[0]);
    expect(track.title).toBe('Opening');
    expect(track.durationSec).toBe(187);
  });

  it('leaves coverUrl undefined when release has no coverPath', async () => {
    const noCover: Release = { ...release, coverPath: '' };
    const track = await service.toPlayerTrack(noCover, noCover.tracks[0]);
    expect(track.coverUrl).toBeUndefined();
  });

  it('toPlayerQueue maps all tracks in order', async () => {
    const queue = await service.toPlayerQueue(release);
    expect(queue).toHaveLength(2);
    expect(queue[0].title).toBe('Opening');
    expect(queue[1].title).toBe('Closing');
  });
});
