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
import bcrypt from 'bcryptjs';

// Fonction de migration simple
async function runMigrations(pool) {
  try {
    console.log('🔄 Exécution des migrations...');
    
    // Créer la table users si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Créer la table craving_entries si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS craving_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        intensity INTEGER NOT NULL,
        trigger_type VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Créer la table user_stats si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_exercises INTEGER DEFAULT 0,
        completed_exercises INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Migrations terminées avec succès');
    
  } catch (error) {
    console.warn('⚠️ Erreur lors des migrations:', error.message);
  }
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

// === CONNEXION POSTGRES ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Exécuter les migrations au démarrage
runMigrations(pool);

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

// === ROUTES D'AUTHENTIFICATION ===
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Rechercher l'utilisateur
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const user = userResult.rows[0];
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Stocker l'utilisateur en session
    req.session.userId = user.id;
    
    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'patient' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const newUser = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [email, hashedPassword, firstName, lastName, role]
    );

    const user = newUser.rows[0];
    
    // Stocker l'utilisateur en session
    req.session.userId = user.id;
    
    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    
    if (userResult.rows.length === 0) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const user = userResult.rows[0];
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('Erreur auth/me:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.json({ message: 'Déconnexion réussie' });
  });
});

// === ROUTES BASIQUES POUR LES DONNÉES ===
app.get('/api/cravings/stats', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    // Retourner des stats par défaut pour éviter les erreurs
    res.json({ average: 0, trend: 0 });
  } catch (error) {
    console.error('Erreur cravings/stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/users/stats', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    // Retourner des stats par défaut pour éviter les erreurs
    res.json({ 
      totalExercises: 0,
      completedExercises: 0,
      currentStreak: 0,
      totalPoints: 0
    });
  } catch (error) {
    console.error('Erreur users/stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
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

