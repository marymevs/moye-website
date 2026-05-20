import { Injectable, inject, signal } from '@angular/core';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { FIRESTORE, FIREBASE_STORAGE } from '../firebase.providers';
import { Credit, CreditDoc, CreditRecord } from '../types/credit';

@Injectable({ providedIn: 'root' })
export class CreditsService {
  private readonly firestore = inject(FIRESTORE);
  private readonly storage = inject(FIREBASE_STORAGE);

  readonly credits = signal<CreditRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const q = query(collection(this.firestore, 'credits'), orderBy('releasedAt', 'desc'));
      const snap = await getDocs(q);
      const records: CreditRecord[] = snap.docs.map(d => {
        const data = d.data() as CreditDoc;
        return {
          id: d.id,
          artist: data.artist,
          title: data.title,
          kind: data.kind,
          releasedAt: data.releasedAt.toDate(),
          coverPath: data.coverPath,
          roles: data.roles ?? [],
          contributionNote: data.contributionNote,
          streamingLink: data.streamingLink,
        };
      });
      this.credits.set(records);
    } catch (err) {
      console.warn('[Credits] load() failed:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load credits');
    } finally {
      this.loading.set(false);
    }
  }

  async toCreditWithImageUrl(record: CreditRecord): Promise<Credit> {
    const coverUrl = await getDownloadURL(ref(this.storage, record.coverPath));
    return {
      id: record.id,
      artist: record.artist,
      title: record.title,
      kind: record.kind,
      releasedAt: record.releasedAt,
      coverUrl,
      roles: record.roles,
      contributionNote: record.contributionNote,
      streamingLink: record.streamingLink,
    };
  }

  async toCreditsWithImageUrls(): Promise<Credit[]> {
    return Promise.all(this.credits().map(r => this.toCreditWithImageUrl(r)));
  }
}
