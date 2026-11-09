/**
 * Minimal TradFlow API surface until full backend lands.
 * Health + readiness JSON for ops / scorecard probes.
 */
import http from 'node:http';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4100);

const readiness = {
  service: 'tradeflow-api',
  version: '1.0.0',
  mode: 'stub',
  redis: process.env.REDIS_URL || null,
  prefix: process.env.REDIS_PREFIX || 'tradeflow:',
  surfaces: {
    marketing: true,
    os: true,
    stripe_checkout: true,
    live_exchange: false,
    eyes_boat_live: false,
  },
};

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  const json = (code, body) => {
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(body));
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (url === '/health' || url === '/api/health' || url === '/healthz') {
    return json(200, { ok: true, service: 'tradeflow-api' });
  }

  if (url === '/readiness' || url === '/api/readiness') {
    return json(200, { ok: true, ...readiness, scanned_at: new Date().toISOString() });
  }

  return json(404, { ok: false, error: 'not_found', hint: 'Use /api/health or /api/readiness' });
});

server.listen(PORT, HOST, () => {
  console.log(`tradeflow-api listening on http://${HOST}:${PORT}`);
});
