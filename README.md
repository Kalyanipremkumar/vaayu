# Vaayu

**AI-powered artwork valuation.** Upload a photo of an artwork, add a little context (artist,
medium, dimensions, tradition, condition), and receive an AI valuation with a defensible,
layer-by-layer pricing report. Built for Indian folk art first, expanding to global fine art.

> Working title was "ArtPrice AI". Vaayu is a standalone product — it borrows the valuation
> methodology developed in Varnam Studio but is independently brandable, sellable, and licensable.

This is a pnpm-workspace monorepo containing the web app, the mobile app, and the shared packages
they share in common.

---

## Repository layout

```
vaayuapp/
├── apps/
│   ├── web/          # React 19 + Vite + React Router v6 + Tailwind + Zustand + React Query
│   └── mobile/       # React Native + Expo SDK 54 + React Navigation v6 + Zustand
├── packages/
│   ├── shared/       # Types, constants, design tokens, pricing methodology (pure math) + prompt
│   └── supabase/     # Typed Supabase client factory + generated DB types + SQL migrations
├── .github/workflows # CI
├── pnpm-workspace.yaml
└── package.json      # Root workspace scripts
```

### Why the pricing engine is split

The Anthropic API key must **never** ship in a client bundle. `packages/shared` is imported by both
the web and mobile clients, so it holds only the **prompt**, the **types**, and the **pure pricing
math** (the three-layer formula, fully unit-tested, no key required). The actual Claude vision call
runs **server-side** (a Supabase Edge Function, added in Phase 2).

---

## Prerequisites

| Tool | Version | Notes                                              |
| ---- | ------- | -------------------------------------------------- |
| Node | ≥ 20    | Tested on v24. Use the same major across the team. |
| pnpm | ≥ 9     | `npm install -g pnpm` (Corepack also works).       |
| Expo | SDK 54  | For mobile only; installed via the workspace.      |

---

## Getting started

```bash
# 1. Install everything (from the repo root)
pnpm install

# 2. Configure environment
#    Copy each example file and fill in real values (see "Environment" below)
cp apps/web/.env.example     apps/web/.env
cp apps/mobile/.env.example  apps/mobile/.env

# 3. Run the web app
pnpm dev:web        # http://localhost:5173

# 4. Run the mobile app (separate terminal)
pnpm dev:mobile     # opens Expo; scan the QR with Expo Go
```

### Useful root scripts

| Script            | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `pnpm dev:web`    | Start the Vite dev server                      |
| `pnpm dev:mobile` | Start the Expo dev server                      |
| `pnpm build:web`  | Typecheck + production build of the web app    |
| `pnpm typecheck`  | `tsc --noEmit` across every package            |
| `pnpm lint`       | ESLint across the monorepo                     |
| `pnpm format`     | Prettier write                                 |
| `pnpm test`       | Run Vitest in every package that defines tests |

---

## Environment

Secrets live in per-app `.env` files (git-ignored). `/.env.example` at the root is the full
reference of every variable the project uses across client and server.

**Prefix rules (important):**

- Web (Vite): client-exposed vars **must** start with `VITE_`.
- Mobile (Expo): client-exposed vars **must** start with `EXPO_PUBLIC_`.
- Server-only secrets (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, Resend)
  have **no** prefix and must never appear in client code.

You do **not** need any server secrets to run the scaffold — only the Supabase URL + anon key once
the project exists.

---

## Tech stack

- **Web:** React 19, Vite, React Router v6, Tailwind CSS, Zustand, TanStack Query → Vercel
- **Mobile:** React Native, Expo SDK 54, React Navigation v6, Zustand → EAS Build
- **Backend:** Supabase (Postgres + RLS + Storage), Anthropic Claude (server-side), Razorpay (INR),
  Stripe (USD), Resend (email)
- **Shared:** TypeScript everywhere, ESLint + Prettier, pnpm workspaces, conventional commits

---

## Build status / roadmap

- [x] **Phase 0 — Foundation scaffold** (this commit): monorepo, web + mobile skeletons, shared
      packages, pricing math + tests, design tokens, env reference, CI.
- [ ] **Phase 1 — Supabase schema + auth** (tables, RLS, `on_auth_user_created` trigger, login).
- [ ] **Phase 2 — Pricing engine** (Edge Function + Claude vision, valuation wizard, report page).
- [ ] **Phase 3 — Payments** (Razorpay + Stripe, paywall, webhooks).
- [ ] **Phase 4 — Mobile parity** (camera/upload, EAS Android beta).
- [ ] **Phase 5 — Polish** (states, email, settings, PDF export, deploy).

See the project brief for the detailed phase breakdown.
