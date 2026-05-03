import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tour-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Tour</h1>
      <p class="lead">Upcoming dates and ticket links go here.</p>
    </section>
  `,
  styles: [`
    .page { padding: 4rem 1.5rem; max-width: 64rem; margin: 0 auto; }
    h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 0 0 1rem; letter-spacing: -0.02em; }
    .lead { color: var(--color-muted); font-size: 1.125rem; }
  `],
})
export default class TourPage {}
