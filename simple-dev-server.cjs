const express = require('express');
const path = require('path');

const app = express();

// Configuration des types MIME pour les fichiers TypeScript/JSX
express.static.mime.define({
  'application/javascript': ['ts', 'tsx', 'jsx']
});

// Middleware pour servir les fichiers avec les bons headers
app.use((req, res, next) => {
  if (req.url.endsWith('.ts') || req.url.endsWith('.tsx') || req.url.endsWith('.jsx')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Servir les fichiers du client
app.use(express.static(path.join(__dirname, 'client')));

// Proxy API vers le port 3000
app.use('/api/*', (req, res) => {
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  });

  if (req.body) {
    proxy.write(JSON.stringify(req.body));
  }
  proxy.end();
});

// Fallback pour SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const PORT = 5173;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dev server running on port ${PORT}`);
});
