import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MailingListService } from '../core/services/mailing-list.service';

@Component({
  selector: 'app-mailing-list-modal',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (service.isOpen()) {
      <div class="backdrop" (click)="close()">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <button class="close" type="button" (click)="close()" aria-label="Close">×</button>

          @if (hasSubmitted()) {
            <div class="thanks">
              <h3>you're in.</h3>
              <p>thanks for joining.</p>
            </div>
          } @else {
            <h3>join the list</h3>
            <p class="lead">news, releases, shows. nothing else.</p>

            <form class="form" (submit)="onSubmit($event)">
              <label class="field">
                <span class="field-label">name</span>
                <input
                  type="text"
                  autocomplete="name"
                  required
                  [ngModel]="name()"
                  (ngModelChange)="name.set($event)"
                  name="name"
                />
              </label>
              <label class="field">
                <span class="field-label">email</span>
                <input
                  type="email"
                  autocomplete="email"
                  required
                  [ngModel]="email()"
                  (ngModelChange)="email.set($event)"
                  name="email"
                />
              </label>
              <label class="field">
                <span class="field-label">city <span class="optional">(optional)</span></span>
                <input
                  type="text"
                  autocomplete="address-level2"
                  [ngModel]="city()"
                  (ngModelChange)="city.set($event)"
                  name="city"
                />
              </label>

              @if (submitError(); as err) {
                <p class="error">{{ err }}</p>
              }

              <button
                type="submit"
                class="submit"
                [disabled]="!canSubmit() || isSubmitting()"
              >
                @if (isSubmitting()) {
                  subscribing…
                } @else {
                  subscribe
                }
              </button>
            </form>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(17, 17, 17, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 100;
    }
    .modal {
      position: relative;
      background: var(--color-bg);
      border-radius: 6px;
      max-width: 28rem;
      width: 100%;
      padding: 2.5rem 2rem 2rem;
      box-shadow: 0 16px 48px rgba(17, 17, 17, 0.24);
    }
    .close {
      position: absolute;
      top: 0.5rem;
      right: 0.75rem;
      background: transparent;
      border: 0;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--color-ink);
      padding: 0.25rem 0.5rem;
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .lead {
      margin: 0 0 1.5rem;
      color: var(--color-muted);
      font-size: var(--text-small);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .field-label {
      font-size: var(--text-small);
      color: var(--color-muted);
    }
    .optional {
      color: var(--color-border);
    }
    .field input {
      font-family: inherit;
      font-size: var(--text-body);
      color: var(--color-ink);
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--color-border);
      padding: 0.5rem 0;
      outline: none;
    }
    .field input:focus {
      border-bottom-color: var(--color-ink);
    }

    .error {
      font-size: var(--text-small);
      color: #b04a4a;
      margin: 0;
    }

    .submit {
      align-self: flex-start;
      background: var(--color-ink);
      color: var(--color-bg);
      border: 0;
      padding: 0.75rem 1.5rem;
      font-family: inherit;
      font-size: var(--text-body);
      font-weight: 500;
      border-radius: 4px;
      margin-top: 0.5rem;
    }
    .submit:disabled {
      opacity: 0.4;
    }

    .thanks h3 {
      margin-bottom: 0.5rem;
    }
    .thanks p {
      margin: 0;
      color: var(--color-muted);
    }
  `],
})
export class MailingListModalComponent {
  protected readonly service = inject(MailingListService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly city = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly hasSubmitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly canSubmit = computed(() => {
    return this.name().trim().length > 0 && this.isValidEmail(this.email());
  });

  protected close(): void {
    this.service.close();
    // Reset form state for the next open (deferred so animation can complete).
    setTimeout(() => {
      this.name.set('');
      this.email.set('');
      this.city.set('');
      this.isSubmitting.set(false);
      this.hasSubmitted.set(false);
      this.submitError.set(null);
    }, 250);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.submitError.set(null);
    try {
      await this.service.subscribe(this.name(), this.email(), this.city());
      this.hasSubmitted.set(true);
      this.isSubmitting.set(false);
      setTimeout(() => this.close(), 2000);
    } catch (err) {
      console.warn('[MailingList] subscribe failed:', err);
      this.submitError.set('couldn\'t subscribe — try again?');
      this.isSubmitting.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.service.isOpen()) {
      this.close();
    }
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
