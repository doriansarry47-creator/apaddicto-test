// server/vercel-session.ts
import session from 'express-session';
import type { SessionOptions } from 'express-session';

// Configuration de session optimisée pour Vercel
export function getSessionConfig(): SessionOptions {
  return {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-vercel-production',
    resave: false,
    saveUninitialized: false,
    name: 'apaddicto.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS en prod
      httpOnly: true, // Protection contre XSS
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Important pour Vercel
      domain: process.env.NODE_ENV === 'production' ? undefined : undefined
    }
  };
}

// Middleware de session configuré pour Vercel
export const vercelSessionMiddleware = session(getSessionConfig());