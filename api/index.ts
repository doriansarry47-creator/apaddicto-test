// api/index.ts - Vercel Serverless Function Entry Point
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { registerRoutes } from '../server/routes.js';
import '../server/migrate.js';
import { debugTablesRouter } from '../server/debugTables.js';
import { vercelSessionMiddleware } from '../server/vercel-session.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Créer l'application Express
const app = express();

// Configuration CORS adaptée à Vercel
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true,
}));

// Parsing JSON
app.use(express.json());

// Configuration session pour Vercel
app.use(vercelSessionMiddleware);

// Endpoints de base
app.get('/', (_req, res) => {
  res.json({
    message: '✅ API Apaddicto est en ligne sur Vercel!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running on Vercel!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// Enregistrer toutes les routes de l'application
registerRoutes(app);
app.use('/debug', debugTablesRouter);

// Middleware de gestion d'erreurs
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Erreur serveur Vercel:', err);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal error'
  });
});

// Export par défaut pour Vercel
export default app;
