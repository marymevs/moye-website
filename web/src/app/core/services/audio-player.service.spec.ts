import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AudioPlayerService, Track } from './audio-player.service';

const makeTrack = (id: string): Track => ({
  id,
  title: `Track ${id}`,
  audioUrl: `/${id}.mp3`,
});

describe('AudioPlayerService', () => {
  let service: AudioPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioPlayerService);
  });

  const audioEl = () => (service as unknown as { audio: HTMLAudioElement }).audio;

  it('play(track) sets currentTrack and wraps a standalone track in a queue', () => {
    const t = makeTrack('a');
    service.play(t);
    expect(service.currentTrack()).toEqual(t);
    expect(service.currentIndex()).toBe(0);
    expect(service.queue()).toEqual([t]);
  });

  it('setQueue replaces the queue and starts at the given index', () => {
    const a = makeTrack('a');
    const b = makeTrack('b');
    const c = makeTrack('c');
    service.setQueue([a, b, c], 1);
    expect(service.queue()).toEqual([a, b, c]);
    expect(service.currentIndex()).toBe(1);
    expect(service.currentTrack()).toEqual(b);
  });

  it('canNext and canPrev reflect queue bounds', () => {
    service.setQueue([makeTrack('a'), makeTrack('b'), makeTrack('c')], 0);
    expect(service.canPrev()).toBe(false);
    expect(service.canNext()).toBe(true);

    service.next();
    expect(service.currentIndex()).toBe(1);
    expect(service.canPrev()).toBe(true);
    expect(service.canNext()).toBe(true);

    service.next();
    expect(service.currentIndex()).toBe(2);
    expect(service.canNext()).toBe(false);
  });

  it('next() at the end of the queue is a no-op', () => {
    const a = makeTrack('a');
    const b = makeTrack('b');
    service.setQueue([a, b], 1);
    service.next();
    expect(service.currentTrack()).toEqual(b);
    expect(service.currentIndex()).toBe(1);
  });

  it('prev() at index 0 is a no-op', () => {
    const a = makeTrack('a');
    const b = makeTrack('b');
    service.setQueue([a, b], 0);
    service.prev();
    expect(service.currentTrack()).toEqual(a);
    expect(service.currentIndex()).toBe(0);
  });

  it('"ended" event auto-advances to the next track', () => {
    const a = makeTrack('a');
    const b = makeTrack('b');
    service.setQueue([a, b], 0);
    audioEl().dispatchEvent(new Event('ended'));
    expect(service.currentTrack()).toEqual(b);
    expect(service.currentIndex()).toBe(1);
  });

  it('"ended" at the end of the queue stops playback', () => {
    service.setQueue([makeTrack('a')], 0);
    audioEl().dispatchEvent(new Event('ended'));
    expect(service.isPlaying()).toBe(false);
  });

  it('seek(s) updates position', () => {
    service.play(makeTrack('a'));
    service.seek(42);
    expect(service.position()).toBe(42);
  });

  it('isPlaying syncs with the audio element play/pause events', () => {
    service.play(makeTrack('a'));
    audioEl().dispatchEvent(new Event('play'));
    expect(service.isPlaying()).toBe(true);
    audioEl().dispatchEvent(new Event('pause'));
    expect(service.isPlaying()).toBe(false);
  });

  it('setQueue with autoPlay=false preloads without playing', () => {
    const a = makeTrack('a');
    const b = makeTrack('b');
    service.setQueue([a, b], 0, false);
    expect(service.queue()).toEqual([a, b]);
    expect(service.currentIndex()).toBe(0);
    expect(service.currentTrack()).toEqual(a);
    expect(service.isPlaying()).toBe(false);
  });
});
