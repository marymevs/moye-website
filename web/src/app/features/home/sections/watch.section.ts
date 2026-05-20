import { Component, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideosService } from '../../../core/services/videos.service';

@Component({
  selector: 'app-watch-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (videos().length > 0) {
      <section class="watch">
        <h2>.watch</h2>
        <ul class="list">
          @for (video of videos(); track video.id) {
            <li>
              <div class="frame">
                <iframe
                  [src]="embedUrl(video.youtubeId)"
                  loading="lazy"
                  allowfullscreen
                  referrerpolicy="strict-origin-when-cross-origin"
                  [title]="video.title"
                ></iframe>
              </div>
              <span class="caption">{{ video.title }}</span>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styles: [`
    .watch {
      padding: 2rem 0 3rem;
    }
    h2 {
      margin: 0 0 1.5rem;
    }
    .list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .list li {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .frame {
      position: relative;
      aspect-ratio: 16 / 9;
      background: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
    }
    .frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
    .caption {
      font-size: var(--text-small);
      color: var(--color-muted);
    }
  `],
})
export class WatchSectionComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly videosService = inject(VideosService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly videos = this.videosService.videos;

  constructor() {
    if (this.isBrowser && this.videos().length === 0) {
      void this.videosService.load();
    }
  }

  protected embedUrl(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}`
    );
  }
}
