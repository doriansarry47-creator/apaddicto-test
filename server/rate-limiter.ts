// Simple in-memory rate limiter
interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 tentatives par 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      return false;
    }

    // Reset si la fenêtre de temps est expirée
    if (now > entry.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }

    return entry.attempts >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre de temps
      this.attempts.set(identifier, {
        attempts: 1,
        resetTime: now + this.windowMs
      });
    } else {
      // Incrémenter dans la fenêtre actuelle
      entry.attempts++;
    }
  }

  getRemainingTime(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) return 0;
    
    return Math.max(0, entry.resetTime - Date.now());
  }

  // Nettoyer les entrées expirées (à appeler périodiquement)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 tentatives par 15 minutes
export const generalRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requêtes par minute

// Nettoyer les rate limiters toutes les heures
setInterval(() => {
  authRateLimiter.cleanup();
  generalRateLimiter.cleanup();
}, 60 * 60 * 1000);

export { RateLimiter };