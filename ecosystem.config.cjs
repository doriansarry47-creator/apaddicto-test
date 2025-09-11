module.exports = {
  apps: [
    {
      name: 'apaddicto-server',
      script: 'npx',
      args: 'tsx server/index.ts',
      cwd: '/home/user/webapp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        SESSION_SECRET: 'Apaddicto2024SecretKey',
        PORT: 5000
      }
    }
  ]
};