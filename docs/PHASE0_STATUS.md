# Phase 0 / 1 status

Updated after Google OAuth client + local full scaffold (Oct 2026).

| Integration | Status | Notes |
|---|---|---|
| **Supabase** | Ready | Linked · schema migrated · Google provider **enabled** via `config push` |
| **Google Auth** | Ready | Client ID wired · secret in Supabase · localhost + `tradflow.online` redirects |
| **GitHub** | Ready | `Beeplus7/TradeFlow` |
| **VPS** | Isolated / waiting | Slot reserved (`VPS_ISOLATION.md`). DNS `tradflow.online` → `87.106.103.43`. Deploy when VPS is back. |

## Local build progress

- Expo Router app shell (`app/`)
- Google sign-in screen + AuthProvider
- Brand fonts (Montserrat / Inter / JetBrains Mono)
- All OS + admin route stubs
- Core SQL migration applied to remote

## Design sources adopted

All Downloads prototypes live in **`design/`** (see `design/README.md`).  
OnboardingOS 6-step wizard + marketing hero copy now match those files.

## Marketing first (public)

| Route | Page |
|---|---|
| `/` | Hero — TradFlow brand + dish visual + CTAs |
| `/how-it-works` | 12 Engines + FlowChain + 3 Bots |
| `/pricing` | £49/£99/£299 + hybrid |
| `/commonwealth` | Whale Tribe social proof |
| `/about` | £50 In Smile Out · Oldham |
| `/manifesto` | Assessment to Legacy |
| `/legal` | Terms · Risk · FCA framing |
| `/assessment-demo` | Free 68% GO lead magnet |

OS lives under **`/app/*`** (onboarding, admin, etc.) after Sign in.

## Phase 2 — OS (under `/app`)

| Screen | Status |
|---|---|
| `/app/onboarding` | Risk 8/15/25 · optional keys · saves `profiles` |
| `/app/assessment` | 68% GO meter · unlocks Mon on `journeys` |
| `/app/finance` | £50 dish visual |
| `/app` | Dashboard progress strip + CTA |

## Phase 3 — Journey Heart + Simulator

| Screen | Status |
|---|---|
| `/app/journey` | Mon→Fri FlowChain map · LOCKED RED |
| `/app/journey/[day]` | Tue EliteFlow · Fri gates · Thu→Execute |
| `/app/simulator` | £5 fake trades · discipline proof → unlock Thu |
| `flowChain.ts` | `canAccessDay` must-complete state machine |

## Phase 4 — Execution + Guardian

| Screen | Status |
|---|---|
| `/app/connect` | Paper-first venue (Binance/Bybit flagged) |
| `/app/execute` | Paper console · £7/day · Gate 5 · slippage |
| `/app/guardian` | Shield · 8/15/25 tap-out · 10s check · £10 vault |
| `execution.ts` / `guardian.ts` | Cap + Gate 5 + drawdown lock |

## Phase 5 — Commonwealth · Eyes · Discipline · UPRM

| Screen | Status |
|---|---|
| `/app/commonwealth` | EliteFlow personal 10 |
| `/app/intelligence` | Eyes Boat paper scan |
| `/app/discipline` | Tilt/FOMO/revenge locks |
| `/app/uprm` | Companion + timeline memory |

## Phase 6 — Legacy · Recoup · Desk · Admin

| Screen | Status |
|---|---|
| `/app/legacy` | 40/30/20/10 split · HMRC CSV |
| `/app/recoup` | 18-day engine |
| `/app/portfolio` · `/history` · `/profile` · `/settings` | Live |
| `/app/admin/*` | Tribe · elites · nudges · billing · support |

## Stripe (test)

| Item | Status |
|---|---|
| Account | `acct_1TyEpWKFjjrlm6Pq` (VisaGuide / RoadAngel test) |
| Prices | Starter £49 · Pro £99 · Elite £299 · Hybrid £49 base |
| Edge | `create-tradeflow-checkout` · `stripe-tradeflow-webhook` |
| UI | `/app/settings` → Pay with Stripe |

## Google Testing mode

OAuth consent is in **Testing**. Add your Google account under **Audience → Test users** or Google sign-in will fail for others.

## Run locally

```bash
cd TradFlow
npm run web   # http://localhost:8081
```

## Deploy (9 Nov 2026)

Use `npm run deploy:vps` (needs `sshpass` + `VPS_INITIAL_PASSWORD`, or a filled `VPS_SSH_KEY_PATH`).

1. `mkdir -p /var/www/tradeflow /var/log/tradeflow` — scripted
2. Install `deploy/nginx/tradeflow.conf` (ports 3030/4100) — scripted
3. **DNS blocker:** Cloudflare A `tradflow.online` → `87.106.103.43` (not present yet)
4. Certbot for `tradflow.online` after DNS propagates
5. PM2 via `deploy/ecosystem.config.cjs` — `tradeflow-web` / `tradeflow-api` / `tradeflow-worker`
6. Production readiness UI: `/readiness`

| Check | Status |
|---|---|
| Code on GitHub `main` | Target of this deploy pass |
| VPS rsync + npm + PM2 | Deploy script |
| Public HTTPS | Blocked on DNS |
| `tradflow.online` | Not wired — separate cutover |
