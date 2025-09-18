import type { Request, Response, NextFunction } from 'express';

// Middleware de sécurité pour nettoyer les entrées utilisateur
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Fonction pour nettoyer récursivement un objet
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return obj
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprime les scripts
        .replace(/javascript:/gi, '') // Supprime javascript:
        .replace(/on\w+\s*=/gi, ''); // Supprime les event handlers
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  // Sanitizer le body, query, et params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

// Middleware de sécurité des headers
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prévenir le clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prévenir le MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Activer la protection XSS du navigateur
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Référer policy pour la confidentialité
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy basique
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self';"
  );

  next();
}

// Middleware de validation de taille de payload
export function validatePayloadSize(maxSize: number = 1024 * 1024) { // 1MB par défaut
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        message: 'Payload trop volumineux'
      });
    }
    
    next();
  };
}

// Middleware anti-CSRF simple (vérification d'origine)
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Ignorer pour les requêtes GET
  if (req.method === 'GET') {
    return next();
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  
  // En développement, être plus permissif
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Vérifier que l'origine correspond à l'hôte
  if (origin && host && !origin.endsWith(host)) {
    return res.status(403).json({
      message: 'Origine non autorisée'
    });
  }
  
  next();
}