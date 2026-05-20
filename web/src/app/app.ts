import { Component, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/layout/nav';
import { FooterComponent } from './shared/layout/footer';
import { AudioPlayerComponent } from './shared/layout/audio-player';
import { AudioPlayerService } from './core/services/audio-player.service';
import { TracksService } from './core/services/tracks.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, FooterComponent, AudioPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly tracksService = inject(TracksService);
  private readonly audioPlayer = inject(AudioPlayerService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      void this.bootstrapPlayer();
    }
  }

  private async bootstrapPlayer(): Promise<void> {
    try {
      await this.tracksService.load();
      const queue = await this.tracksService.toPlayerQueue();
      if (queue.length > 0) {
        this.audioPlayer.setQueue(queue, 0, false);
      }
    } catch (err) {
      console.warn('[App] player bootstrap failed:', err);
    }
  }
}
