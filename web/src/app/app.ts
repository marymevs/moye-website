import { Component, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/layout/nav';
import { FooterComponent } from './shared/layout/footer';
import { AudioPlayerComponent } from './shared/layout/audio-player';
import { MailingListModalComponent } from './shared/mailing-list-modal';
import { AudioPlayerService } from './core/services/audio-player.service';
import { TracksService } from './core/services/tracks.service';
import { MailingListService } from './core/services/mailing-list.service';

const FIRST_VISIT_POPUP_DELAY_MS = 10_000;

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavComponent,
    FooterComponent,
    AudioPlayerComponent,
    MailingListModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly tracksService = inject(TracksService);
  private readonly audioPlayer = inject(AudioPlayerService);
  private readonly mailingList = inject(MailingListService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      void this.bootstrapPlayer();
      this.scheduleFirstVisitPopup();
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

  /**
   * On first visit (no `moye:mailingListSeen` in localStorage),
   * open the mailing list popup after a delay. Skip silently
   * if the visitor has already seen it.
   */
  private scheduleFirstVisitPopup(): void {
    if (this.mailingList.hasSeenPopup()) return;
    setTimeout(() => {
      // Re-check in case the visitor signed up via the checkout flow
      // during the delay window.
      if (!this.mailingList.hasSeenPopup()) {
        this.mailingList.open();
      }
    }, FIRST_VISIT_POPUP_DELAY_MS);
  }
}
