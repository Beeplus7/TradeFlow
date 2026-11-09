# TradFlow — Build Phase Plan

Source: Downloads artifacts (Oct 2026) copied to `docs/source-artifacts/`.

- Tree Blueprint (Updated)
- Architecture Production (Updated)
- Terminal Agent Scripts
- 8 Marketing Pages
- OS module specs (Assessment, Finance, Journey, Guardian, Execution, Discipline, Legacy, Simulator, Elite Tribe, Onboarding, Brand, Master Index)

**Product north star:** £50 In → Smile Out · Flow as One  
**Brand:** Navy `#0A1931` (vault) · Gold `#D4AF37` (key) · full system in [`BRAND.md`](./BRAND.md)

**Scope target (full SaaS):** 8 marketing pages + 36 OS pages + ~65 backend files · 10 OS engines · 3 bots · 12 Engines narrative

---

## Brand (locked for all phases)

Source: `tradeflow-brand.html` → canonical spec [`docs/BRAND.md`](./BRAND.md).

| Layer | Spec |
|---|---|
| **Palette** | Trade Navy `#0A1931` · Flow Gold `#D4AF37` · Gold Light `#C9A86A` · White · Charcoal `#1E293B` · Deep `#060E1F` |
| **Type** | Montserrat (display) · Inter (body) · JetBrains Mono (meters/console) |
| **Logo** | TF monogram + upward bars + realist equity bars + Flow Chain circle |
| **Voice** | Friendly. Disciplined. Oldham-funded trader — no London fluff, no Vegas hype |
| **Primary line** | TRADE. TRACK. ANALYZE. GROW. |
| **Secondary** | £50 In. Smile Out. |
| **Tertiary** | Assessment to Legacy. On Flow. |
| **Proof close** | Not learned. It's installed. |

**Rule:** Every phase ships on-brand. No purple/cream default AI looks. Hero marketing gets ~70% design effort inside this system.

---

## Current state

| Item | Status |
|---|---|
| Expo mobile + web shell (`~/TradFlow`) | Done — foundation waiting on credentials |
| Brand system documented (`docs/BRAND.md`) | Done — tokens to be wired in Phase 1 |
| Supabase / Google Auth / GitHub / VPS | Blocked — waiting on credentials |
| Blueprint docs ingested | Done |

**Stack note:** Blueprints assume a **Next.js 14 monorepo** (`apps/marketing`, `apps/app`, `packages/backend`) with Supabase, Stripe, BullMQ, Vercel crons, optional Electron for exchange keys. Expo is listed for mobile. Recommendation: evolve TradFlow into that monorepo shape after credentials land (keep Expo app for iOS/Android; Next.js for marketing + OS web).

---

## Core product loop (THE HEART)

Mon→Fri **must-complete** FlowChain. Skip a day → next day **LOCKED RED**.

| Day | Label | Must unlock |
|---|---|---|
| **Mon** | Assessment | 68% GO check |
| **Tue** | Connect / EliteFlow | Elites + whales · intel gather |
| **Wed** | Simulator | £5 fake training · discipline proof |
| **Thu** | Execute | £35 live · £7/day cap · risk capped |
| **Fri** | Legacy | 40/30/20/10 split · Smile Out |

**£50 dish:** £5 fake + £35 live (£7/day Mon–Fri) + £10 safety vault  
**Guardian:** 8% / 15% / 25% tap-out · crash check ~10s cron  
**Legacy Fri 11pm:** 40% reinvest · 30% smile · 20% HMRC · 10% vault (90-day lock)  
**Bots (3):** Eyes Boat (100 wallets / 30s) · Guardian · Execution (Binance/Bybit, Gate 5 greens)

---

## Phase 0 — Credentials, brand freeze & repo alignment *(now)*

**Goal:** Unblock infra; freeze brand + architecture.

1. Receive Supabase, Google Auth, GitHub, VPS credentials → fill `.env`
2. Treat [`BRAND.md`](./BRAND.md) as locked (palette, type, voice, logo anatomy)
3. Decide monorepo layout vs Expo-only (recommend monorepo per blueprints)
4. Create GitHub remote; push foundation
5. Wire Supabase project + Google OAuth provider
6. Confirm VPS isolation (see [`VPS_ISOLATION.md`](./VPS_ISOLATION.md)): domain `tradflow.online` only · ports `3030`/`4100` · path `/var/www/tradeflow` · PM2 `tradeflow-*` · Redis DB `8` — never touch ReelStorm / Litt Luxury / other vhosts

**Exit:** Auth works on web; env readiness green; remote exists; brand doc accepted; VPS slot reserved without clashes.

---

## Phase 1 — Platform skeleton + brand kit (Week 1)

**Goal:** Empty routes, schema, auth session, **on-brand design system** — no trading logic yet.

- Monorepo scaffold: `apps/marketing`, `apps/app`, `packages/backend` (or Expo Router mirror)
- **Brand kit:** CSS vars + theme tokens from `BRAND.md` (navy vault / gold key)
- Fonts: Montserrat + Inter + JetBrains Mono loaded once, shared across apps
- Shared UI kit: buttons, meters, shields, mono labels matching brand voice
- TF monogram / app icon from logo anatomy
- Supabase schema stubs: `users`, `journeys`, `trades`, `elites`, `simulations`, `nudges`, `legacy`, `timeline`
- Auth: Google sign-in → session → protected `/app` shell
- Navigation: Dashboard (UPRM home) + placeholder screens for all 36 OS routes
- Admin shell (6 pages) stubbed behind role flag

**Exit:** Signed-in user can open every OS route as a stub; UI already looks like TradFlow (not a generic template).

---

## Phase 2 — Onboarding + Assessment + Finance (Week 2)

**Agent prompts 1–3 from Terminal Scripts.**

| Build | Deliverable |
|---|---|
| Onboarding wizard | Risk profile 8/15/25 · exchange key intake (secure store / Electron later) |
| AssessmentOS | 68% GO meter · volatility regime · GO unlocks Mon · NO-GO wait |
| FinanceOS | £50 dish visual · balances £5 / £35 / £10 |

**Exit:** New user sets profile, gets GO/NO-GO, sees dish balances.

---

## Phase 3 — Journey Heart + Simulator (Week 3)

**Agent prompts 4 + simulator path.**

- `journey/page.tsx` + `journey/[day]/page.tsx`
- `flowChain.ts` / `canAccessDay()` must-complete state machine
- BullMQ (or equivalent) day-unlock jobs
- SimulatorOS: £5 fake trades, discipline proof gate for Thu

**Exit:** Mon incomplete → Tue red-locked; Wed sim can complete and unlock Thu.

---

## Phase 4 — Execution + Guardian (Week 4)

**Agent prompts 6–7 · Bots: Execution + Guardian.**

- Connect: Binance / Bybit keys (paper mode first)
- ExecutionOS: live console · **£7/day hard cap** · slippage guard · Gate 5 greens
- `BinanceExecutor` / `BybitExecutor` behind feature flag (paper → live)
- GuardianOS: shield UI · drawdown tap-out · £10 vault auto-protect · 10s check cron

**Exit:** Paper execute respects £7/day; Guardian can lock out on threshold.

---

## Phase 5 — Commonwealth, Eyes Boat, Discipline, UPRM (Week 5)

**Agent prompts 5, 9, 10 · Bot: Eyes Boat.**

- EliteFlow: personal 10 elites · Whale Tribe
- Intelligence: Arkham / DeFiLlama-style feeds (API keys as available)
- Eyes Boat bot: 100-wallet scan · 30s cron
- DisciplineOS: tilt / FOMO / revenge · cooldowns 10m / 30m / 24h
- UPRMOS: journey memory (“welcome back”) · timeline

**Exit:** Tue intel path real; discipline can lock; UPRM remembers state.

---

## Phase 6 — Legacy + Billing + Recoup + Admin (Week 6)

**Agent prompt 8 + billing.**

- LegacyOS: 40/30/20/10 vault · Fri 11pm split cron · HMRC CSV
- Stripe: £49 / £99 / £299 + hybrid 10% gains capped £299
- RecoupOS: 18-day recoup engine
- Admin: tribe · elites · nudges · billing · support

**Exit:** Paid plan checkout works; Friday split job dry-runs correctly.

---

## Phase 7 — Marketing site (parallel Weeks 4–7 · 70% design effort on hero)

**Brand-led.** Primary tagline on hero; secondary on social/commonwealth; tertiary on about/manifesto. Copy must pass the Oldham voice test in `BRAND.md`.

**8 pages (optional 9th blog):**

| # | Route | Focus |
|---|---|---|
| 1 | `/` | Infographics hero — Dish, FlowChain, GO, Guardian, Legacy, Eyes Boat, Live Console, Pricing toggle · **TRADE. TRACK. ANALYZE. GROW.** |
| 2 | `/how-it-works` | **12 Engines** + FlowChain + 3 Bots |
| 3 | `/pricing` | Monthly vs hybrid FAQ |
| 4 | `/commonwealth` | Whale Tribe · **£50 In. Smile Out.** |
| 5 | `/about` | Oldham mission · Commonwealth |
| 6 | `/manifesto` | Zero Knowledge Needed · Flow as One · **Not learned. It's installed.** |
| 7 | `/legal` | Terms · Privacy · Risk · FCA not fund manager |
| 8 | `/assessment-demo` | Free 68% GO lead magnet |

Hero budget (~12 days design): Framer Motion / SVG / Lottie-class motion on **navy + gold only**. Do **not** ship a flat marketing shell or off-brand palette.

**Exit:** Marketing converts to assessment-demo → signup; brand QA checklist in `BRAND.md` checked.

---

## Phase 8 — Hardening, mobile, deploy (Week 8+)

- Expo mobile parity for core OS screens (Phases 2–5)
- Security review: keys never in client; service role server-only
- FCA/risk copy audit on legal + in-app disclaimers
- CI on GitHub · deploy marketing/app (Vercel) · API/workers on VPS if used
- Load test crons (Eyes Boat 30s, Guardian 10s, Legacy Fri 11pm)
- Product Phase-1 vs Phase-2 commercial track from blueprint: personal keys first; later shared company API + override (£65k–£75k track) — **after** public SaaS MVP stable

**Exit:** Staging URL live; iOS/Android TestFlight/internal build; production checklist signed off.

---

## Suggested build order (dependency graph)

```
Credentials → Schema + Auth → Onboarding
                ↓
           Assessment → Finance → Journey Heart
                ↓
         Simulator ──→ Execute ──→ Guardian
                ↓
     Commonwealth / Eyes Boat / Discipline / UPRM
                ↓
         Legacy + Stripe + Admin
                ↓
     Marketing hero (can start UI earlier in parallel)
                ↓
         Mobile parity + Deploy
```

---

## Immediate next action

Paste credentials into `TradFlow/.env` (see `docs/CREDENTIALS.md`), then say **go Phase 0** to wire auth + monorepo scaffold.
