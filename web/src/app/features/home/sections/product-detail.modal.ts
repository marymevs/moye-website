import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  input,
  output,
} from '@angular/core';
import { Product } from '../../../core/types/product';

@Component({
  selector: 'app-product-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <div class="backdrop" (click)="close.emit()">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <button class="close" type="button" (click)="close.emit()" aria-label="Close">×</button>
          <div class="cover">
            <img [src]="p.coverUrl" [alt]="p.title" />
          </div>
          <div class="body">
            <h3>{{ p.title }}</h3>
            <p class="long-bio">{{ p.longBio }}</p>
            <div class="price-row">
              <span class="price">\${{ formatPrice(p.priceCents) }}</span>
              @if (p.stock === 0) {
                <span class="status">sold out</span>
              } @else if (p.stock <= 5) {
                <span class="status">{{ p.stock }} left</span>
              }
            </div>
            <button
              class="add"
              type="button"
              [disabled]="p.stock === 0"
              (click)="add.emit(p)"
            >
              {{ p.stock === 0 ? 'sold out' : 'add to cart' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(17, 17, 17, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 100;
    }
    .modal {
      position: relative;
      background: var(--color-bg);
      border-radius: 6px;
      max-width: 32rem;
      width: 100%;
      max-height: calc(100vh - 2rem);
      overflow: auto;
      box-shadow: 0 16px 48px rgba(17, 17, 17, 0.24);
    }
    .close {
      position: absolute;
      top: 0.5rem;
      right: 0.75rem;
      background: transparent;
      border: 0;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--color-ink);
      padding: 0.25rem 0.5rem;
      z-index: 1;
    }
    .cover {
      aspect-ratio: 1;
      background: var(--color-border);
      overflow: hidden;
    }
    .cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .long-bio {
      margin: 0;
      color: var(--color-muted);
      line-height: 1.5;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }
    .price {
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--color-ink);
    }
    .status {
      font-size: var(--text-small);
      color: var(--color-muted);
    }
    .add {
      background: var(--color-ink);
      color: var(--color-bg);
      border: 0;
      padding: 0.875rem 1.25rem;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 4px;
      font-family: inherit;
      letter-spacing: 0.01em;
    }
    .add[disabled] {
      background: var(--color-border);
      color: var(--color-muted);
    }
  `],
})
export class ProductDetailModalComponent {
  readonly product = input<Product | null>(null);
  readonly close = output<void>();
  readonly add = output<Product>();

  protected formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.product()) {
      this.close.emit();
    }
  }
}
