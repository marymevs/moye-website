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
    try {
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
    } catch (err) {
      // Why we treat permission-denied as success here — by elimination:
      //
      //   The `mailing_list/{email}` rule:
      //     allow create: if true     // always permitted
      //     allow update: if false    // always denied
      //     allow read, delete: if false
      //
      //   This service only ever calls `setDoc()`. setDoc resolves to either
      //   create (when the doc doesn't exist) or update (when it does).
      //   create can't trigger permission-denied (the rule allows it
      //   unconditionally). So if we receive permission-denied, the only
      //   possible cause is "doc already existed and setDoc became an
      //   update" — meaning the email is already in the collection (e.g.
      //   visitor opted in via the Stripe checkout newsletter previously,
      //   or already submitted the popup). They're already subscribed;
      //   silently succeeding is the right UX.
      //
      // ⚠️  If you add ANY other Firestore call to this service (a getDoc,
      // a transaction, anything that could trigger a different rule), this
      // reasoning breaks. Either tighten this catch to specifically check
      // that the error originated from the setDoc call, or revisit the rule
      // design so updates are allowed with field-level constraints.
      if (this.isPermissionDenied(err)) return;
      throw err;
    }
  }

  private isPermissionDenied(err: unknown): boolean {
    return (
      err !== null &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: unknown }).code === 'permission-denied'
    );
  }
}
