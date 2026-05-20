import {
  Component,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CreditsService } from '../../core/services/credits.service';
import { Credit, Role } from '../../core/types/credit';

@Component({
  selector: 'app-lore-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>.lore</h1>

      @if (credits().length > 0) {
        <ul class="list">
          @for (credit of credits(); track credit.id) {
            <li
              class="row"
              [class.is-active]="hoveredCreditId() === credit.id"
              (mouseenter)="setHovered(credit.id)"
              (mouseleave)="setHovered(null)"
            >
              <a
                class="row-link"
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

        <div class="grid">
          @for (credit of credits(); track credit.id) {
            <div
              class="tile"
              [class.is-active]="hoveredCreditId() === credit.id"
              (mouseenter)="setHovered(credit.id)"
              (mouseleave)="setHovered(null)"
            >
              <img [src]="credit.coverUrl" [alt]="credit.title" />
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .page {
      padding: 4rem 1.5rem;
      max-width: 56rem;
      margin: 0 auto;
    }
    h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      margin: 0 0 3rem;
      letter-spacing: -0.02em;
    }

    /* List */
    .list {
      list-style: none;
      padding: 0;
      margin: 0 0 6rem;
    }
    .row {
      margin-bottom: 1.5rem;
    }
    .row:last-child {
      margin-bottom: 0;
    }
    .row-link {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.25rem;
      text-decoration: none;
      color: var(--color-muted);
      font-size: var(--text-small);
      line-height: 1.5;
      transform-origin: left center;
      transition:
        color 0.15s ease,
        font-weight 0.15s ease,
        transform 0.15s ease;
    }
    .row.is-active .row-link {
      color: var(--color-ink);
      font-weight: 500;
      transform: scale(1.02);
    }
    .date {
      font-variant-numeric: tabular-nums;
    }
    .sep {
      color: var(--color-border);
      padding: 0 0.05rem;
    }
    .note {
      font-style: italic;
    }
    .row-link.is-link:hover .title {
      text-decoration: underline;
    }

    /* One-line layout on wider viewports */
    @media (min-width: 640px) {
      .row-link {
        grid-template-columns: auto 1fr auto;
        column-gap: 6rem;
        row-gap: 0.25rem;
        align-items: baseline;
      }
      .roles {
        justify-self: end;
        text-align: right;
      }
      .note {
        grid-column: 1 / -1;
        text-align: right;
        padding-top: 0.125rem;
      }
    }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.5rem;
    }
    .tile {
      aspect-ratio: 1;
      position: relative;
      transition: transform 0.2s ease;
    }
    .tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 2px;
    }
    .tile.is-active {
      transform: scale(1.15);
      z-index: 1;
    }
  `],
})
export default class LorePage {
  private readonly creditsService = inject(CreditsService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly credits = signal<Credit[]>([]);
  protected readonly hoveredCreditId = signal<string | null>(null);

  constructor() {
    if (this.isBrowser) {
      void this.bootstrap();
    }
  }

  private async bootstrap(): Promise<void> {
    if (this.creditsService.credits().length === 0) {
      await this.creditsService.load();
    }
    if (this.creditsService.credits().length === 0) return;
    try {
      const resolved = await this.creditsService.toCreditsWithImageUrls();
      this.credits.set(resolved);
    } catch (err) {
      console.warn('[Lore] failed to resolve credit covers:', err);
    }
  }

  protected setHovered(id: string | null): void {
    this.hoveredCreditId.set(id);
  }

  protected formatDate(d: Date): string {
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  protected formatRoles(roles: Role[]): string {
    return roles.join(' + ');
  }
}
