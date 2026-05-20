import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-lore-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>.lore</h1>
      <p class="lead">credits, productions, and collaborations.</p>
    </section>
  `,
  styles: [`
    .page { padding: 4rem 1.5rem; max-width: 64rem; margin: 0 auto; }
    h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); margin: 0 0 1rem; letter-spacing: -0.02em; }
    .lead { color: var(--color-muted); font-size: 1.125rem; }
  `],
})
export default class LorePage {}
