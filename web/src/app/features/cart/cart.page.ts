import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>.cart</h1>
      @if (items().length === 0) {
        <p class="lead">your cart is empty.</p>
      } @else {
        <ul class="items">
          @for (item of items(); track item.productId) {
            <li class="row">
              @if (item.coverUrl) {
                <img class="cover" [src]="item.coverUrl" [alt]="item.title" />
              } @else {
                <div class="cover cover--blank" aria-hidden="true"></div>
              }
              <div class="meta">
                <span class="title">{{ item.title }}</span>
                <span class="qty">qty {{ item.qty }}</span>
              </div>
              <span class="line-price">\${{ formatPrice(item.priceCents * item.qty) }}</span>
              <button class="remove" type="button" (click)="cart.remove(item.productId)">
                remove
              </button>
            </li>
          }
        </ul>
        <div class="total">
          <span>total</span>
          <span class="total-amount">\${{ formatPrice(cart.totalCents()) }}</span>
        </div>
      }
    </section>
  `,
  styles: [`
    .page { padding: 4rem 1.5rem; max-width: 48rem; margin: 0 auto; }
    h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); margin: 0 0 2rem; letter-spacing: -0.02em; }
    .lead { color: var(--color-muted); font-size: 1.125rem; }

    .items {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem;
      display: flex;
      flex-direction: column;
    }
    .row {
      display: grid;
      grid-template-columns: 64px 1fr auto auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--color-border);
    }
    .row:first-child { border-top: 1px solid var(--color-border); }

    .cover, .cover--blank {
      width: 64px;
      height: 64px;
      border-radius: 4px;
      object-fit: cover;
      display: block;
    }
    .cover--blank { background: var(--color-border); }

    .meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }
    .title {
      font-weight: 500;
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .qty {
      font-size: var(--text-small);
      color: var(--color-muted);
    }

    .line-price {
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }

    .remove {
      background: transparent;
      border: 0;
      color: var(--color-muted);
      font-size: var(--text-small);
      padding: 0.25rem 0.5rem;
      font-family: inherit;
    }
    .remove:hover { color: var(--color-ink); }

    .total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 1rem 0;
      font-size: 1.125rem;
      font-weight: 500;
    }
    .total-amount {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export default class CartPage {
  protected readonly cart = inject(CartService);
  protected readonly items = this.cart.items;

  protected formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }
}
