import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AudioPlayerService } from '../../core/services/audio-player.service';

@Component({
  selector: 'app-audio-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (player.currentTrack(); as track) {
      <div class="bar">
        @if (track.coverUrl) {
          <img class="cover" [src]="track.coverUrl" [alt]="track.title" />
        } @else {
          <div class="cover cover--blank" aria-hidden="true"></div>
        }
        <div class="meta">
          <span class="title">{{ track.title }}</span>
          <div class="scrub">
            <span class="time">{{ formatTime(player.position()) }}</span>
            <input
              type="range"
              min="0"
              [max]="maxScrub(track)"
              [value]="player.position()"
              (input)="onSeek($event)"
              aria-label="Seek"
            />
            <span class="time">{{ formatTime(maxScrub(track)) }}</span>
          </div>
        </div>
        <div class="controls">
          <button type="button" (click)="player.prev()" [disabled]="!player.canPrev()" aria-label="Previous track">⏮</button>
          <button type="button" class="play" (click)="player.toggle()" [attr.aria-label]="player.isPlaying() ? 'Pause' : 'Play'">
            {{ player.isPlaying() ? '❚❚' : '▶' }}
          </button>
          <button type="button" (click)="player.next()" [disabled]="!player.canNext()" aria-label="Next track">⏭</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--color-bg);
      border-top: 1px solid var(--color-border);
      box-shadow: 0 -4px 16px rgba(17, 17, 17, 0.04);
      z-index: 50;
    }
    .cover {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 4px;
      object-fit: cover;
    }
    .cover--blank { background: var(--color-border); }
    .meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
    .title {
      font-size: var(--text-small);
      font-weight: 500;
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .scrub { display: flex; align-items: center; gap: 0.5rem; }
    .scrub input { flex: 1; }
    .time {
      font-size: 0.75rem;
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
      min-width: 2.5em;
    }
    .controls { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .controls button {
      background: transparent;
      border: none;
      color: var(--color-ink);
      font-size: 1.125rem;
      padding: 0.25rem 0.5rem;
      line-height: 1;
    }
    .controls button[disabled] { color: var(--color-border); }
    .controls .play { font-size: 1.5rem; }
  `],
})
export class AudioPlayerComponent {
  protected readonly player = inject(AudioPlayerService);

  protected maxScrub(track: { durationSec?: number }): number {
    return track.durationSec ?? 300;
  }

  protected formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  protected onSeek(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.player.seek(value);
  }
}
