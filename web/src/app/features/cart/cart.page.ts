import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
  selector: 'app-cart-page',
  imports: [FormsModule],
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
                <div class="qty-stepper">
                  <button
                    class="step"
                    type="button"
                    [attr.aria-label]="
                      item.qty === 1 ? 'remove ' + item.title : 'decrease quantity of ' + item.title
                    "
                    (click)="cart.decrementQty(item.productId)"
                  >
                    −
                  </button>
                  <span class="qty-value">{{ item.qty }}</span>
                  <button
                    class="step"
                    type="button"
                    [attr.aria-label]="'increase quantity of ' + item.title"
                    (click)="cart.incrementQty(item.productId)"
                  >
                    +
                  </button>
                </div>
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

        <form class="form" (submit)="onCheckout($event)">
          <label class="field">
            <span class="field-label">name</span>
            <input
              type="text"
              autocomplete="name"
              required
              [ngModel]="customerName()"
              (ngModelChange)="customerName.set($event)"
              name="customerName"
            />
          </label>
          <label class="field">
            <span class="field-label">email</span>
            <input
              type="email"
              autocomplete="email"
              required
              [ngModel]="customerEmail()"
              (ngModelChange)="customerEmail.set($event)"
              name="customerEmail"
            />
          </label>
          <label class="checkbox">
            <input
              type="checkbox"
              [ngModel]="newsletterOptIn()"
              (ngModelChange)="newsletterOptIn.set($event)"
              name="newsletterOptIn"
            />
            <span>add me to the mailing list</span>
          </label>

          @if (checkoutError(); as err) {
            <p class="error">{{ err }}</p>
          }

          <button type="submit" class="checkout" [disabled]="!canCheckout() || isCheckingOut()">
            @if (isCheckingOut()) {
              redirecting…
            } @else {
              checkout
            }
          </button>
        </form>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 2rem 0.5rem;
        max-width: 64rem;
        margin: 0 auto;
      }
      h1 {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        margin: 0 0 1rem -0.25em;
        letter-spacing: -0.02em;
      }
      .lead {
        color: var(--color-muted);
        font-size: 1.125rem;
      }
      .items,
      .total,
      .form {
        max-width: 48rem;
      }

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
      .row:first-child {
        border-top: 1px solid var(--color-border);
      }

      .cover,
      .cover--blank {
        width: 64px;
        height: 64px;
        border-radius: 4px;
        object-fit: cover;
        display: block;
      }
      .cover--blank {
        background: var(--color-border);
      }

      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 0;
      }
      .title {
        font-weight: 500;
        color: var(--color-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .qty-stepper {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-small);
        color: var(--color-muted);
      }
      .step {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-ink);
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 4px;
        padding: 0;
        font-family: inherit;
        font-size: var(--text-body);
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .step:hover {
        border-color: var(--color-ink);
      }
      .qty-value {
        font-variant-numeric: tabular-nums;
        min-width: 1.5em;
        text-align: center;
        color: var(--color-ink);
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
      .remove:hover {
        color: var(--color-ink);
      }

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

      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }
      .field-label {
        font-size: var(--text-small);
        color: var(--color-muted);
      }
      .field input {
        font-family: inherit;
        font-size: var(--text-body);
        color: var(--color-ink);
        background: transparent;
        border: 0;
        border-bottom: 1px solid var(--color-border);
        padding: 0.5rem 0;
        outline: none;
      }
      .field input:focus {
        border-bottom-color: var(--color-ink);
      }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-small);
        color: var(--color-muted);
      }
      .checkbox input {
        accent-color: var(--color-ink);
      }

      .error {
        font-size: var(--text-small);
        color: #b04a4a;
        margin: 0;
      }

      .checkout {
        align-self: flex-start;
        background: var(--color-ink);
        color: var(--color-bg);
        border: 0;
        padding: 0.75rem 1.5rem;
        font-family: inherit;
        font-size: var(--text-body);
        font-weight: 500;
        border-radius: 4px;
        margin-top: 0.5rem;
      }
      .checkout:disabled {
        opacity: 0.4;
      }
    `,
  ],
})
export default class CartPage {
  protected readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);

  protected readonly items = this.cart.items;

  protected readonly customerName = signal('');
  protected readonly customerEmail = signal('');
  protected readonly newsletterOptIn = signal(false);
  protected readonly isCheckingOut = signal(false);
  protected readonly checkoutError = signal<string | null>(null);

  protected readonly canCheckout = computed(() => {
    const hasItems = this.items().length > 0;
    const hasName = this.customerName().trim().length > 0;
    const hasEmail = this.isValidEmail(this.customerEmail());
    return hasItems && hasName && hasEmail;
  });

  protected formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  protected async onCheckout(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canCheckout() || this.isCheckingOut()) return;

    this.checkoutError.set(null);
    this.isCheckingOut.set(true);

    try {
      const origin = window.location.origin;
      const result = await this.checkout.startCheckout({
        items: this.items().map((i) => ({ productId: i.productId, qty: i.qty })),
        customerName: this.customerName().trim(),
        customerEmail: this.customerEmail().trim(),
        newsletterOptIn: this.newsletterOptIn(),
        successUrl: `${origin}/cart/success`,
        cancelUrl: `${origin}/cart`,
      });
      window.location.href = result.url;
    } catch (err) {
      console.warn('[Cart] checkout failed:', err);
      this.checkoutError.set(this.errorMessage(err));
      this.isCheckingOut.set(false);
    }
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private errorMessage(err: unknown): string {
    if (
      err &&
      typeof err === 'object' &&
      'message' in err &&
      typeof (err as { message: unknown }).message === 'string'
    ) {
      return (err as { message: string }).message;
    }
    return 'Checkout failed. Try again or contact us.';
  }
}
