import { initializeApp } from 'firebase-admin/app';

initializeApp();

// Function exports go here. Example shape (uncomment + adapt when adding the first endpoint):
//
// import { onRequest } from 'firebase-functions/v2/https';
// import { z } from 'zod';
//
// const ContactPayload = z.object({
//   name: z.string().min(1),
//   email: z.string().email(),
//   message: z.string().min(1).max(2000),
// });
//
// export const submitContact = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
//   const parsed = ContactPayload.safeParse(req.body);
//   if (!parsed.success) {
//     res.status(400).json({ error: parsed.error.flatten() });
//     return;
//   }
//   res.json({ ok: true });
// });
