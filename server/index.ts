import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { registerRoutes } from './routes.js';
import './migrate.js';
import { debugTablesRouter } from './debugTables.js';
import { Pool } from 'pg';

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
  res.send('API Apaddcito est en ligne !');
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// === ROUTES DE L'APPLICATION ===
registerRoutes(app);
app.use('/api', debugTablesRouter);

// === CONNEXION POSTGRES ===
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'apaddcito',
  password: process.env.DB_PASSWORD || 'ton_mot_de_passe',
  port: Number(process.env.DB_PORT) || 5432,
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

    const data: Record<string, any[]> = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table};`);
      data[table] = result.rows;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ message: 'Erreur interne' });
});

// === DEBUG ROUTES DISPONIBLES ===
console.log("Routes disponibles :");
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

// === LANCEMENT DU SERVEUR ===
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
