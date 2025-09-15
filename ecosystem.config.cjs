module.exports = {
  apps: [
    {
      name: 'apaddicto-server',
      script: 'server-dist/index.js',
      cwd: '/home/user/webapp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        SESSION_SECRET: 'Apaddicto2024SecretKey',
        PORT: 5000
      }
    }
  ]
};