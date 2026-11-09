/**
 * Production static host for Expo web export (`dist/`).
 * SPA fallback so Expo Router deep links keep working.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3030);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, {
    'Content-Type': type,
    'Cache-Control': code === 200 && type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600',
  });
  res.end(body);
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || '/').split('?')[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  if (!fs.existsSync(ROOT)) {
    return send(res, 503, 'TradFlow web dist missing. Run: npm run export:web\n');
  }

  const urlPath = req.url || '/';
  if (urlPath === '/healthz' || urlPath === '/api/health') {
    return send(res, 200, JSON.stringify({ ok: true, service: 'tradeflow-web' }), 'application/json');
  }

  let filePath = safeJoin(ROOT, urlPath === '/' ? '/index.html' : urlPath);
  if (!filePath) return send(res, 400, 'Bad path');

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    // Expo Router SPA fallback
    filePath = path.join(ROOT, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    return send(res, 404, 'Not found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  send(res, 200, fs.readFileSync(filePath), type);
});

server.listen(PORT, HOST, () => {
  console.log(`tradeflow-web listening on http://${HOST}:${PORT} → ${ROOT}`);
});
