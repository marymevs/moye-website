import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MailingListService } from '../../core/services/mailing-list.service';
import { ContactService } from '../../core/services/contact.service';

/**
 * Social URLs. Swap the handles for moye's real accounts. Set a
 * value to null to hide that icon entirely (e.g. if moye doesn't
 * have a SoundCloud presence, set SOCIALS.soundcloud = null).
 */
const SOCIALS = {
  twitter: 'https://x.com/moye',
  instagram: 'https://www.instagram.com/moye_p/',
  youtube: 'https://youtube.com/@moye',
  soundcloud: 'https://soundcloud.com/moye_p',
  threads: 'https://www.threads.com/@moye_p',
} as const;

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="links">
        <button class="link" type="button" (click)="mailingList.open()">join the list</button>
        <button class="link" type="button" (click)="contact.open()">contact</button>
      </div>
      <div class="socials">
        @if (socials.twitter) {
          <a [href]="socials.twitter" target="_blank" rel="noopener" aria-label="Twitter">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
            </svg>
          </a>
        }
        @if (socials.instagram) {
          <a [href]="socials.instagram" target="_blank" rel="noopener" aria-label="Instagram">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>
        }
        @if (socials.youtube) {
          <a [href]="socials.youtube" target="_blank" rel="noopener" aria-label="YouTube">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
              />
              <polygon
                points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>
        }
        @if (socials.soundcloud) {
          <a [href]="socials.soundcloud" target="_blank" rel="noopener" aria-label="SoundCloud">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M17 18a4.5 4.5 0 1 0 -2.04 -8.48a6 6 0 0 0 -11.13 1.98a4 4 0 0 0 -.83 7.5" />
              <line x1="6" y1="13" x2="6" y2="18" />
              <line x1="9" y1="11" x2="9" y2="18" />
              <line x1="12" y1="10" x2="12" y2="18" />
            </svg>
          </a>
        }
      </div>
      <small class="copyright">&copy; {{ year }} moye</small>
    </footer>
  `,
  styles: [
    `
      .footer {
        padding: 2rem 1.5rem;
        border-top: 1px solid var(--color-border);
        color: var(--color-muted);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .links {
        display: flex;
        gap: 1.5rem;
        align-items: center;
      }
      .link {
        background: transparent;
        border: 0;
        padding: 0;
        font-family: inherit;
        font-size: var(--text-small);
        color: var(--color-muted);
      }
      .link:hover {
        color: var(--color-ink);
      }
      .socials {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .socials a {
        color: var(--color-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
      .socials a:hover {
        color: var(--color-ink);
      }
      .socials svg {
        width: 18px;
        height: 18px;
        display: block;
      }
      .copyright {
        font-size: var(--text-small);
      }
    `,
  ],
})
export class FooterComponent {
  protected readonly mailingList = inject(MailingListService);
  protected readonly contact = inject(ContactService);
  protected readonly socials = SOCIALS;
  protected readonly year = new Date().getFullYear();
}
