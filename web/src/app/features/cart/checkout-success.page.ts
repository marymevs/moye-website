import { Component, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
  selector: 'app-checkout-success-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>thanks.</h1>
      <p class="lead">your order is on its way. a confirmation will land in your inbox shortly.</p>
      <p class="links">
        <a routerLink="/">back to .world</a>
      </p>
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
        margin: 0 0 1rem;
        letter-spacing: -0.02em;
      }
      .lead {
        color: var(--color-muted);
        font-size: 1.125rem;
        margin: 0 0 2rem;
      }
      .links a {
        color: var(--color-ink);
      }
    `,
  ],
})
export default class CheckoutSuccessPage {
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) return;

    // Order is complete — clear the cart so they don't see lingering items.
    this.cart.clear();

    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      this.checkout.sendOrderConfirmation(sessionId).catch((err) => {
        console.warn('[CheckoutSuccess] confirmation email failed:', err);
      });
    }
  }
}
