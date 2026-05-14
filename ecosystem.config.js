module.exports = {
  apps: [
    {
      name: 'evolution-api',
      script: 'dist/main.js',
      cwd: '/home/percy/evolution-api',
      log_file: '/home/percy/evolution-api/logs/pm2-out.log',
      error_file: '/home/percy/evolution-api/logs/pm2-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
