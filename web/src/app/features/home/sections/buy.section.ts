import {
  Component,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/types/product';
import { ProductDetailModalComponent } from './product-detail.modal';

@Component({
  selector: 'app-buy-section',
  imports: [ProductDetailModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products().length > 0) {
      <section class="buy">
        <h2>.buy</h2>
        <div class="grid">
          @for (product of products(); track product.id) {
            <button
              type="button"
              class="tile"
              [class.is-sold-out]="product.stock === 0"
              (click)="openModal(product)"
              (mouseenter)="onHoverStart(product, $event)"
              (mousemove)="onHoverMove($event)"
              (mouseleave)="onHoverEnd()"
              [attr.aria-label]="'View ' + product.title"
            >
              <div class="tile-image">
                <img [src]="product.coverUrl" [alt]="product.title" />
              </div>
              <span class="title">{{ product.title }}</span>
              <span class="price">
                @if (product.stock === 0) {
                  sold out
                } @else {
                  \${{ formatPrice(product.priceCents) }}
                }
              </span>
            </button>
          }
        </div>
      </section>

      @if (hoveredProduct(); as h) {
        <div
          class="cursor-caption"
          [style.left.px]="cursorX() + 20"
          [style.top.px]="cursorY() + 20"
        >
          {{ h.shortBio }}
        </div>
      }

      <app-product-detail-modal
        [product]="selectedProduct()"
        (close)="closeModal()"
        (add)="addToCart($event)"
      />
    }
  `,
  styles: [`
    .buy {
      padding: 2rem 0 3rem;
    }
    h2 {
      margin: 0 0 1.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 2rem;
    }
    .tile {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: transparent;
      border: 0;
      padding: 0;
      text-align: left;
      min-width: 0;
      font-family: inherit;
    }
    .tile-image {
      aspect-ratio: 1;
      width: 100%;
    }
    .tile-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      transition: transform 0.2s ease;
    }
    .tile:hover .tile-image img,
    .tile:focus-visible .tile-image img {
      transform: scale(1.03);
    }
    .tile.is-sold-out .tile-image img {
      opacity: 0.4;
    }
    .title {
      font-size: var(--text-small);
      font-weight: 500;
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 0.25rem;
    }
    .price {
      font-size: var(--text-small);
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
    }
    .tile.is-sold-out .price {
      color: var(--color-border);
    }
    .cursor-caption {
      position: fixed;
      pointer-events: none;
      color: var(--color-ink);
      font-size: var(--text-small);
      font-weight: 500;
      font-style: italic;
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-shadow:
        0 0 6px var(--color-bg),
        0 0 6px var(--color-bg),
        0 0 12px var(--color-bg);
      z-index: 60;
      animation: cursor-caption-in 150ms ease-out;
    }
    @keyframes cursor-caption-in {
      from { opacity: 0; transform: translateY(-2px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class BuySectionComponent {
  private readonly productsService = inject(ProductsService);
  private readonly cart = inject(CartService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly resolved = signal<Product[]>([]);

  protected readonly products = computed(() => this.resolved());
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly hoveredProduct = signal<Product | null>(null);
  protected readonly cursorX = signal(0);
  protected readonly cursorY = signal(0);

  constructor() {
    if (this.isBrowser) {
      void this.bootstrap();
    }
  }

  private async bootstrap(): Promise<void> {
    if (this.productsService.products().length === 0) {
      await this.productsService.load();
    }
    if (this.productsService.products().length === 0) {
      return;
    }
    try {
      const products = await this.productsService.toProductsWithImageUrls();
      this.resolved.set(products);
    } catch (err) {
      console.warn('[Buy] failed to resolve product covers:', err);
    }
  }

  protected formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  protected openModal(product: Product): void {
    this.selectedProduct.set(product);
  }

  protected closeModal(): void {
    this.selectedProduct.set(null);
  }

  protected addToCart(product: Product): void {
    this.cart.add(product);
    this.closeModal();
  }

  protected onHoverStart(product: Product, event: MouseEvent): void {
    this.hoveredProduct.set(product);
    this.cursorX.set(event.clientX);
    this.cursorY.set(event.clientY);
  }

  protected onHoverMove(event: MouseEvent): void {
    this.cursorX.set(event.clientX);
    this.cursorY.set(event.clientY);
  }

  protected onHoverEnd(): void {
    this.hoveredProduct.set(null);
  }
}
