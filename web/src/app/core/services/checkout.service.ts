import { Injectable, inject } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { FIREBASE_FUNCTIONS } from '../firebase.providers';

export interface CheckoutInput {
  items: { productId: string; qty: number }[];
  customerName: string;
  customerEmail: string;
  newsletterOptIn: boolean;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
}

/**
 * Calls the `createCheckoutSession` Cloud Function via Firebase
 * Functions SDK. Returns the Stripe-hosted checkout URL — caller
 * is responsible for redirecting the browser.
 *
 * Errors propagate as Firebase callable errors with `.code` and
 * `.message` fields. The cart page surfaces these to the user.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly functions = inject(FIREBASE_FUNCTIONS);
  private readonly callable = httpsCallable<CheckoutInput, CheckoutResult>(
    this.functions,
    'createCheckoutSession'
  );
  private readonly sendConfirmationCallable = httpsCallable<
    { sessionId: string },
    { ok: boolean; alreadySent?: boolean }
  >(this.functions, 'sendOrderConfirmationEmail');

  async startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const result = await this.callable(input);
    return result.data;
  }

  async sendOrderConfirmation(sessionId: string): Promise<void> {
    await this.sendConfirmationCallable({ sessionId });
  }
}
