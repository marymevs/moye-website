import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../types/product';

export interface CartItem {
  productId: string;
  title: string;
  priceCents: number;
  coverUrl?: string;
  qty: number;
}

/**
 * Cart state. Persistence (localStorage) is deferred to Phase 5.
 * The Track-level checkout flow (Stripe test mode) also lives there.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);

  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.qty, 0)
  );

  readonly totalCents = computed(() =>
    this.items().reduce((sum, item) => sum + item.priceCents * item.qty, 0)
  );

  add(product: Product): void {
    const current = this.items();
    const idx = current.findIndex(i => i.productId === product.id);
    if (idx >= 0) {
      const next = [...current];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      this.items.set(next);
      return;
    }
    this.items.set([
      ...current,
      {
        productId: product.id,
        title: product.title,
        priceCents: product.priceCents,
        coverUrl: product.coverUrl,
        qty: 1,
      },
    ]);
  }

  remove(productId: string): void {
    this.items.set(this.items().filter(i => i.productId !== productId));
  }

  clear(): void {
    this.items.set([]);
  }
}
