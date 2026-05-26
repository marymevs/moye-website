import { Component, ChangeDetectionStrategy } from '@angular/core';

const OPERATOR_NAME = "[moye's legal name or business name]";
const CONTACT_EMAIL = '[email address]';
const SHIP_WINDOW = '[X business days]';
const DEFECT_REPORT_WINDOW = '[X days, e.g. 14]';
const JURISDICTION = '[state / country where moye operates]';
const LAST_UPDATED = 'May 26, 2026';

@Component({
  selector: 'app-terms-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <h1>.terms</h1>
      <p class="updated">Last updated: {{ lastUpdated }}</p>

      <p class="lead">
        These terms cover purchases made through the moye.world storefront. By placing an order,
        you agree to them. Plain language, no legalese.
      </p>

      <h2>Who you're buying from</h2>
      <p>
        The moye.world store is operated by {{ operatorName }} (referred to as "we" or "us"
        below). Questions about an order or these terms can go to {{ contactEmail }}.
      </p>

      <h2>Orders and payment</h2>
      <p>
        When you place an order, you're making an offer to buy the items in your cart. We confirm
        the sale once payment goes through. Payments are handled by Stripe — we never see or store
        your card details.
      </p>
      <p>
        We do our best to keep product descriptions, pricing, and availability accurate, but
        mistakes happen. If something is listed at the wrong price or is no longer available after
        you order, we'll let you know and either correct it with your okay or cancel and fully
        refund that item.
      </p>
      <p>
        We may decline or cancel an order if an item is out of stock, if there's a pricing error,
        or if we suspect fraud. If we cancel an order you've already paid for, you get a full
        refund.
      </p>

      <h2>Shipping</h2>
      <p>We currently ship within the United States only.</p>
      <p>
        <strong>Costs:</strong> Shipping is calculated at checkout based on your order and
        destination, and is paid by you on top of the item price.
      </p>
      <p>
        <strong>Timing:</strong> Orders typically ship within {{ shipWindow }}. Once shipped,
        delivery time depends on the carrier and your location. We'll send tracking info to the
        email on your order. These are estimates, not guarantees — once a package is with the
        carrier, delivery timing is out of our hands.
      </p>
      <p>
        <strong>Address accuracy:</strong> Please double-check your shipping address at checkout.
        We're not responsible for orders delayed or lost because of an incorrect or incomplete
        address. If a package comes back to us as undeliverable, we'll reach out to arrange a
        reshipment (you may need to cover return shipping).
      </p>

      <h2>Returns and refunds</h2>
      <p>All sales are final, except for items that arrive defective or damaged.</p>
      <p>
        Because these are limited-run artist items, we don't accept returns or exchanges for
        change of mind, wrong size ordered, or similar reasons.
      </p>
      <p>
        If your item arrives defective or damaged in transit, email {{ contactEmail }} within
        {{ defectReportWindow }} of delivery with your order number and a photo of the problem.
        We'll make it right — either a replacement (if available) or a full refund, your choice.
        We'll cover return shipping on defective or damaged items if we need the item sent back.
      </p>
      <p>
        Refunds are issued to your original payment method through Stripe and usually take a few
        business days to appear, depending on your bank.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        We provide the store and its products "as is." To the fullest extent allowed by law:
      </p>
      <ul>
        <li>
          We're not liable for indirect, incidental, or consequential damages arising from your
          purchase or use of our products or the site.
        </li>
        <li>Our total liability for any order is limited to the amount you paid for that order.</li>
        <li>
          Nothing in these terms limits liability that can't legally be limited — for example,
          liability for death or personal injury caused by our negligence, or anything else your
          local law won't let us waive.
        </li>
      </ul>
      <p>
        This site and store are also provided without guarantees of uninterrupted or error-free
        operation. Sometimes things go down; we'll fix them as we can.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Everything on moye.world — music, artwork, photos, designs, the moye name and logo —
        belongs to us or our licensors. Buying a physical item doesn't give you any rights to
        reproduce, resell commercially, or redistribute the underlying artwork or music. Enjoy
        what you bought; don't bootleg it.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of {{ jurisdiction }}, without regard to
        conflict-of-law rules. Any dispute relating to your purchase or these terms will be
        handled in the courts located there.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The version posted here at the time you
        place an order is the one that applies to that order. We'll update the "Last updated"
        date whenever we make changes.
      </p>

      <h2>Contact</h2>
      <p>Order questions, problems, or anything else: {{ contactEmail }}.</p>
    </article>
  `,
  styles: [
    `
      .page {
        padding: 2rem 1.5rem 6rem;
        max-width: 44rem;
        margin: 0 auto;
        color: var(--color-ink);
        font-size: var(--text-small);
        line-height: 1.65;
      }
      h1 {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        margin: 0 0 0.5rem -0.25em;
        letter-spacing: -0.02em;
      }
      .updated {
        color: var(--color-muted);
        margin: 0 0 2.5rem;
      }
      .lead {
        margin: 0 0 2.5rem;
      }
      h2 {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 2.5rem 0 0.75rem;
        letter-spacing: -0.005em;
      }
      h3 {
        font-size: var(--text-small);
        font-weight: 600;
        margin: 1.25rem 0 0.5rem;
      }
      p {
        margin: 0 0 1rem;
      }
      ul {
        margin: 0 0 1rem;
        padding-left: 1.25rem;
      }
      li {
        margin-bottom: 0.35rem;
      }
      li:last-child {
        margin-bottom: 0;
      }
      a {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      a:hover {
        color: var(--color-muted);
      }
    `,
  ],
})
export default class TermsPage {
  protected readonly operatorName = OPERATOR_NAME;
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly shipWindow = SHIP_WINDOW;
  protected readonly defectReportWindow = DEFECT_REPORT_WINDOW;
  protected readonly jurisdiction = JURISDICTION;
  protected readonly lastUpdated = LAST_UPDATED;
}
