#!/usr/bin/env bash
# TradFlow → VPS isolated deploy (tradflow.online)
# Usage (from repo root, with .env loaded):
#   bash deploy/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${VPS_HOST:?VPS_HOST required}"
: "${VPS_USER:?VPS_USER required}"
: "${VPS_DEPLOY_PATH:=/var/www/tradeflow}"
VPS_SSH_PORT="${VPS_SSH_PORT:-22}"

SSH_BASE=(ssh -p "$VPS_SSH_PORT" -o StrictHostKeyChecking=accept-new)
RSYNC_SSH="ssh -p $VPS_SSH_PORT -o StrictHostKeyChecking=accept-new"

if [[ -n "${VPS_SSH_KEY_PATH:-}" && -f "$VPS_SSH_KEY_PATH" ]]; then
  SSH_BASE+=( -i "$VPS_SSH_KEY_PATH" )
  RSYNC_SSH="ssh -p $VPS_SSH_PORT -i $VPS_SSH_KEY_PATH -o StrictHostKeyChecking=accept-new"
elif command -v sshpass >/dev/null && [[ -n "${VPS_INITIAL_PASSWORD:-}" ]]; then
  export SSHPASS="$VPS_INITIAL_PASSWORD"
  SSH_BASE=(sshpass -e ssh -p "$VPS_SSH_PORT" -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=accept-new)
  RSYNC_SSH="sshpass -e ssh -p $VPS_SSH_PORT -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=accept-new"
fi

echo "==> Export web"
npm run export:web

echo "==> Ensure remote dirs"
"${SSH_BASE[@]}" "${VPS_USER}@${VPS_HOST}" "mkdir -p '$VPS_DEPLOY_PATH' /var/log/tradeflow /etc/nginx/sites-available"

echo "==> Sync code (no node_modules / .git / .env)"
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .expo \
  --exclude .env \
  --exclude .env.* \
  --exclude '!.env.example' \
  -e "$RSYNC_SSH" \
  "$ROOT/" "${VPS_USER}@${VPS_HOST}:${VPS_DEPLOY_PATH}/"

echo "==> Upload production env (public + server keys needed at runtime)"
# Build a production env without local-only noise
TMP_ENV="$(mktemp)"
grep -E '^(EXPO_PUBLIC_|SUPABASE_|GOOGLE_|STRIPE_|REDIS_|TRADEFLOW_|NODE_ENV=)' .env > "$TMP_ENV" || true
echo "NODE_ENV=production" >> "$TMP_ENV"
"${SSH_BASE[@]}" "${VPS_USER}@${VPS_HOST}" "cat > '$VPS_DEPLOY_PATH/.env.production'" < "$TMP_ENV"
rm -f "$TMP_ENV"

echo "==> Install + restart PM2"
"${SSH_BASE[@]}" "${VPS_USER}@${VPS_HOST}" bash -s <<REMOTE
set -euo pipefail
cd '$VPS_DEPLOY_PATH'
# Prefer production install; export already shipped in dist/
npm ci --omit=dev || npm install --omit=dev
cp -f deploy/nginx/tradeflow.conf /etc/nginx/sites-available/tradeflow
ln -sfn /etc/nginx/sites-available/tradeflow /etc/nginx/sites-enabled/tradeflow
nginx -t
systemctl reload nginx
pm2 delete tradeflow-web tradeflow-api tradeflow-worker 2>/dev/null || true
# Load public env for PM2 children
set -a
source .env.production
set +a
pm2 start deploy/ecosystem.config.cjs
pm2 save
curl -sf http://127.0.0.1:3030/healthz
curl -sf http://127.0.0.1:4100/api/health
echo
echo 'Local probes OK'
REMOTE

echo "==> Done. Point DNS A tradflow.online → $VPS_HOST then:"
echo "    ssh ${VPS_USER}@${VPS_HOST} 'certbot --nginx -d tradflow.online --non-interactive --agree-tos -m ops@tradflow.online --redirect || true'"
