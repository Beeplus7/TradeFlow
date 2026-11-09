# TradFlow

Cross-platform **React** app (iOS, Android, Web) built with Expo.

## Status

Foundation environment is in place. Integrations are **paused** until credentials are provided:

- Supabase
- Google Auth
- GitHub
- VPS / API

See [docs/CREDENTIALS.md](docs/CREDENTIALS.md) · [docs/BRAND.md](docs/BRAND.md) · [docs/BUILD_PHASE_PLAN.md](docs/BUILD_PHASE_PLAN.md).

**Brand:** Trade Navy `#0A1931` · Flow Gold `#D4AF37` · *TRADE. TRACK. ANALYZE. GROW.*

## Setup

```bash
cd TradFlow
cp .env.example .env   # then fill credentials
npm install
npm start              # Expo Dev Tools
```

Platform scripts:

```bash
npm run ios
npm run android
npm run web
```

## Stack

| Layer | Choice |
|---|---|
| UI | React Native + React Native Web |
| Runtime | Expo SDK 58 |
| Auth (planned) | Supabase Auth + Google OAuth |
| Backend (planned) | Supabase + VPS API |
| Source | GitHub |

## Project layout

```
TradFlow/
  App.tsx                 # App entry shell
  .env.example            # Credential template
  src/
    config/env.ts         # Typed env + readiness checks
    lib/supabase.ts       # Supabase client (gated)
    lib/auth/google.ts    # Google Auth hook stub
    components/           # UI
    theme/                # Design tokens
  docs/CREDENTIALS.md     # What to paste next
```
