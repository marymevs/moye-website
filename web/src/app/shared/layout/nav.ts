import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../core/constants/app-routes';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="nav">
      <a class="nav__brand" routerLink="/">Moye</a>
      <ul class="nav__list">
        @for (item of items; track item.key) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.key === 'home' }"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .nav__brand {
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: 0.02em;
      text-decoration: none;
      color: var(--color-ink);
    }
    .nav__list {
      display: flex;
      gap: 1.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nav__list a {
      color: var(--color-muted);
      text-decoration: none;
      font-size: 0.95rem;
    }
    .nav__list a.is-active {
      color: var(--color-ink);
    }
  `],
})
export class NavComponent {
  protected readonly items = NAV_ITEMS;
}
