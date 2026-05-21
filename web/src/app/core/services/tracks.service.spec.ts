import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TracksService, TrackRecord } from './tracks.service';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';

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

const record: TrackRecord = {
  id: 'mud',
  title: 'mud.',
  audioPath: 'public/audio/mud.mp3',
  coverPath: 'public/covers/mud.jpg',
  durationSec: 214,
  order: 1,
};

describe('TracksService.toPlayerTrack', () => {
  let service: TracksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIRESTORE, useValue: {} },
        { provide: FIREBASE_STORAGE, useValue: {} },
      ],
    });
    service = TestBed.inject(TracksService);
  });

  it('resolves audioPath and coverPath to download URLs', async () => {
    const track = await service.toPlayerTrack(record);
    expect(track.audioUrl).toBe('https://storage.example.com/public/audio/mud.mp3?alt=media');
    expect(track.coverUrl).toBe('https://storage.example.com/public/covers/mud.jpg?alt=media');
  });

  it('carries id, title, and durationSec through', async () => {
    const track = await service.toPlayerTrack(record);
    expect(track.id).toBe('mud');
    expect(track.title).toBe('mud.');
    expect(track.durationSec).toBe(214);
  });

  it('leaves coverUrl undefined when record has no coverPath', async () => {
    const noCover: TrackRecord = { ...record, coverPath: undefined };
    const track = await service.toPlayerTrack(noCover);
    expect(track.coverUrl).toBeUndefined();
  });

  it('toPlayerQueue maps all loaded records', async () => {
    service.tracks.set([
      record,
      { ...record, id: 'emit', title: 'EMIT', audioPath: 'public/audio/emit.mp3', order: 2 },
    ]);
    const queue = await service.toPlayerQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0].title).toBe('mud.');
    expect(queue[1].title).toBe('EMIT');
  });
});
