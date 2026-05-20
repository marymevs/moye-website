import { Injectable, inject, signal } from '@angular/core';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { Release, ReleaseDoc, ReleaseTrack } from '../types/release';
import { Track } from './audio-player.service';

@Injectable({ providedIn: 'root' })
export class ReleasesService {
  private readonly firestore = inject(FIRESTORE);
  private readonly storage = inject(FIREBASE_STORAGE);

  readonly releases = signal<Release[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const q = query(collection(this.firestore, 'releases'), orderBy('releasedAt', 'desc'));
      const snap = await getDocs(q);
      const releases: Release[] = snap.docs.map(d => {
        const data = d.data() as ReleaseDoc;
        return {
          id: d.id,
          title: data.title,
          kind: data.kind,
          coverPath: data.coverPath,
          releasedAt: data.releasedAt.toDate(),
          roles: data.roles ?? [],
          tracks: [...(data.tracks ?? [])].sort((a, b) => a.order - b.order),
        };
      });
      this.releases.set(releases);
    } catch (err) {
      console.warn('[Releases] load() failed:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load releases');
    } finally {
      this.loading.set(false);
    }
  }

  async toPlayerTrack(release: Release, track: ReleaseTrack): Promise<Track> {
    const [audioUrl, coverUrl] = await Promise.all([
      getDownloadURL(ref(this.storage, track.audioPath)),
      release.coverPath
        ? getDownloadURL(ref(this.storage, release.coverPath))
        : Promise.resolve(undefined),
    ]);
    return {
      id: `${release.id}-${track.order}`,
      title: track.title,
      audioUrl,
      coverUrl,
      durationSec: track.durationSec,
    };
  }

  async toPlayerQueue(release: Release): Promise<Track[]> {
    return Promise.all(release.tracks.map(t => this.toPlayerTrack(release, t)));
  }
}
