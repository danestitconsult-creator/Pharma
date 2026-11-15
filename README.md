# PharmaDesk (multi-pharmacy platform)

One `index.html` serves three kinds of user: the **platform owner** (you), a **pharmacy admin** and **pharmacy staff**. Each pharmacy's data lives under `shops/{shopId}/...` and is isolated by `firestore.rules`.

## Setup
1. Create a Firebase project. Enable **Authentication > Email/Password** and **Firestore**.
2. Paste your web config into `firebaseConfig` in `index.html`; set `PC` (platform currency) and `SUPPORT`.
3. Put your project id in `.firebaserc`, then deploy rules: `firebase deploy --only firestore`.
4. Push to GitHub, Settings > Pages > Source: **GitHub Actions**. Add your domain under Authentication > Authorized domains.
5. **Become the platform owner:** sign up in the app, copy your UID (Authentication > Users), then in Firestore create document `owners/<your UID>` with any field (e.g. `name: "me"`). Sign out and in: you now see the owner console. This is the only way to create an owner, so nobody can promote themselves.

## How it works
- A new user signs up and creates a pharmacy: it starts a 14-day trial and they become its admin.
- Admins also get a **shop code** (Shop & team). Staff sign up, choose "Join an existing pharmacy", enter the code and join as staff. The admin can turn the code off or replace it. Code joins are not counted against the staff limit by the rules (the limit is only shown in the app).
- Admins invite staff by email (Shop & team). The invited person signs up with that email and joins automatically.
- Billing is manual-first (works with mobile money / bank transfer): the pharmacy admin taps **Pay**, enters a reference; you see it under Overview > Payments to confirm, tap **Record payment**, and the subscription extends. Plans, prices, limits and payment instructions are edited in Settings.
- Enforcement is in `firestore.rules`: when a pharmacy is suspended or its subscription ends, writes are blocked and data stays readable. Staff and product limits are enforced in the app only.
- Payment history is written only by the owner. Sales can never be edited or deleted.

## iPhone notes
- Install from Safari: Share > Add to Home Screen (the app shows a reminder). iOS has no install prompt.
- Handled: safe areas (notch, home bar), no zoom on input focus, 100dvh layout, bottom tab bar for thumbs, native control styling, `<dialog>` fallback, IndexedDB-blocked fallback to memory cache, long-polling for flaky networks, local-date handling, storage persistence request.
- Limits: Safari tabs (not installed apps) can lose offline data after ~7 days without use; iOS PWAs cannot receive push notifications unless installed and on iOS 16.4+ (not implemented); the camera barcode scanner is not included.
- After a deploy, bump `VERSION` in `sw.js`. iOS apps pick up the update the next time they are opened.

## Next steps (need a server)
Automatic card/mobile-money billing (e.g. Paystack) needs a Cloud Function webhook that calls the same logic as `recordPay`. Email reminders for expiring subscriptions need a scheduled function.
