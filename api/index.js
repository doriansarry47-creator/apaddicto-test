// Configuration des variables d'environnement
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
}
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ SESSION_SECRET not set, using fallback');
}

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { Pool } from 'pg';

// Imports conditionnels pour éviter les erreurs Vercel
let registerRoutes, debugTablesRouter;
try {
  const routesModule = await import('../server/routes.js');
  registerRoutes = routesModule.registerRoutes;
} catch (e) {
  console.warn('Could not load routes, using fallback');
  registerRoutes = (app) => {
    app.get('/api/fallback', (req, res) => res.json({ message: 'Routes not available' }));
  };
}

try {
  const debugModule = await import('../server/debugTables.js');
  debugTablesRouter = debugModule.debugTablesRouter;
} catch (e) {
  console.warn('Could not load debug tables');
}

try {
  await import('../server/migrate.js');
} catch (e) {
  console.warn('Could not run migrations:', e.message);
}

// === INITIALISATION EXPRESS ===
const app = express();

// === CONFIG CORS ===
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true,
}));

// === PARSING JSON ===
app.use(express.json());

// === SESSION ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

// === ENDPOINTS DE BASE ===
app.get('/', (_req, res) => {
  res.send('API Apaddicto est en ligne !');
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// === ROUTES DE L'APPLICATION ===
if (registerRoutes) {
  registerRoutes(app);
}
if (debugTablesRouter) {
  app.use('/api', debugTablesRouter);
}

// === CONNEXION POSTGRES ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// === ENDPOINT POUR LISTER LES TABLES ===
app.get('/api/tables', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === ENDPOINT POUR RENVOYER LE CONTENU DE TOUTES LES TABLES ===
app.get('/api/data', async (_req, res) => {
  try {
    const tables = [
      "beck_analyses",
      "craving_entries",
      "exercise_sessions",
      "exercises",
      "psycho_education_content",
      "user_badges",
      "user_stats",
      "users"
    ];

    const data = {};

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM ${table};`);
        data[table] = result.rows;
      } catch (tableErr) {
        console.warn(`Table ${table} not found, skipping...`);
        data[table] = [];
      }
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err, _req, res, _next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ message: 'Erreur interne' });
});

// Pour Vercel, on exporte l'app au lieu de l'écouter
export default app;