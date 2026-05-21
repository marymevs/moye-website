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
    // audio.play() returns a Promise in real browsers but can return
    // undefined in some test environments (jsdom). Promise.resolve()
    // normalizes both cases so the catch always works.
    Promise.resolve(audio.play()).catch(err => {
      console.warn('[AudioPlayer] play() rejected:', err);
      this.isPlaying.set(false);
    });
  }

  pause(): void {
    this.audio?.pause();
  }

  toggle(): void {
    if (!this.audio || !this.currentTrack()) return;
    if (this.audio.paused) {
      Promise.resolve(this.audio.play()).catch(err => {
        console.warn('[AudioPlayer] play() rejected:', err);
        this.isPlaying.set(false);
      });
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

  setQueue(tracks: Track[], startIndex = 0, autoPlay = true): void {
    this.queue.set(tracks);
    if (tracks.length === 0 || startIndex < 0 || startIndex >= tracks.length) {
      this.currentIndex.set(-1);
      this.currentTrack.set(null);
      return;
    }
    if (autoPlay) {
      this.play(tracks[startIndex]);
    } else {
      this.preload(tracks[startIndex], startIndex);
    }
  }

  private preload(track: Track, index: number): void {
    const audio = this.ensureAudio();
    this.currentIndex.set(index);
    this.currentTrack.set(track);
    if (audio && audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
    }
  }

  private ensureAudio(): HTMLAudioElement | null {
    if (!this.isBrowser) return null;
    if (this.audio) return this.audio;

    const a = new Audio();
    a.preload = 'auto';
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
