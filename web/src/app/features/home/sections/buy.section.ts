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
              (click)="openModal(product)"
              [attr.aria-label]="'View ' + product.title"
            >
              <div class="square-box">
                <img [src]="product.coverUrl" [alt]="product.title" />
                <div class="overlay" [class.overlay--sold]="product.stock === 0">
                  <span class="short-bio">{{ product.shortBio }}</span>
                  <span class="price">
                    @if (product.stock === 0) {
                      sold out
                    } @else {
                      \${{ formatPrice(product.priceCents) }}
                    }
                  </span>
                </div>
              </div>
              <span class="title">{{ product.title }}</span>
            </button>
          }
        </div>
      </section>
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
      gap: 1.5rem;
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
    .tile .square-box {
      position: relative;
      width: 100%;
    }
    .tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0.75rem;
      gap: 0.25rem;
      background: linear-gradient(
        to top,
        rgba(17, 17, 17, 0.7) 0%,
        rgba(17, 17, 17, 0.3) 40%,
        rgba(17, 17, 17, 0) 70%
      );
      color: #fafaf7;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .tile:hover .overlay,
    .tile:focus-visible .overlay {
      opacity: 1;
    }
    .overlay--sold {
      opacity: 1;
      background: linear-gradient(
        to top,
        rgba(17, 17, 17, 0.85) 0%,
        rgba(17, 17, 17, 0.55) 50%,
        rgba(17, 17, 17, 0.25) 100%
      );
    }
    .short-bio {
      font-size: var(--text-small);
    }
    .price {
      font-size: 1rem;
      font-weight: 500;
    }
    .title {
      font-size: var(--text-small);
      font-weight: 500;
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
}
