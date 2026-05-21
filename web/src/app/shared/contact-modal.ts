import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../core/services/contact.service';

const WORD_LIMIT = 100;

@Component({
  selector: 'app-contact-modal',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (service.isOpen()) {
      <div class="backdrop" (click)="close()">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <button class="close" type="button" (click)="close()" aria-label="Close">×</button>

          @if (hasSubmitted()) {
            <div class="thanks">
              <h3>we'll be in touch.</h3>
              <p>thanks for reaching out.</p>
            </div>
          } @else {
            <h3>contact</h3>
            <p class="lead">questions, bookings, hellos.</p>

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
                <span class="field-label">subject</span>
                <input
                  type="text"
                  required
                  [ngModel]="subject()"
                  (ngModelChange)="subject.set($event)"
                  name="subject"
                />
              </label>
              <label class="field">
                <span class="field-label">
                  message
                  <span class="counter" [class.over]="wordCount() > wordLimit">
                    {{ wordCount() }} / {{ wordLimit }} words
                  </span>
                </span>
                <textarea
                  required
                  rows="5"
                  [ngModel]="body()"
                  (ngModelChange)="body.set($event)"
                  name="body"
                ></textarea>
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
                  sending…
                } @else {
                  send
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
      max-width: 32rem;
      width: 100%;
      max-height: calc(100vh - 2rem);
      overflow: auto;
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
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .counter {
      font-variant-numeric: tabular-nums;
      font-size: 0.75rem;
    }
    .counter.over {
      color: #b04a4a;
    }
    .field input, .field textarea {
      font-family: inherit;
      font-size: var(--text-body);
      color: var(--color-ink);
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--color-border);
      padding: 0.5rem 0;
      outline: none;
      resize: vertical;
    }
    .field input:focus, .field textarea:focus {
      border-bottom-color: var(--color-ink);
    }
    .field textarea {
      line-height: 1.5;
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
export class ContactModalComponent {
  protected readonly service = inject(ContactService);
  protected readonly wordLimit = WORD_LIMIT;

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly subject = signal('');
  protected readonly body = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly hasSubmitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly wordCount = computed(() => {
    const text = this.body().trim();
    if (text.length === 0) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  });

  protected readonly canSubmit = computed(() => {
    return (
      this.name().trim().length > 0 &&
      this.isValidEmail(this.email()) &&
      this.subject().trim().length > 0 &&
      this.body().trim().length > 0 &&
      this.wordCount() <= WORD_LIMIT
    );
  });

  protected close(): void {
    this.service.close();
    setTimeout(() => {
      this.name.set('');
      this.email.set('');
      this.subject.set('');
      this.body.set('');
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
      await this.service.submit({
        name: this.name(),
        email: this.email(),
        subject: this.subject(),
        body: this.body(),
      });
      this.hasSubmitted.set(true);
      this.isSubmitting.set(false);
      setTimeout(() => this.close(), 2000);
    } catch (err) {
      console.warn('[Contact] submit failed:', err);
      this.submitError.set(this.errorMessage(err));
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

  private errorMessage(err: unknown): string {
    if (
      err &&
      typeof err === 'object' &&
      'message' in err &&
      typeof (err as { message: unknown }).message === 'string'
    ) {
      return (err as { message: string }).message;
    }
    return 'couldn\'t send — try again?';
  }
}
