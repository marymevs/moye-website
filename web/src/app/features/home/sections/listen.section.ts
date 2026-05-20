import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AudioPlayerService, Track } from '../../../core/services/audio-player.service';

@Component({
  selector: 'app-listen-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tracks().length > 0) {
      <section class="listen">
        <h2>.listen</h2>
        <div class="grid">
          @for (track of tracks(); track track.id) {
            <div class="tile">
              <button
                type="button"
                class="square-box"
                [class.is-current]="isCurrent(track)"
                (click)="play(track)"
                [attr.aria-label]="'Play ' + track.title"
              >
                @if (track.coverUrl) {
                  <img [src]="track.coverUrl" [alt]="track.title" />
                } @else {
                  <div class="cover-blank" aria-hidden="true"></div>
                }
              </button>
              <span class="title">{{ track.title }}</span>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .listen {
      padding: 2rem 0 3rem;
    }
    h2 {
      margin: 0 0 1.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.5rem;
    }
    .tile {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }
    .tile button {
      border: 0;
      padding: 0;
      background: transparent;
      width: 100%;
    }
    .tile button.is-current {
      box-shadow: 0 0 0 2px var(--color-ink), 0 2px 12px rgba(17, 17, 17, 0.08);
    }
    .tile img,
    .tile .cover-blank {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cover-blank {
      background: var(--color-border);
    }
    .title {
      font-size: var(--text-small);
      font-weight: 500;
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class ListenSectionComponent {
  private readonly audioPlayer = inject(AudioPlayerService);

  protected readonly tracks = this.audioPlayer.queue;

  protected isCurrent(track: Track): boolean {
    return this.audioPlayer.currentTrack()?.id === track.id;
  }

  protected play(track: Track): void {
    this.audioPlayer.play(track);
  }
}
