import { Injectable, signal } from '@angular/core';

/**
 * Cart state. Phase 5 will extend this with `items`, `total`, `add`,
 * `remove`, `clear`, and localStorage persistence — the `itemCount`
 * signal interface stays stable.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  readonly itemCount = signal(0);
}
