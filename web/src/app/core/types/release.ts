import { Timestamp } from 'firebase/firestore';

export type Role = 'vocals' | 'production' | 'engineering';
export type ReleaseKind = 'single' | 'project';

export interface ReleaseTrack {
  title: string;
  audioPath: string;
  durationSec: number;
  order: number;
}

export interface Release {
  id: string;
  title: string;
  kind: ReleaseKind;
  coverPath: string;
  releasedAt: Date;
  roles: Role[];
  tracks: ReleaseTrack[];
}

export interface ReleaseDoc {
  title: string;
  kind: ReleaseKind;
  coverPath: string;
  releasedAt: Timestamp;
  roles: Role[];
  tracks: ReleaseTrack[];
}
