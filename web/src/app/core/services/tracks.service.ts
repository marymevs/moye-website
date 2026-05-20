import { Injectable, inject, signal } from '@angular/core';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { Track } from './audio-player.service';

export interface TrackRecord {
  id: string;
  title: string;
  audioPath: string;
  coverPath?: string;
  durationSec: number;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class TracksService {
  private readonly firestore = inject(FIRESTORE);
  private readonly storage = inject(FIREBASE_STORAGE);

  readonly tracks = signal<TrackRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const q = query(collection(this.firestore, 'tracks'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const records: TrackRecord[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<TrackRecord, 'id'>) }));
      this.tracks.set(records);
    } catch (err) {
      console.warn('[Tracks] load() failed:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load tracks');
    } finally {
      this.loading.set(false);
    }
  }

  async toPlayerTrack(record: TrackRecord): Promise<Track> {
    const [audioUrl, coverUrl] = await Promise.all([
      getDownloadURL(ref(this.storage, record.audioPath)),
      record.coverPath
        ? getDownloadURL(ref(this.storage, record.coverPath))
        : Promise.resolve(undefined),
    ]);
    return {
      id: record.id,
      title: record.title,
      audioUrl,
      coverUrl,
      durationSec: record.durationSec,
    };
  }

  async toPlayerQueue(): Promise<Track[]> {
    return Promise.all(this.tracks().map(r => this.toPlayerTrack(r)));
  }
}
