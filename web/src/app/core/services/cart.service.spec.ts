import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartService } from './cart.service';
import { Product } from '../types/product';

const makeProduct = (id: string, overrides: Partial<Product> = {}): Product => ({
  id,
  title: `Product ${id}`,
  shortBio: 'short',
  longBio: 'long',
  priceCents: 1000,
  coverUrl: `https://example.com/${id}.jpg`,
  stock: 10,
  ...overrides,
});

/**
 * Vitest's test environment provides a `localStorage` global but the
 * implementation can be partial (missing methods like .clear()). Install
 * a complete in-memory shim before each test so CartService's persistence
 * code paths have a working API.
 */
function installLocalStorageMock(): void {
  const store = new Map<string, string>();
  const mock: Storage = {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: key => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: index => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  });
}

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
  });

  it('starts empty', () => {
    expect(cart.items()).toEqual([]);
    expect(cart.itemCount()).toBe(0);
    expect(cart.totalCents()).toBe(0);
  });

  it('add(product) inserts a new line item with qty 1', () => {
    cart.add(makeProduct('a'));
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].qty).toBe(1);
    expect(cart.itemCount()).toBe(1);
  });

  it('add(product) twice for the same product increments qty (no duplicate row)', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('a'));
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].qty).toBe(2);
    expect(cart.itemCount()).toBe(2);
  });

  it('add for two different products creates two rows', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('b'));
    expect(cart.items()).toHaveLength(2);
    expect(cart.itemCount()).toBe(2);
  });

  it('itemCount sums qty across all items', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('a'));
    cart.add(makeProduct('b'));
    expect(cart.itemCount()).toBe(3);
  });

  it('totalCents sums priceCents × qty', () => {
    cart.add(makeProduct('a', { priceCents: 1500 }));
    cart.add(makeProduct('a', { priceCents: 1500 }));
    cart.add(makeProduct('b', { priceCents: 500 }));
    expect(cart.totalCents()).toBe(3500);
  });

  it('remove(productId) drops the matching line item entirely', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('a'));
    cart.add(makeProduct('b'));
    cart.remove('a');
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].productId).toBe('b');
  });

  it('clear() empties the cart', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('b'));
    cart.clear();
    expect(cart.items()).toEqual([]);
    expect(cart.itemCount()).toBe(0);
  });

  it('add captures denormalized display fields on the cart item', () => {
    cart.add(makeProduct('a', { title: 'vinyl', priceCents: 3500, coverUrl: 'cover.jpg' }));
    expect(cart.items()[0]).toMatchObject({
      productId: 'a',
      title: 'vinyl',
      priceCents: 3500,
      coverUrl: 'cover.jpg',
      qty: 1,
    });
  });

  it('incrementQty bumps the qty for an existing line', () => {
    cart.add(makeProduct('a'));
    cart.incrementQty('a');
    expect(cart.items()[0].qty).toBe(2);
    expect(cart.itemCount()).toBe(2);
  });

  it('incrementQty is a no-op when the product isn\'t in the cart', () => {
    cart.add(makeProduct('a'));
    cart.incrementQty('does-not-exist');
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].qty).toBe(1);
  });

  it('decrementQty drops the qty by 1', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('a'));
    cart.add(makeProduct('a'));
    cart.decrementQty('a');
    expect(cart.items()[0].qty).toBe(2);
  });

  it('decrementQty removes the line entirely when qty reaches 0', () => {
    cart.add(makeProduct('a'));
    cart.add(makeProduct('b'));
    cart.decrementQty('a');
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].productId).toBe('b');
  });

  it('decrementQty is a no-op when the product isn\'t in the cart', () => {
    cart.add(makeProduct('a'));
    cart.decrementQty('does-not-exist');
    expect(cart.items()).toHaveLength(1);
  });
});

describe('CartService persistence', () => {
  beforeEach(() => {
    installLocalStorageMock();
    TestBed.resetTestingModule();
  });

  it('persists items to localStorage on every change', () => {
    TestBed.configureTestingModule({});
    const cart = TestBed.inject(CartService);
    cart.add(makeProduct('a'));
    TestBed.flushEffects();
    const raw = localStorage.getItem('moye:cart');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].productId).toBe('a');
  });

  it('hydrates items from localStorage on construction', () => {
    localStorage.setItem(
      'moye:cart',
      JSON.stringify([
        { productId: 'a', title: 'vinyl', priceCents: 3500, coverUrl: 'cover.jpg', qty: 2 },
      ])
    );
    TestBed.configureTestingModule({});
    const cart = TestBed.inject(CartService);
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].qty).toBe(2);
    expect(cart.itemCount()).toBe(2);
  });

  it('ignores corrupt localStorage and starts empty', () => {
    localStorage.setItem('moye:cart', 'not-json{{{');
    TestBed.configureTestingModule({});
    const cart = TestBed.inject(CartService);
    expect(cart.items()).toEqual([]);
  });

  it('ignores localStorage entries with the wrong shape', () => {
    localStorage.setItem('moye:cart', JSON.stringify([{ foo: 'bar' }, { productId: 1 }]));
    TestBed.configureTestingModule({});
    const cart = TestBed.inject(CartService);
    expect(cart.items()).toEqual([]);
  });
});
