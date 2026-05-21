import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MailingListService } from '../../core/services/mailing-list.service';
import { ContactService } from '../../core/services/contact.service';

/**
 * Social URLs. Swap the handles for moye's real accounts. Set a
 * value to null to hide that icon entirely (e.g. if moye doesn't
 * have a SoundCloud presence, set SOCIALS.soundcloud = null).
 */
const SOCIALS = {
  instagram: 'https://www.instagram.com/moye_p/',
  threads: 'https://www.threads.com/@moye_p',
  soundcloud: 'https://soundcloud.com/moye_p',
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
        @if (socials.threads) {
          <a [href]="socials.threads" target="_blank" rel="noopener" aria-label="Threads">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M19 7.5c-1.333 -2.333 -3.333 -3.5 -6 -3.5c-4 0 -7 2.667 -7 8s3 8 7 8c3.5 0 5.5 -1.5 6 -4.5" />
              <path d="M15.5 9.5c-1.667 0 -3 1.333 -3 3v.5c0 1.667 1 3 3 3c2 0 3 -1 3 -3c0 -1.5 -1 -3 -3 -3z" />
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
