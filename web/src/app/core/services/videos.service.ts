import { Injectable, inject, signal } from '@angular/core';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FIRESTORE } from '../firebase.providers';

export interface VideoRecord {
  id: string;
  youtubeId: string;
  title: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class VideosService {
  private readonly firestore = inject(FIRESTORE);

  readonly videos = signal<VideoRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const q = query(collection(this.firestore, 'videos'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const records: VideoRecord[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<VideoRecord, 'id'>),
      }));
      this.videos.set(records);
    } catch (err) {
      console.warn('[Videos] load() failed:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      this.loading.set(false);
    }
  }
}
