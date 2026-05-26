import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { z } from 'zod';

initializeApp();
const db = getFirestore();

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
const resendApiKey = defineSecret('RESEND_API_KEY');

const REGION = 'us-central1';

// Resend requires a verified-domain "from" address before going live.
// Until the moye.world domain is verified, this can stay as Resend's
// onboarding sandbox address (only deliverable to the account owner's email).
const ORDER_FROM_EMAIL = 'moye.world <onboarding@resend.dev>';

const CheckoutInput = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive().max(99),
      })
    )
    .min(1)
    .max(50),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  newsletterOptIn: z.boolean(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

interface ProductDoc {
  title: string;
  priceCents: number;
  stock: number;
}

/**
 * Creates a Stripe Checkout session for the given cart. Prices are
 * fetched server-side from Firestore — the client's view of prices
 * is never trusted. Stock is validated server-side too.
 *
 * Returns `{ url }` — the Stripe-hosted checkout page. Frontend
 * redirects via `window.location.href = url`.
 *
 * Side effects:
 * - Writes a pending order doc to `orders/{sessionId}` for audit.
 * - If `newsletterOptIn` is true, writes to `mailing_list/{email}`.
 */
export const createCheckoutSession = onCall(
  { region: REGION, secrets: [stripeSecretKey] },
  async request => {
    const parsed = CheckoutInput.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', 'Invalid checkout input', parsed.error.flatten());
    }
    const { items, customerName, customerEmail, newsletterOptIn, successUrl, cancelUrl } =
      parsed.data;

    // Fetch product docs in parallel.
    const productSnaps = await Promise.all(
      items.map(it => db.collection('products').doc(it.productId).get())
    );

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: Array<{ productId: string; title: string; priceCents: number; qty: number }> =
      [];

    for (let i = 0; i < items.length; i++) {
      const snap = productSnaps[i];
      if (!snap.exists) {
        throw new HttpsError('not-found', `Product not found: ${items[i].productId}`);
      }
      const data = snap.data() as ProductDoc;
      if (typeof data.priceCents !== 'number' || data.priceCents <= 0) {
        throw new HttpsError('failed-precondition', `Product ${items[i].productId} has no price`);
      }
      if (data.stock < items[i].qty) {
        throw new HttpsError(
          'failed-precondition',
          `Insufficient stock for ${data.title} (have ${data.stock}, requested ${items[i].qty})`
        );
      }
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: data.title },
          unit_amount: data.priceCents,
        },
        quantity: items[i].qty,
      });
      orderItems.push({
        productId: items[i].productId,
        title: data.title,
        priceCents: data.priceCents,
        qty: items[i].qty,
      });
    }

    // Append Stripe's session-id template so the success page knows which
    // order to confirm. Stripe substitutes `{CHECKOUT_SESSION_ID}` before
    // redirecting the buyer.
    const successUrlWithSession =
      successUrl + (successUrl.includes('?') ? '&' : '?') + 'session_id={CHECKOUT_SESSION_ID}';

    const stripe = new Stripe(stripeSecretKey.value());
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrlWithSession,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });

    if (!session.id || !session.url) {
      throw new HttpsError('internal', 'Stripe did not return a session URL');
    }

    // Pending order doc — audit trail for sessions that never complete.
    await db
      .collection('orders')
      .doc(session.id)
      .set({
        status: 'pending',
        items: orderItems,
        customer: { name: customerName, email: customerEmail.toLowerCase() },
        newsletterOptIn,
        createdAt: FieldValue.serverTimestamp(),
      });

    if (newsletterOptIn) {
      await db
        .collection('mailing_list')
        .doc(customerEmail.toLowerCase())
        .set(
          {
            email: customerEmail.toLowerCase(),
            name: customerName,
            source: 'checkout',
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    }

    return { url: session.url };
  }
);

/**
 * Stripe webhook receiver. Verifies signature against the
 * configured signing secret, then handles supported events.
 *
 * Supported events:
 * - `checkout.session.completed` — flips `orders/{sessionId}` from
 *   `pending` to `paid` and records the Stripe customer/payment IDs.
 *
 * Other events are accepted (200 OK) but ignored.
 */
export const stripeWebhook = onRequest(
  { region: REGION, secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    const stripe = new Stripe(stripeSecretKey.value());
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.warn('[stripeWebhook] signature verification failed:', err);
      res.status(400).send('Invalid signature');
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id ?? null;
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : null;

      try {
        await db
          .collection('orders')
          .doc(session.id)
          .set(
            {
              status: 'paid',
              stripeCustomerId: customerId,
              paymentIntentId,
              paidAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
      } catch (err) {
        console.error('[stripeWebhook] failed to update order:', err);
        res.status(500).send('Failed to update order');
        return;
      }
    }

    res.status(200).send('ok');
  }
);

const OrderConfirmationInput = z.object({
  sessionId: z.string().min(1).max(200),
});

interface OrderDoc {
  status?: string;
  items?: Array<{ productId: string; title: string; priceCents: number; qty: number }>;
  customer?: { name?: string; email?: string };
  confirmationEmailSent?: boolean;
}

/**
 * Sends an order-confirmation email via Resend, looking up order
 * details from `orders/{sessionId}`. Marks the order as
 * `confirmationEmailSent` to prevent duplicate sends on page refresh.
 *
 * NOTE: This intentionally does NOT verify that payment succeeded —
 * it sends as long as the order doc exists. See GitHub issue for
 * "Gate order confirmation email on verified payment" — that ticket
 * tracks moving this to the webhook handler (or adding a
 * `status === 'paid'` check) once we've validated the flow end-to-end.
 */
export const sendOrderConfirmationEmail = onCall(
  { region: REGION, secrets: [resendApiKey] },
  async request => {
    const parsed = OrderConfirmationInput.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', 'Invalid input', parsed.error.flatten());
    }
    const { sessionId } = parsed.data;

    const ref = db.collection('orders').doc(sessionId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Order not found');
    }
    const order = snap.data() as OrderDoc;

    if (order.confirmationEmailSent) {
      return { ok: true, alreadySent: true };
    }

    const email = order.customer?.email;
    const name = order.customer?.name ?? 'friend';
    const items = order.items ?? [];
    if (!email || items.length === 0) {
      throw new HttpsError('failed-precondition', 'Order is missing customer or items');
    }

    const totalCents = items.reduce((sum, it) => sum + it.priceCents * it.qty, 0);
    const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
    const itemLines = items
      .map(it => `  - ${it.title} × ${it.qty} — ${formatPrice(it.priceCents * it.qty)}`)
      .join('\n');

    const textBody = [
      `thanks, ${name}.`,
      '',
      `your order is in. here's what you got:`,
      itemLines,
      '',
      `total: ${formatPrice(totalCents)}`,
      '',
      `we'll send tracking info once it ships.`,
      '',
      `— moye`,
    ].join('\n');

    const resend = new Resend(resendApiKey.value());
    try {
      await resend.emails.send({
        from: ORDER_FROM_EMAIL,
        to: email,
        subject: 'your moye.world order',
        text: textBody,
      });
    } catch (err) {
      console.error('[sendOrderConfirmationEmail] resend failed:', err);
      throw new HttpsError('internal', 'Failed to send confirmation email');
    }

    await ref.set(
      {
        confirmationEmailSent: true,
        confirmationEmailSentAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { ok: true };
  }
);

const ContactInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z
    .string()
    .min(1)
    .refine(
      v => v.trim().split(/\s+/).filter(Boolean).length <= 100,
      'body exceeds 100-word limit'
    ),
});

/**
 * Accepts a contact form submission, validates it, writes to
 * `contact_messages`. No email sent (#69 tracks that). Returns
 * `{ ok: true }` on success.
 */
export const submitContact = onCall({ region: REGION }, async request => {
  const parsed = ContactInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid contact input', parsed.error.flatten());
  }
  const { name, email, subject, body } = parsed.data;

  await db.collection('contact_messages').add({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    subject: subject.trim(),
    body: body.trim(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
