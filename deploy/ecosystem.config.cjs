/**
 * PM2 ecosystem — TradFlow only.
 * Names/ports chosen to avoid clashes with reelstorm-*, littluxry-*, etc.
 * See docs/VPS_ISOLATION.md
 */
module.exports = {
  apps: [
    {
      name: 'tradeflow-web',
      cwd: '/var/www/tradeflow',
      script: 'npm',
      args: 'run start:web',
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
        HOST: '127.0.0.1',
      },
      max_memory_restart: '512M',
      error_file: '/var/log/tradeflow/web-error.log',
      out_file: '/var/log/tradeflow/web-out.log',
      time: true,
    },
    {
      name: 'tradeflow-api',
      cwd: '/var/www/tradeflow',
      script: 'npm',
      args: 'run start:api',
      env: {
        NODE_ENV: 'production',
        PORT: 4100,
        HOST: '127.0.0.1',
        REDIS_URL: 'redis://127.0.0.1:6379/8',
        REDIS_PREFIX: 'tradeflow:',
      },
      max_memory_restart: '512M',
      error_file: '/var/log/tradeflow/api-error.log',
      out_file: '/var/log/tradeflow/api-out.log',
      time: true,
    },
    {
      name: 'tradeflow-worker',
      cwd: '/var/www/tradeflow',
      script: 'npm',
      args: 'run start:worker',
      env: {
        NODE_ENV: 'production',
        REDIS_URL: 'redis://127.0.0.1:6379/8',
        REDIS_PREFIX: 'tradeflow:',
      },
      max_memory_restart: '512M',
      error_file: '/var/log/tradeflow/worker-error.log',
      out_file: '/var/log/tradeflow/worker-out.log',
      time: true,
    },
  ],
};
