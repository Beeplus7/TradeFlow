# TradFlow — Credentials Checklist

Foundation is ready. Paste values into `.env` (copy from `.env.example`), then restart Expo.

## 1. Supabase

From your Supabase project → **Settings → API**:

| Variable | Where |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` (server only — never ship to the client) |

Also enable **Google** under Authentication → Providers once Google OAuth is set up.

## 2. Google Auth

Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs:

| Variable | Client type |
|---|---|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Web application |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | iOS |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Android |
| `GOOGLE_CLIENT_SECRET` | Web client secret (server / Supabase only) |

Authorized redirect URIs should include your Expo / Supabase callback URLs.

## 3. GitHub

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | PAT or fine-grained token for push / CI |
| `GITHUB_OWNER` | Org or username |
| `GITHUB_REPO` | Repository name (e.g. `TradFlow`) |
| `GITHUB_WEBHOOK_SECRET` | Optional deploy webhook |

Remote URL will be: `https://github.com/<OWNER>/<REPO>.git`

## 4. Stripe (test)

Portal: [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

| Variable | Where |
|---|---|
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (`pk_test_…`) — optional if using Checkout redirect |
| `STRIPE_SECRET_KEY` | Secret key (`sk_test_…`) — **Supabase Edge secrets only** |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret for `stripe-tradeflow-webhook` |
| `STRIPE_PRICE_STARTER` / `_PRO` / `_ELITE` / `_HYBRID` | Price IDs (GBP monthly) |

Checkout: Edge Function `create-tradeflow-checkout` · Settings → Pay with Stripe.

Reuse test keys from VisaGuide / RoadAngel (`acct_1TyEpWKFjjrlm6Pq`) or create a dedicated TradFlow Stripe account later.

## 5. VPS

| Variable | Purpose |
|---|---|
| `VPS_HOST` | Server IP or hostname |
| `VPS_USER` | SSH user |
| `VPS_SSH_PORT` | Usually `22` |
| `VPS_DEPLOY_PATH` | Deploy directory on the server |
| `VPS_SSH_KEY_PATH` | Path to private key on your machine |
| `EXPO_PUBLIC_API_BASE_URL` | Public API base URL (e.g. `https://api.yourdomain.com`) |

## After credentials arrive

Reply in chat with the values (or confirm `.env` is filled). Next steps:

1. Wire Supabase session + Google sign-in end-to-end
2. Create / push the GitHub remote
3. Add deploy scripts for the VPS
