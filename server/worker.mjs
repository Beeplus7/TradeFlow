/**
 * Queue worker placeholder — keeps PM2 process healthy until BullMQ jobs land.
 * Heartbeats every 60s; no Redis mutations.
 */
const INTERVAL_MS = 60_000;

console.log(
  `tradeflow-worker idle · redis=${process.env.REDIS_URL || 'unset'} · prefix=${process.env.REDIS_PREFIX || 'tradeflow:'}`,
);

const tick = () => {
  console.log(`tradeflow-worker heartbeat ${new Date().toISOString()}`);
};

tick();
setInterval(tick, INTERVAL_MS);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
