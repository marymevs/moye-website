import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MailingListService } from '../../core/services/mailing-list.service';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="links">
        <button class="link" type="button" (click)="mailingList.open()">
          join the list
        </button>
        <button class="link" type="button" (click)="contact.open()">
          contact
        </button>
      </div>
      <small class="copyright">&copy; {{ year }} moye</small>
    </footer>
  `,
  styles: [`
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
    .copyright {
      font-size: var(--text-small);
    }
  `],
})
export class FooterComponent {
  protected readonly mailingList = inject(MailingListService);
  protected readonly contact = inject(ContactService);
  protected readonly year = new Date().getFullYear();
}
