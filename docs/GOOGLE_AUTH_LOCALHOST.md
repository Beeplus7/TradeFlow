# Google Auth — Localhost checklist

Use this so Google OAuth works on **local Expo/web** and **production** (`tradflow.online`).

## 1. Google Cloud → OAuth client (Web application · TradeFlow)

### Authorised JavaScript origins

Add (remove `https://www.example.com`):

```
http://localhost
http://localhost:8081
http://localhost:19006
http://127.0.0.1
https://tradflow.online
```

### Authorised redirect URIs

Keep Supabase callback (required for Supabase Google provider):

```
https://dvjawpbnjyjnjzktyrwp.supabase.co/auth/v1/callback
```

Then click **Create** and copy:

- **Client ID** → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`
- **Client secret** (`GOCSPX-…`) → `GOOGLE_CLIENT_SECRET` in `.env`  
  **Do not** reuse the Supabase database password here.

## 2. Supabase → Authentication → Providers → Google

| Field | Value |
|---|---|
| Enable | ON |
| Client IDs | paste Google **Client ID** |
| Client Secret | paste Google **Client secret** (`GOCSPX-…`) |
| Callback URL | `https://dvjawpbnjyjnjzktyrwp.supabase.co/auth/v1/callback` |

## 3. Supabase → Authentication → URL configuration

| Field | Value |
|---|---|
| Site URL | `http://localhost:8081` (dev) or `https://tradflow.online` (prod) |
| Redirect URLs | `http://localhost:8081/**` · `http://localhost:19006/**` · `tradflow://**` · `https://tradflow.online/**` |

## 4. Restart Expo after saving `.env`

```bash
cd TradFlow && npx expo start --web --port 8081
```
