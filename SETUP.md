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

### 4. Deploy

Two options — GitHub Pages is already wired up, Firebase Hosting is one command.

#### GitHub Pages → `kymy07.github.io/PayLoh/`

A Vite app can't be served straight from the repo: the source `index.html`
points at `/src/main.tsx`, which no browser can run — that's the blank page.
`.github/workflows/deploy-pages.yml` builds it properly and publishes `dist/`.

Every push to `main` redeploys, and it's self-configuring: the workflow's
`configure-pages` step sets the repo's Pages source to **GitHub Actions** on its
own, so leaving that setting on "deploy from a branch" no longer breaks the site.

Two things still have to be set by hand, once each.

**a. The three account-specific config values**, under repo **Settings → Secrets
and variables → Actions → New repository secret**:

| Name | From `firebaseConfig` |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

They can't be read from `.env.local` — that file is gitignored and never reaches
the runner, which is exactly what keeps it out of the repo. The other four
values are fixed project identifiers and already sit in the workflow.

Until the secrets exist the site still builds and loads; it just shows the
"Connect Firebase to continue" notice instead of signing anyone in.

**b. The domain**, under Firebase **Authentication → Settings → Authorised
domains → Add domain** → `kymy07.github.io`. Sign-in fails with
`auth/unauthorized-domain` until it's there.

#### Firebase Hosting → `payloh-website.web.app`

```powershell
npm install -g firebase-tools
firebase login
npm run deploy
```

Add `payloh-website.web.app` to authorised domains too.

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
