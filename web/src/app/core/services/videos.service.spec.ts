import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { VideosService } from './videos.service';
import { FIRESTORE } from '../firebase.providers';

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FIRESTORE, useValue: {} }],
    });
    service = TestBed.inject(VideosService);
  });

  it('exposes empty videos signal on construction', () => {
    expect(service.videos()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('videos signal can be set manually for tests', () => {
    service.videos.set([
      { id: 'nocturnal', youtubeId: 'B20gNyiF9JA', title: 'nocturnal (video)', order: 10 },
    ]);
    expect(service.videos()).toHaveLength(1);
    expect(service.videos()[0].youtubeId).toBe('B20gNyiF9JA');
  });
});
