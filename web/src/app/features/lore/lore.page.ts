import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CreditsService } from '../../core/services/credits.service';
import { Credit, Role } from '../../core/types/credit';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface FlyingClone {
  kind: 'cover' | 'credit-text';
  credit: Credit;
  sourceRect: Rect;
  currentRect: Rect;
}

@Component({
  selector: 'app-lore-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>.lore</h1>

      @if (credits().length > 0) {
        <ul #listEl class="list">
          @for (credit of credits(); track credit.id) {
            <li
              class="row"
              [attr.data-credit-id]="credit.id"
              [class.is-active]="hoveredCreditId() === credit.id"
              (mouseenter)="hoverRow(credit, $event)"
              (mouseleave)="leaveHover()"
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

        <div #gridEl class="grid">
          @for (credit of credits(); track credit.id) {
            <div
              class="tile"
              [attr.data-credit-id]="credit.id"
              [class.is-active]="hoveredCreditId() === credit.id"
              (mouseenter)="hoverTile(credit, $event)"
              (mouseleave)="leaveHover()"
            >
              <img [src]="credit.coverUrl" [alt]="credit.title" />
            </div>
          }
        </div>
      }

      @if (flyingClone(); as fc) {
        <div
          class="fly-clone"
          [class.fly-cover]="fc.kind === 'cover'"
          [class.fly-text]="fc.kind === 'credit-text'"
          [style]="cloneStyle()"
        >
          @if (fc.kind === 'cover') {
            <img [src]="fc.credit.coverUrl" [alt]="fc.credit.title" />
          } @else {
            <span class="clone-date">{{ formatDate(fc.credit.releasedAt) }}</span>
            <span class="clone-head">{{ fc.credit.artist }} — {{ fc.credit.title }}</span>
            <span class="clone-roles">{{ formatRoles(fc.credit.roles) }}</span>
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

    /* Flying clone */
    .fly-clone {
      position: fixed;
      left: var(--fly-left);
      top: var(--fly-top);
      width: var(--fly-width);
      height: var(--fly-height);
      pointer-events: none;
      z-index: 100;
      transition:
        left 0.35s cubic-bezier(0.34, 1.10, 0.64, 1),
        top 0.35s cubic-bezier(0.34, 1.10, 0.64, 1),
        width 0.35s cubic-bezier(0.34, 1.10, 0.64, 1),
        height 0.35s cubic-bezier(0.34, 1.10, 0.64, 1);
    }
    .fly-cover {
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(17, 17, 17, 0.12);
    }
    .fly-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .fly-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: var(--text-small);
      color: var(--color-ink);
      gap: 0.25rem;
    }
    .fly-text .clone-date {
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
    }
    .fly-text .clone-head {
      font-weight: 500;
    }
    .fly-text .clone-roles {
      color: var(--color-muted);
    }
  `],
})
export default class LorePage {
  private readonly creditsService = inject(CreditsService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('listEl') private listEl?: ElementRef<HTMLElement>;
  @ViewChild('gridEl') private gridEl?: ElementRef<HTMLElement>;

  protected readonly credits = signal<Credit[]>([]);
  protected readonly hoveredCreditId = signal<string | null>(null);
  protected readonly flyingClone = signal<FlyingClone | null>(null);

  protected readonly cloneStyle = computed<Record<string, string> | null>(() => {
    const c = this.flyingClone();
    if (!c) return null;
    const r = c.currentRect;
    return {
      '--fly-left': `${r.left}px`,
      '--fly-top': `${r.top}px`,
      '--fly-width': `${r.width}px`,
      '--fly-height': `${r.height}px`,
    };
  });

  private clearTimer: ReturnType<typeof setTimeout> | null = null;

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

  protected hoverRow(credit: Credit, event: MouseEvent): void {
    if (!this.isBrowser) return;
    this.cancelClearTimer();
    this.hoveredCreditId.set(credit.id);

    const row = event.currentTarget as HTMLElement;
    const tile = this.gridEl?.nativeElement.querySelector(
      `[data-credit-id="${credit.id}"]`
    ) as HTMLElement | null;
    if (!tile) return;

    const tileRect = tile.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    const scale = 1.2;
    const destWidth = tileRect.width * scale;
    const destHeight = tileRect.height * scale;
    const gap = 12;
    const destTop = rowRect.top - destHeight - gap;
    const destLeft = rowRect.left + rowRect.width / 2 - destWidth / 2;

    this.startFlight(
      'cover',
      credit,
      { left: tileRect.left, top: tileRect.top, width: tileRect.width, height: tileRect.height },
      { left: destLeft, top: destTop, width: destWidth, height: destHeight }
    );
  }

  protected hoverTile(credit: Credit, event: MouseEvent): void {
    if (!this.isBrowser) return;
    this.cancelClearTimer();
    this.hoveredCreditId.set(credit.id);

    const tile = event.currentTarget as HTMLElement;
    const row = this.listEl?.nativeElement.querySelector(
      `[data-credit-id="${credit.id}"]`
    ) as HTMLElement | null;
    if (!row || !this.gridEl || !tile) return;

    const rowRect = row.getBoundingClientRect();
    const gridRect = this.gridEl.nativeElement.getBoundingClientRect();

    const scale = 1.2;
    const destWidth = rowRect.width * scale;
    const destHeight = rowRect.height * scale;
    const gap = 24;
    const destTop = gridRect.top - destHeight - gap;
    const destLeft = gridRect.left + gridRect.width / 2 - destWidth / 2;

    this.startFlight(
      'credit-text',
      credit,
      { left: rowRect.left, top: rowRect.top, width: rowRect.width, height: rowRect.height },
      { left: destLeft, top: destTop, width: destWidth, height: destHeight }
    );
  }

  protected leaveHover(): void {
    this.hoveredCreditId.set(null);

    const current = this.flyingClone();
    if (!current) return;

    // Animate back to source rect
    this.flyingClone.set({
      ...current,
      currentRect: current.sourceRect,
    });

    // Clear element after the return transition completes
    this.cancelClearTimer();
    this.clearTimer = setTimeout(() => {
      this.flyingClone.set(null);
      this.clearTimer = null;
    }, 380);
  }

  private startFlight(
    kind: FlyingClone['kind'],
    credit: Credit,
    sourceRect: Rect,
    destRect: Rect
  ): void {
    // Render clone at source position first
    this.flyingClone.set({ kind, credit, sourceRect, currentRect: sourceRect });

    // Then transition to destination on the next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.flyingClone.update(c => {
          if (!c || c.credit.id !== credit.id) return c;
          return { ...c, currentRect: destRect };
        });
      });
    });
  }

  private cancelClearTimer(): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }
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
