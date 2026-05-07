// PM2 ecosystem config for DigitalOcean deployment.
// Usage:
//   pm2 start ecosystem.config.cjs
//   pm2 save
//   pm2 startup   ← run the printed command to survive reboots

module.exports = {
  apps: [
    {
      name: 'pgl-api',
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // stdout/stderr logs — viewable with: pm2 logs pgl-api
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
