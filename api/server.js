import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { Pool } from 'pg';

// Fallback simple authentication helpers
const authenticateUser = async (email, password) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    // Simple password check (in production, use proper hashing)
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password)',
      [email, password]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  } finally {
    await pool.end();
  }
};

const createUser = async (userData) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const result = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role, created_at, updated_at
    `, [userData.email, userData.password, userData.firstName, userData.lastName, userData.role || 'patient']);
    
    return result.rows[0];
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

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
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-therapy-app',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
}));

// === ENDPOINTS DE BASE ===
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
    message: 'Therapy App API is running on Vercel Functions',
    version: '1.0.0'
  });
});

// === AUTHENTICATION ROUTES ===
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Validation de l'email
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Validation du mot de passe
    if (password.length < 4) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 4 caractères' });
    }

    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      role: role || 'patient',
    });

    req.session.user = user;
    res.json({ user });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    req.session.user = user;
    res.json({ user });
  } catch (error) {
    res.status(401).json({
      message: error instanceof Error ? error.message : 'Erreur de connexion'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ user: null, message: 'Not authenticated' });
  }
  
  res.json({ user: req.session.user });
});

// === BASIC DATA ENDPOINTS ===
app.get('/api/exercises', async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const result = await pool.query('SELECT * FROM exercises ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
  } finally {
    await pool.end();
  }
});

app.get('/api/psycho-education', async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const result = await pool.query('SELECT * FROM psycho_education_content ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching psycho-education content:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du contenu' });
  } finally {
    await pool.end();
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err, _req, res, _next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Fallback for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    url: req.originalUrl,
    method: req.method
  });
});

export default app;