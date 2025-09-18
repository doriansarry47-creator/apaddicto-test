module.exports = {
  apps: [{
    name: 'apaddicto-dev',
    script: 'simple-dev-server.cjs',
    watch: false,
    env: {
      NODE_ENV: 'development',
      PORT: 5173
    },
    instances: 1,
    exec_mode: 'fork',
    error_file: './logs/pm2-dev-error.log',
    out_file: './logs/pm2-dev-out.log',
    log_file: './logs/pm2-dev-combined.log',
    time: true
  }]
};
