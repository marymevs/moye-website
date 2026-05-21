import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MailingListService } from '../../core/services/mailing-list.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <button
        class="link"
        type="button"
        (click)="mailingList.open()"
      >join the list</button>
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
  protected readonly year = new Date().getFullYear();
}
