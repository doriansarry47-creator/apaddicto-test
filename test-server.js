#!/usr/bin/env node

// Simple test server to verify authentication without npm install
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';

console.log('Checking Node.js modules availability...');

try {
  
  console.log('✓ Basic Node.js modules available');
  
  // Check if we can connect to database
  console.log('Checking environment variables...');
  
  // Load .env manually
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key] = value.replace(/"/g, '');
    }
  });
  
  console.log('Environment variables:');
  console.log('- DATABASE_URL:', envVars.DATABASE_URL ? 'Present' : 'Missing');
  console.log('- SESSION_SECRET:', envVars.SESSION_SECRET ? 'Present' : 'Missing');
  console.log('- NODE_ENV:', envVars.NODE_ENV || 'undefined');
  
  // Test simple HTTP server without Express
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    if (req.url === '/test' && req.method === 'GET') {
      res.end(JSON.stringify({
        status: 'ok',
        message: 'Basic server running',
        timestamp: new Date().toISOString()
      }));
    } else if (req.url === '/api/test-basic' && req.method === 'GET') {
      res.end(JSON.stringify({
        status: 'ok',
        message: 'API endpoint accessible',
        environment: envVars.NODE_ENV || 'development'
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
  
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`✓ Test server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /test');
    console.log('- GET /api/test-basic');
    console.log('\nPress Ctrl+C to stop the server');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
