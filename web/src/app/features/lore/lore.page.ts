import {
  Component,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CreditsService } from '../../core/services/credits.service';
import { Role } from '../../core/types/credit';

@Component({
  selector: 'app-lore-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>.lore</h1>
      <p class="lead">credits, productions, and collaborations.</p>

      @if (credits().length > 0) {
        <ul class="list">
          @for (credit of credits(); track credit.id) {
            <li>
              <a
                class="row"
                [class.is-link]="!!credit.streamingLink"
                [attr.href]="credit.streamingLink ?? null"
                [attr.target]="credit.streamingLink ? '_blank' : null"
                [attr.rel]="credit.streamingLink ? 'noopener' : null"
              >
                <span class="date">{{ formatDate(credit.releasedAt) }}</span>
                <span class="head">
                  <span class="artist">{{ credit.artist }}</span>
                  <span class="sep"> — </span>
                  <span class="title">{{ credit.title }}</span>
                </span>
                <span class="roles">{{ formatRoles(credit.roles) }}</span>
                @if (credit.contributionNote; as note) {
                  <span class="note">{{ note }}</span>
                }
              </a>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [`
    .page { padding: 4rem 1.5rem; max-width: 56rem; margin: 0 auto; }
    h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); margin: 0 0 1rem; letter-spacing: -0.02em; }
    .lead { color: var(--color-muted); font-size: 1.125rem; margin: 0 0 3rem; }

    .list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .list li {
      border-bottom: 1px solid var(--color-border);
    }
    .list li:last-child {
      border-bottom: 0;
    }
    .row {
      display: block;
      padding: 1.5rem 0;
      text-decoration: none;
      color: inherit;
    }
    .date {
      display: block;
      font-size: var(--text-small);
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
      margin-bottom: 0.375rem;
    }
    .head {
      display: block;
      font-size: 1.125rem;
      font-weight: 500;
      margin-bottom: 0.375rem;
    }
    .artist { color: var(--color-muted); }
    .sep { color: var(--color-border); padding: 0 0.125rem; }
    .title { color: var(--color-ink); }
    .roles {
      display: block;
      font-size: var(--text-small);
      color: var(--color-muted);
    }
    .note {
      display: block;
      font-size: var(--text-small);
      color: var(--color-muted);
      font-style: italic;
      margin-top: 0.125rem;
    }
    .row.is-link:hover .title { text-decoration: underline; }
  `],
})
export default class LorePage {
  private readonly creditsService = inject(CreditsService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly credits = this.creditsService.credits;

  constructor() {
    if (this.isBrowser && this.credits().length === 0) {
      void this.creditsService.load();
    }
  }

  protected formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  protected formatRoles(roles: Role[]): string {
    return roles.join(' + ');
  }
}
