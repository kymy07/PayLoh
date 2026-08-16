# Payloh

A quiet little ledger for the money that moves between friends. Log what's owed,
record the instalments as they come back, and let Payloh write the reminder.

Built with Vite + React + TypeScript, styled with Tailwind v4 and shadcn/ui
components, backed by Firebase Auth and Realtime Database.

---

## Getting started

```powershell
npm install
npm run dev
```

The app boots at <http://localhost:5173> and works without Firebase — you'll see
a setup notice on the sign-in screens until the config is filled in.

**→ Firebase steps are in [SETUP.md](SETUP.md).** The database and sign-in
providers are already set up; what's left is registering a web app, pasting its
keys into `.env.local`, and publishing the database rules.

Secrets live in `.env.local` only, which is gitignored. `.env.example` is the
committed template and contains no real keys.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run deploy` | Build and push to Firebase Hosting |

## What it does

- **Email/password and Google sign-in**, with password reset
- **Both directions** — track what people owe you *and* what you owe them
- **Part-payments** — RM100 lent, RM30 back today; the balance and history keep themselves straight
- **Due dates** — a live countdown, and overdue debts float to the top of the dashboard
- **Dashboard** — hero balance, four stat tiles, and a ranked chart of who owes the most
- **Reminders** — a drafted, editable message that opens straight in WhatsApp
- **Search, filter, sort** across the whole ledger
- **Light and dark themes**, following the system by default
- **Mobile-first** — a tab bar and a floating compose button below `md`

## Design

Apple's calm end of the spectrum: system UI type set tight at display sizes,
generous whitespace, translucent chrome, spring easing on every transition, and
big rounded corners. The palette is the reference swatch — sand `#C9AF87`,
linen `#E0CDB1`, cream `#EFF0DC`, blush `#F8C6CD`, pink `#FA8FAE`,
rose `#EE7E9C` — mapped onto shadcn's semantic tokens in `src/index.css`.

The dashboard chart uses one series, so one hue: a deeper step of the brand rose
that clears 3:1 against the card, with a separately chosen dark-mode step. Both
were validated against the lightness band, chroma floor, and contrast rather
than picked by eye.

## Layout

```
src/
  components/
    ui/              shadcn/ui primitives (button, dialog, select, …)
    AppShell.tsx     header, nav, mobile tab bar
    DebtCard.tsx     one debt in a list
    *Dialog.tsx      add/edit, record payment, reminder, confirm
    TopPeopleChart.tsx
  contexts/
    AuthContext      session, profile, sign-in/out
    ThemeContext     light / dark / system
    DebtActionsContext  owns every debt dialog in one place
  hooks/useDebts.ts  live database subscriptions + all writes
  lib/
    firebase.ts      SDK init, config guard
    types.ts         Debt / Payment shapes + derived status
    format.ts        money, dates, initials, avatar tints
    reminder.ts      message builder, WhatsApp link
  pages/             Landing, Login, Signup, Dashboard, Debts, DebtDetail, Settings
```

## Security

Debts live under `debts/{uid}`, so `database.rules.json` grants access to a
subtree only when `auth.uid` matches it — no signed-in user can reach another
person's ledger. The rules also enforce the invariants the UI relies on:
`ownerId` must equal the owning uid, amounts stay positive, `paid` can never
exceed `amount`, and unknown fields are rejected outright.

Payments are nested inside their debt, which lets one Realtime Database
transaction write the instalment and update the running total together — the
two can't disagree, even from two tabs at once.
