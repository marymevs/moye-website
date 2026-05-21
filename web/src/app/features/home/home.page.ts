import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BuySectionComponent } from './sections/buy.section';
import { ListenSectionComponent } from './sections/listen.section';
import { WatchSectionComponent } from './sections/watch.section';

@Component({
  selector: 'app-home-page',
  imports: [BuySectionComponent, ListenSectionComponent, WatchSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>moye</h1>
      <p class="lead">reified thoughts.</p>
      <app-buy-section />
      <app-listen-section />
      <app-watch-section />
    </section>
  `,
  styles: [
    `
      .page {
        padding: 2rem 0.5rem;
        max-width: 64rem;
        margin: 0 auto;
      }
      h1 {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        margin: 0 0 1rem;
        letter-spacing: -0.02em;
      }
      .lead {
        color: var(--color-muted);
        font-size: 1.125rem;
      }
    `,
  ],
})
export default class HomePage {}
