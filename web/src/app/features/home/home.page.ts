import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>moye</h1>
      <p class="lead">hub for moye's solo, collaborative, and engineering work.</p>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 4rem 1.5rem;
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
