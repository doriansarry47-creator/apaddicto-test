import app from './server.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Ensure proper handling for Vercel
    await new Promise((resolve) => {
      app(req, res, resolve);
    });
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}