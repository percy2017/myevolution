module.exports = {
  apps: [{
    name: 'evolution-api',
    script: './dist/main.js',
    cwd: '/home/percy/evolution-api',
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '1G',
    restart_delay: 5000,
    max_restarts: 10,
    exp_backoff_restart_delay: 100,
    watch: false,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
  }]
};
