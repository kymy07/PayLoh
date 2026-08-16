# Payloh — Firebase setup

Project: **PayLoh Website** (`payloh-website`), Spark plan. Everything below
stays inside the free tier.

## Already done in the console ✅

- **Realtime Database** created — `payloh-website-default-rtdb`, Singapore (`asia-southeast1`)
- **Authentication** — Email/Password and Google both enabled

## Still to do

### 1. Register a Web app and copy its keys

The app config is the one thing the code can't produce for itself.

1. Open <https://console.firebase.google.com/project/payloh-website/settings/general>
2. Under **Your apps**, click the Web icon (`</>`) — or **Add app → Web** if there isn't one yet
3. Nickname: `Payloh Web` → **Register app**
4. Copy the `firebaseConfig` block it shows

### 2. Paste them into `.env.local`

`.env.local` already has the four values that are public knowledge. Replace the
three `PASTE_` placeholders with what the console gave you:

```
VITE_FIREBASE_API_KEY=AIzaSy...              ← from the console
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012   ← from the console
VITE_FIREBASE_APP_ID=1:123456789012:web:abc...   ← from the console
```

Then restart the dev server — Vite only reads env files at startup:

```powershell
npm run dev
```

> `.env.local` is gitignored and stays on your machine. `.env.example` is the
> committed template and holds no real keys.

### 3. Publish the database rules

`database.rules.json` scopes every node to the account that owns it. Without it,
the database default (locked) blocks the app entirely.

**Copy/paste route:** open the **Rules** tab in Realtime Database, paste the
contents of `database.rules.json` over what's there, click **Publish**.

**CLI route:**

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --only database
```

### 4. Deploy the site (optional, when you're ready)

```powershell
npm run deploy
```

Lands at `https://payloh-website.web.app`. Afterwards add that domain under
**Authentication → Settings → Authorised domains** so Google sign-in works in
production.

---

## Data model

```
users/{uid}
  uid, displayName, email, photoURL, currency, createdAt

debts/{uid}/{debtId}
  ownerId, personName, personPhone
  direction   'owed_to_me' | 'i_owe'
  amount      total agreed
  paid        running total of instalments
  currency, description, dueDate, settledAt, createdAt, updatedAt
  payments/{paymentId}
    amount, note, paidAt, createdAt
```

Two things this shape buys:

- **Debts sit under the owner's uid**, so the rules are one line per subtree and
  there is no query to filter — the subtree *is* your ledger.
- **Payments nest inside the debt**, so a single Realtime Database transaction
  updates the instalment and the `paid` total together. They can't drift apart,
  even with the app open in two tabs.

All timestamps are epoch milliseconds — Realtime Database has no date type.

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Connect Firebase to continue" | `.env.local` still has `PASTE_` values, or the dev server wasn't restarted |
| `auth/operation-not-allowed` | Sign-in method not enabled (already done for this project) |
| `auth/unauthorized-domain` | Add the domain under Authentication → Settings → Authorised domains |
| `PERMISSION_DENIED` | Rules not published — step 3 |
| Dashboard stays empty after adding a debt | Same as above; check the browser console |
