import { Component, ChangeDetectionStrategy } from '@angular/core';

const OPERATOR_NAME = "[moye's legal name or business name]";
const CONTACT_EMAIL = '[email address for privacy requests]';
const JURISDICTION = '[state / country where moye operates]';
const LAST_UPDATED = 'May 26, 2026';

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <h1>.privacy</h1>
      <p class="updated">Last updated: {{ lastUpdated }}</p>

      <p class="lead">
        This policy explains what information moye.world collects, how it's used, and the choices
        you have. Plain language, no legalese.
      </p>

      <h2>Who runs this site</h2>
      <p>
        moye.world is operated by {{ operatorName }} (referred to as "we" or "us" below). For any
        privacy-related questions or requests, email {{ contactEmail }}.
      </p>

      <h2>What we collect</h2>
      <p>We only collect what we need to run the site and serve you. Here's the full list:</p>

      <h3>Mailing list signup</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>City (optional)</li>
      </ul>

      <h3>Contact form</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Subject and message body</li>
      </ul>

      <h3>Store checkout (handled by Stripe)</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Shipping address</li>
        <li>
          Payment information (card details go directly to Stripe — we never see or store them)
        </li>
      </ul>

      <h3>Analytics (Firebase Analytics)</h3>
      <ul>
        <li>Page views</li>
        <li>General device info (browser, operating system)</li>
        <li>Approximate region (country or city level, based on IP)</li>
      </ul>

      <p>
        We do not collect precise location, we do not track you across other websites, and we do
        not buy data about you from third parties.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>
          <strong>Newsletters:</strong> If you sign up for the mailing list, we email you updates
          about new music, shows, and releases. We don't share your email with marketing partners.
          Ever.
        </li>
        <li>
          <strong>Order fulfillment:</strong> If you buy something, we use your name and shipping
          address to send it to you, and your email to confirm the order and share tracking info.
        </li>
        <li>
          <strong>Contact replies:</strong> If you send a message through the contact form, we use
          your email to reply.
        </li>
        <li>
          <strong>Aggregate analytics:</strong> We look at general traffic patterns (which pages
          people visit, what regions visitors come from) to understand what's resonating and
          improve the site. This is reviewed in aggregate, not tied to individuals.
        </li>
      </ul>

      <h2>Where your information is stored</h2>
      <ul>
        <li>
          <strong>Google Firebase</strong> (Firestore and Storage) holds mailing list entries,
          contact form submissions, and analytics data.
        </li>
        <li>
          <strong>Stripe</strong> handles all payment processing and stores your payment details on
          its own systems. We only receive a confirmation that the payment succeeded, along with
          the shipping info needed to send your order.
        </li>
      </ul>
      <p>
        Both Google and Stripe are major service providers with their own security and privacy
        practices. You can read theirs at
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener"
          >policies.google.com/privacy</a
        >
        and
        <a href="https://stripe.com/privacy" target="_blank" rel="noopener">stripe.com/privacy</a>.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your information until you ask us to delete it. There's no automatic expiration.
        If you want your data removed, email {{ contactEmail }} and we'll take care of it.
      </p>

      <h2>Your choices</h2>
      <p>You can, at any time:</p>
      <ul>
        <li>Unsubscribe from the mailing list using the link at the bottom of any newsletter.</li>
        <li>Request a copy of the information we have about you.</li>
        <li>Request deletion of your information from our systems.</li>
        <li>Correct anything that's wrong.</li>
      </ul>
      <p>
        For any of these, email {{ contactEmail }}. We'll respond within a reasonable timeframe —
        usually within a few days.
      </p>
      <p>
        Note that if you've placed an order, we may need to retain some transaction records (held
        by Stripe) to comply with tax and accounting requirements, even after deleting your
        information from our own systems.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        Firebase Analytics uses cookies and similar technologies to count visits and understand
        general usage. You can block cookies in your browser settings if you prefer. The site will
        still work.
      </p>

      <h2>Children</h2>
      <p>
        This site isn't directed at children under 13, and we don't knowingly collect information
        from them. If you believe a child has submitted information, email us and we'll delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we update this policy, we'll post the new version here and update the "Last updated"
        date at the top. For significant changes, mailing list subscribers will get a heads-up by
        email.
      </p>

      <h2>Jurisdiction</h2>
      <p>
        This site is operated from {{ jurisdiction }}, and any disputes related to this policy are
        governed by the laws there. If you're visiting from elsewhere (the EU, UK, California,
        etc.), you may have additional rights under your local privacy laws — email us and we'll
        honor them.
      </p>

      <h2>Contact</h2>
      <p>Questions, requests, or anything else privacy-related: {{ contactEmail }}.</p>
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
export default class PrivacyPage {
  protected readonly operatorName = OPERATOR_NAME;
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly jurisdiction = JURISDICTION;
  protected readonly lastUpdated = LAST_UPDATED;
}
