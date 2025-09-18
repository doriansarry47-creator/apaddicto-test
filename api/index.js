import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from '../server-dist/routes.js';

// Pour obtenir __dirname dans ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === INITIALISATION EXPRESS ===
const app = express();

// === CONFIG CORS POUR VERCEL ===
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-vercel-domain.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// === PARSING JSON ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === SESSION POUR VERCEL ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-vercel',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true
  },
}));

// === ENDPOINTS DE BASE ===
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
    platform: 'vercel'
  });
});

// === ROUTES DE L'APPLICATION ===
try {
  registerRoutes(app);
} catch (error) {
  console.error('Erreur lors de l\'enregistrement des routes:', error);
}

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur Vercel:', err);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// === HANDLER VERCEL ===
export default async function handler(req, res) {
  try {
    // Configuration spécifique pour Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Normaliser le path pour l'application Express
    const originalUrl = req.url;
    if (!originalUrl.startsWith('/api/')) {
      req.url = '/api' + originalUrl;
    }

    // Utiliser Express comme handler
    await new Promise((resolve, reject) => {
      app(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('API Handler Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
      });
    }
  }
}