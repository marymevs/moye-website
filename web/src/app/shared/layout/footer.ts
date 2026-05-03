import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <small>&copy; {{ year }} Moye</small>
    </footer>
  `,
  styles: [`
    .footer {
      padding: 2rem 1.5rem;
      border-top: 1px solid var(--color-border);
      color: var(--color-muted);
      text-align: center;
    }
  `],
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
