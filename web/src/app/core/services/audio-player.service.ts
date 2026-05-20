import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  coverUrl?: string;
  durationSec?: number;
}

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private audio: HTMLAudioElement | null = null;

  readonly currentTrack = signal<Track | null>(null);
  readonly isPlaying = signal(false);
  readonly position = signal(0);
  readonly queue = signal<Track[]>([]);
  readonly currentIndex = signal(-1);

  readonly canNext = computed(() => {
    const q = this.queue();
    const i = this.currentIndex();
    return i >= 0 && i < q.length - 1;
  });

  readonly canPrev = computed(() => this.currentIndex() > 0);

  play(track: Track): void {
    const audio = this.ensureAudio();
    if (!audio) return;

    let q = this.queue();
    let idx = q.findIndex(t => t.id === track.id);
    if (idx === -1) {
      q = [track];
      this.queue.set(q);
      idx = 0;
    }

    this.currentIndex.set(idx);
    this.currentTrack.set(track);

    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
    }
    audio.play().catch(() => this.isPlaying.set(false));
  }

  pause(): void {
    this.audio?.pause();
  }

  toggle(): void {
    if (!this.audio || !this.currentTrack()) return;
    if (this.audio.paused) {
      this.audio.play().catch(() => this.isPlaying.set(false));
    } else {
      this.audio.pause();
    }
  }

  next(): void {
    const q = this.queue();
    const i = this.currentIndex();
    if (i < 0 || i >= q.length - 1) return;
    this.play(q[i + 1]);
  }

  prev(): void {
    const q = this.queue();
    const i = this.currentIndex();
    if (i <= 0) return;
    this.play(q[i - 1]);
  }

  seek(seconds: number): void {
    if (!this.audio) return;
    this.audio.currentTime = seconds;
    this.position.set(seconds);
  }

  setQueue(tracks: Track[], startIndex = 0): void {
    this.queue.set(tracks);
    if (tracks.length > 0 && startIndex >= 0 && startIndex < tracks.length) {
      this.play(tracks[startIndex]);
    } else {
      this.currentIndex.set(-1);
      this.currentTrack.set(null);
    }
  }

  private ensureAudio(): HTMLAudioElement | null {
    if (!this.isBrowser) return null;
    if (this.audio) return this.audio;

    const a = new Audio();
    a.preload = 'metadata';
    a.addEventListener('timeupdate', () => this.position.set(a.currentTime));
    a.addEventListener('play', () => this.isPlaying.set(true));
    a.addEventListener('pause', () => this.isPlaying.set(false));
    a.addEventListener('ended', () => {
      if (this.canNext()) {
        this.next();
      } else {
        this.isPlaying.set(false);
      }
    });
    this.audio = a;
    return a;
  }
}
