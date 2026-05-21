import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FIRESTORE } from '../firebase.providers';

const SEEN_KEY = 'moye:mailingListSeen';

/**
 * Owns the mailing list popup's open/close state, the "has the
 * visitor seen this before" localStorage flag, and the Firestore
 * subscribe write. Combining all three keeps the modal component
 * dumb (just reads signals + calls methods) and lets the footer
 * and the first-visit timer in app.ts both trigger the popup
 * without prop-drilling.
 */
@Injectable({ providedIn: 'root' })
export class MailingListService {
  private readonly firestore = inject(FIRESTORE);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    if (this.isBrowser) {
      try {
        localStorage.setItem(SEEN_KEY, '1');
      } catch {
        // localStorage might be blocked (private mode, etc.) — non-fatal.
      }
    }
  }

  hasSeenPopup(): boolean {
    if (!this.isBrowser) return true; // SSR: don't trigger
    try {
      return localStorage.getItem(SEEN_KEY) !== null;
    } catch {
      return true;
    }
  }

  async subscribe(name: string, email: string, city: string): Promise<void> {
    const lowercaseEmail = email.toLowerCase().trim();
    const cleanCity = city.trim();
    await setDoc(
      doc(this.firestore, 'mailing_list', lowercaseEmail),
      {
        email: lowercaseEmail,
        name: name.trim(),
        city: cleanCity.length > 0 ? cleanCity : null,
        source: 'popup',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}
