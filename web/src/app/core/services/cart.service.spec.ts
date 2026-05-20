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

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
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
});
