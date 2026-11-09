# TradFlow VPS isolation plan

Host: `87.106.103.43` (IONOS Ubuntu 24.04)  
Inventoried: Oct 2026

**Rule:** TradFlow never reuses another project’s domain, port, directory, PM2 name, or Redis DB.

---

## Already on this VPS (do not touch)

### Domains (nginx `server_name`)

| Domain | Project |
|---|---|
| `reelstorm.uk` · `www` · `app.reelstorm.uk` · `api.reelstorm.uk` | ReelStorm |
| `litt-luxury.com` · `app.litt-luxury.com` | Litt Luxury |
| `roadagel.com` · `app` · `crm` | Roadagel |
| `vexogarage.co.uk` · `app` · `api` | Vexo Garage |
| `visaguideos.com` | Visa Guide |
| `app.aroleadjo.com` · `*.aroleadjo.com` | Aro Leadjo family |
| `shopfooty-traffic.aroleadjo.com` | Shopfooty |

### Ports in use

| Port | Service |
|---|---|
| 80 / 443 | nginx (shared edge — OK to add a **new** vhost only) |
| 3000 | visaguide-stripe-test |
| 3001 | next-server |
| 3017 | reelstorm-web |
| 3020 | littluxry-web |
| 3021 | app-litt-luxury-web |
| 4001 | shopfooty-traffic |
| 4017 | reelstorm-api |
| 6379 | redis (shared — use **dedicated DB index**) |
| 8001 | realstorm-agent (uvicorn) |
| 8090 | voice-forge |

### PM2 process names (reserved)

`reelstorm-web` · `reelstorm-api` · `reelstorm-worker` · `reelstorm-agent` · `littluxry-web` · `app-litt-luxury-web` · `shopfooty-traffic:4001` · `vexo-web` · `visaguide-stripe-test` · `voice-forge` · `realstorm-agent`

### Paths (reserved)

`/var/www/reelstorm.uk` · `/opt/reelstorm-os` · `/opt/littluxry` · `/opt/app-litt-luxury` · `/var/www/roadagel` · `/var/www/vexo-garage` · `/var/www/visaguide` · …

---

## TradFlow reserved slot (unique)

| Resource | TradFlow value | Why |
|---|---|---|
| **Public domain** | `f.reelstorm.uk` only | Free — **not** in nginx yet. Never bind `reelstorm.uk` / `app` / `api`. |
| **Code path** | `/var/www/tradeflow` | New folder; not under reelstorm |
| **Logs** | `/var/log/tradeflow/` | Isolated |
| **PM2 apps** | `tradeflow-web` · `tradeflow-api` · `tradeflow-worker` | Unique names |
| **Web port** | `127.0.0.1:3030` | Free |
| **API port** | `127.0.0.1:4100` | Free |
| **Worker** | no public port | Queue consumer only |
| **Redis** | DB `8` + key prefix `tradeflow:` | Avoids db0 / db17 |
| **Nginx site** | `/etc/nginx/sites-available/tradeflow` → `sites-enabled/tradeflow` | Own file; never edit `reelstorm` |
| **TLS** | Certbot for `f.reelstorm.uk` only | Own cert or expand carefully |
| **Env file on VPS** | `/var/www/tradeflow/.env.production` | Not shared with ReelStorm |

### Upstream map (nginx)

```
upstream tradeflow_web { server 127.0.0.1:3030; }
upstream tradeflow_api { server 127.0.0.1:4100; }

server_name f.reelstorm.uk;   # ONLY this name
```

---

## Clash risks (explicit)

| Risk | Mitigation |
|---|---|
| Using `app.reelstorm.uk` | Forbidden — belongs to ReelStorm |
| Port 3017 / 4017 | Forbidden — ReelStorm |
| Editing `/etc/nginx/sites-enabled/reelstorm` | Forbidden — add `tradeflow` site only |
| Redis db0 default | Use Redis DB **8** + `tradeflow:` prefix |
| PM2 name `reelstorm-*` | Use `tradeflow-*` only |
| Deploy into `/opt/reelstorm-os` | Use `/var/www/tradeflow` |
| Shared `.env` on server | Separate production env file |

---

## DNS prerequisite

Point **A record** `f.reelstorm.uk` → `87.106.103.43` before certbot.

Confirm it is **not** already CNAME’d to another app.

---

## Deploy checklist (when ready)

1. `mkdir -p /var/www/tradeflow /var/log/tradeflow`
2. Install nginx site from `deploy/nginx/tradeflow.conf`
3. `certbot --nginx -d f.reelstorm.uk`
4. PM2 start with `deploy/ecosystem.config.cjs` (ports 3030 / 4100)
5. `nginx -t && systemctl reload nginx`
6. Smoke-test: `curl -I https://f.reelstorm.uk` — other domains still respond unchanged
