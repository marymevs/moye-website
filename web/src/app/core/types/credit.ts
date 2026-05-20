import { Timestamp } from 'firebase/firestore';

export type Role = 'vocals' | 'production' | 'mixing' | 'mastering';
export type CreditKind = 'album' | 'single';

/**
 * Firestore doc shape for the `credits` collection.
 * `releasedAt` is a Firestore Timestamp here; the service converts
 * it to a JS `Date` on load.
 */
export interface CreditDoc {
  artist: string;
  title: string;
  kind: CreditKind;
  releasedAt: Timestamp;
  coverPath: string;
  roles: Role[];
  contributionNote?: string;
  streamingLink?: string;
}

/**
 * Loaded shape — `releasedAt` is a JS `Date`, `coverPath` is still
 * the raw Storage path (not yet resolved to a download URL).
 */
export interface CreditRecord {
  id: string;
  artist: string;
  title: string;
  kind: CreditKind;
  releasedAt: Date;
  coverPath: string;
  roles: Role[];
  contributionNote?: string;
  streamingLink?: string;
}

/**
 * Runtime shape consumed by UI components — `coverUrl` is the public
 * download URL resolved via Firebase Storage.
 */
export interface Credit {
  id: string;
  artist: string;
  title: string;
  kind: CreditKind;
  releasedAt: Date;
  coverUrl: string;
  roles: Role[];
  contributionNote?: string;
  streamingLink?: string;
}
