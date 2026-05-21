import { Injectable, inject, signal } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { FIREBASE_FUNCTIONS } from '../firebase.providers';

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  body: string;
}

export interface ContactResult {
  ok: boolean;
}

/**
 * Owns the contact modal's open/close state and the `submitContact`
 * Cloud Function call. Same shape as MailingListService — combining
 * popup state + the submission write into one service lets the
 * footer and the modal both reach for the same thing without
 * prop-drilling.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly functions = inject(FIREBASE_FUNCTIONS);
  private readonly callable = httpsCallable<ContactInput, ContactResult>(
    this.functions,
    'submitContact'
  );

  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  async submit(input: ContactInput): Promise<ContactResult> {
    const result = await this.callable(input);
    return result.data;
  }
}
