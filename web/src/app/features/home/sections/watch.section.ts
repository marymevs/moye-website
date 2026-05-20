import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Video {
  youtubeId: string;
  title: string;
}

@Component({
  selector: 'app-watch-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (videos.length > 0) {
      <section class="watch">
        <h2>.watch</h2>
        <ul class="list">
          @for (video of videos; track video.youtubeId) {
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

  protected readonly videos: ReadonlyArray<Video> = [
    { youtubeId: 'B20gNyiF9JA', title: 'nocturnal (video)' },
    { youtubeId: 'o5hw1BVWmco', title: 'necropolis' },
    { youtubeId: 'fXsuuzuxWtc', title: 'eternal' },
    { youtubeId: 'QQlBYFvFito', title: 'pandæmonium' },
    { youtubeId: 'ZQw0bQfSGe8', title: 'fleshy machinery' },
    { youtubeId: '4DAs4sgscnk', title: 'nocturnal (visualizer)' },
    { youtubeId: 'trWWHcViWNc', title: 'allure and pain' },
    { youtubeId: 'UwgFCLHQpm8', title: 'black narcissus' },
    { youtubeId: 'I9PfoW-Ea9Q', title: 'phantom bride' },
    { youtubeId: 'B4K-xLACcrw', title: 'black orpheus' },
    { youtubeId: 'JKMYzc781Uk', title: 'Vertigo (COVER)' },
  ];

  protected embedUrl(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}`
    );
  }
}
