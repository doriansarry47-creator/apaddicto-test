import { createRequire } from 'module';
import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configure Neon
neonConfig.webSocketConstructor = ws;

const app = express();
const port = 3000;

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('Starting Apaddicto server...');
console.log('Database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

let db;

try {
  const pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool });
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Database initialization failed:', error);
}

app.use(express.json());

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    const result = await db.execute(sql`SELECT 1 as test, NOW() as current_time`);
    console.log('Database test successful:', result.rows);
    res.json({ 
      ok: true, 
      message: 'Database connection successful', 
      result: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'apaddicto-server',
    timestamp: new Date().toISOString()
  });
});

// Static file serving
app.use(express.static('dist/public'));

// Catch all for SPA
app.get('*', (req, res) => {
  res.sendFile('dist/public/index.html', { root: '/home/user/webapp' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Apaddicto server is running on http://0.0.0.0:${port}`);
  console.log(`📊 Health check: http://0.0.0.0:${port}/health`);
  console.log(`🔍 Database test: http://0.0.0.0:${port}/api/test-db`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});