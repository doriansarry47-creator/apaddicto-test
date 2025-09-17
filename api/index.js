import app from './server.js';

// Vercel handler that wraps the Express app
export default function handler(req, res) {
  return app(req, res);
}