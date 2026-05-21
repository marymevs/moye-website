import { Component, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { logEvent } from 'firebase/analytics';
import { NavComponent } from './shared/layout/nav';
import { FooterComponent } from './shared/layout/footer';
import { AudioPlayerComponent } from './shared/layout/audio-player';
import { MailingListModalComponent } from './shared/mailing-list-modal';
import { ContactModalComponent } from './shared/contact-modal';
import { AudioPlayerService } from './core/services/audio-player.service';
import { TracksService } from './core/services/tracks.service';
import { MailingListService } from './core/services/mailing-list.service';
import { FIREBASE_ANALYTICS } from './core/firebase.providers';

const FIRST_VISIT_POPUP_DELAY_MS = 10_000;

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavComponent,
    FooterComponent,
    AudioPlayerComponent,
    MailingListModalComponent,
    ContactModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly tracksService = inject(TracksService);
  private readonly audioPlayer = inject(AudioPlayerService);
  private readonly mailingList = inject(MailingListService);
  private readonly router = inject(Router);
  private readonly analytics = inject(FIREBASE_ANALYTICS);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      void this.bootstrapPlayer();
      this.scheduleFirstVisitPopup();
      this.wirePageViewLogging();
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

  /**
   * Manual page_view logging. Angular is a SPA — the browser only
   * fires its native page-view event on first load. Subsequent
   * route changes happen via history.pushState and Firebase's
   * automatic page_view tracking has inconsistent SPA coverage,
   * so we emit explicit events on every NavigationEnd.
   *
   * Subscription leaks gracefully — App lives for the entire app
   * lifetime, no cleanup needed.
   */
  private wirePageViewLogging(): void {
    const analytics = this.analytics;
    if (!analytics) return;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => {
        logEvent(analytics, 'page_view', {
          page_path: event.urlAfterRedirects,
          page_title: document.title,
        });
      });
  }
}
