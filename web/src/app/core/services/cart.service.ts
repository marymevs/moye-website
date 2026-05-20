import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../types/product';

export interface CartItem {
  productId: string;
  title: string;
  priceCents: number;
  coverUrl?: string;
  qty: number;
}

const STORAGE_KEY = 'moye:cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly items = signal<CartItem[]>(this.hydrate());

  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.qty, 0)
  );

  readonly totalCents = computed(() =>
    this.items().reduce((sum, item) => sum + item.priceCents * item.qty, 0)
  );

  constructor() {
    // Persist on every items() change (browser only).
    effect(() => {
      const current = this.items();
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch {
        // Quota or private mode — non-fatal, cart still works in memory.
      }
    });
  }

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

  incrementQty(productId: string): void {
    const current = this.items();
    const idx = current.findIndex(i => i.productId === productId);
    if (idx < 0) return;
    const next = [...current];
    next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    this.items.set(next);
  }

  decrementQty(productId: string): void {
    const current = this.items();
    const idx = current.findIndex(i => i.productId === productId);
    if (idx < 0) return;
    const currentQty = current[idx].qty;
    if (currentQty <= 1) {
      this.items.set(current.filter(i => i.productId !== productId));
      return;
    }
    const next = [...current];
    next[idx] = { ...next[idx], qty: currentQty - 1 };
    this.items.set(next);
  }

  remove(productId: string): void {
    this.items.set(this.items().filter(i => i.productId !== productId));
  }

  clear(): void {
    this.items.set([]);
  }

  private hydrate(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Light validation: keep only entries that look like CartItems.
      return parsed.filter(
        (i): i is CartItem =>
          i &&
          typeof i.productId === 'string' &&
          typeof i.title === 'string' &&
          typeof i.priceCents === 'number' &&
          typeof i.qty === 'number' &&
          i.qty > 0
      );
    } catch {
      return [];
    }
  }
}
