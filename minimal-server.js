#!/usr/bin/env node

import fs from 'fs';
import http from 'http';
import crypto from 'crypto';
import url from 'url';
import path from 'path';

// Load environment variables
function loadEnv() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value.replace(/"/g, '');
    }
  });
}

// Simple in-memory session store (for development)
const sessions = new Map();
const users = new Map();

// Simple password hashing
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + process.env.SESSION_SECRET).digest('hex');
}

// Generate session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Get session from cookie
function getSession(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  const sessionId = cookies['connect.sid'];
  return sessionId ? sessions.get(sessionId) : null;
}

// Set session cookie
function setSessionCookie(res, sessionId) {
  res.setHeader('Set-Cookie', `connect.sid=${sessionId}; HttpOnly; Path=/; SameSite=Lax`);
}

// Create a basic user (for testing)
function createTestUser() {
  const userId = 'test-user-1';
  users.set('test@example.com', {
    id: userId,
    email: 'test@example.com',
    password: hashPassword('test123'),
    firstName: 'Test',
    lastName: 'User',
    role: 'patient'
  });
  
  users.set('admin@example.com', {
    id: 'admin-user-1',
    email: 'admin@example.com',
    password: hashPassword('admin123'),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  });
  
  console.log('✓ Test users created:');
  console.log('  - test@example.com / test123 (patient)');
  console.log('  - admin@example.com / admin123 (admin)');
}

// Serve static files
function serveStatic(res, filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
}

// HTML pages
const LOGIN_PAGE = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apaddicto - Connexion</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div id="app"></div>
    
    <script type="text/babel">
        const { useState } = React;
        
        function LoginApp() {
            const [activeTab, setActiveTab] = useState('login');
            const [loginForm, setLoginForm] = useState({ email: '', password: '' });
            const [registerForm, setRegisterForm] = useState({ 
                email: '', password: '', firstName: '', lastName: '', role: 'patient' 
            });
            const [message, setMessage] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            
            const handleLogin = async (e) => {
                e.preventDefault();
                setIsLoading(true);
                setMessage('');
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(loginForm)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        setMessage('Connexion réussie! Redirection...');
                        setTimeout(() => window.location.href = '/dashboard', 1000);
                    } else {
                        setMessage(data.message || 'Erreur de connexion');
                    }
                } catch (error) {
                    setMessage('Erreur de connexion: ' + error.message);
                } finally {
                    setIsLoading(false);
                }
            };
            
            const handleRegister = async (e) => {
                e.preventDefault();
                setIsLoading(true);
                setMessage('');
                
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(registerForm)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        setMessage('Inscription réussie! Redirection...');
                        setTimeout(() => window.location.href = '/dashboard', 1000);
                    } else {
                        setMessage(data.message || 'Erreur d\\'inscription');
                    }
                } catch (error) {
                    setMessage('Erreur d\\'inscription: ' + error.message);
                } finally {
                    setIsLoading(false);
                }
            };
            
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apaddicto</h1>
                            <p className="text-gray-600">Votre parcours de bien-être commence ici</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex mb-6">
                                <button 
                                    className={\`flex-1 py-2 px-4 text-center \${activeTab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} rounded-l-md\`}
                                    onClick={() => setActiveTab('login')}
                                >
                                    Connexion
                                </button>
                                <button 
                                    className={\`flex-1 py-2 px-4 text-center \${activeTab === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} rounded-r-md\`}
                                    onClick={() => setActiveTab('register')}
                                >
                                    Inscription
                                </button>
                            </div>
                            
                            {message && (
                                <div className={\`mb-4 p-3 rounded-md \${message.includes('réussie') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                                    {message}
                                </div>
                            )}
                            
                            {activeTab === 'login' ? (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Connexion...' : 'Se connecter'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={registerForm.firstName}
                                                onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={registerForm.lastName}
                                                onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={registerForm.email}
                                            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={registerForm.password}
                                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Création...' : 'Créer mon compte'}
                                    </button>
                                </form>
                            )}
                            
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Comptes de test : test@example.com / test123 ou admin@example.com / admin123
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        ReactDOM.render(<LoginApp />, document.getElementById('app'));
    </script>
</body>
</html>
`;

const DASHBOARD_PAGE = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apaddicto - Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <div id="app"></div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function Dashboard() {
            const [user, setUser] = useState(null);
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
                fetch('/api/auth/me')
                    .then(res => res.json())
                    .then(data => {
                        if (data.user) {
                            setUser(data.user);
                        } else {
                            window.location.href = '/login';
                        }
                    })
                    .catch(() => {
                        window.location.href = '/login';
                    })
                    .finally(() => setLoading(false));
            }, []);
            
            const handleLogout = async () => {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                } catch (error) {
                    console.error('Logout error:', error);
                }
            };
            
            if (loading) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                );
            }
            
            return (
                <div className="min-h-screen">
                    {/* Navigation */}
                    <nav className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex items-center">
                                    <h1 className="text-xl font-bold text-gray-900">Apaddicto</h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700">
                                        Bonjour {user?.firstName || user?.email}!
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>
                    
                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    🎉 Bienvenue sur votre page d'accueil!
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Félicitations! L'inscription et la connexion fonctionnent parfaitement.
                                </p>
                            </div>
                            
                            {/* User Info Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Informations utilisateur
                                    </h3>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {user?.firstName} {user?.lastName}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}\`}>
                                                    {user?.role}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">ID utilisateur</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                            
                            {/* Success Message */}
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <span className="text-green-500 text-xl">✅</span>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">
                                            Système d'authentification opérationnel
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Inscription d'utilisateur ✓</li>
                                                <li>Connexion d'utilisateur ✓</li>
                                                <li>Gestion des sessions ✓</li>
                                                <li>Protection des routes ✓</li>
                                                <li>Redirection vers la page d'accueil ✓</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Features Cards */}
                            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="text-indigo-500 text-2xl">🏋️</span>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Exercices
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        Disponibles
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="text-green-500 text-2xl">📊</span>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Suivi
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        Prêt
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="text-purple-500 text-2xl">📚</span>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Éducation
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        Disponible
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }
        
        ReactDOM.render(<Dashboard />, document.getElementById('app'));
    </script>
</body>
</html>
`;

// Main server
function createServer() {
  loadEnv();
  createTestUser();
  
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    try {
      // Routes
      if (pathname === '/' || pathname === '/login') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(LOGIN_PAGE);
        
      } else if (pathname === '/dashboard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(DASHBOARD_PAGE);
        
      } else if (pathname === '/api/auth/register' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { email, password, firstName, lastName, role = 'patient' } = body;
        
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email et mot de passe requis' }));
          return;
        }
        
        if (users.has(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Un utilisateur avec cet email existe déjà' }));
          return;
        }
        
        const userId = crypto.randomUUID();
        const user = {
          id: userId,
          email,
          password: hashPassword(password),
          firstName,
          lastName,
          role
        };
        
        users.set(email, user);
        
        // Create session
        const sessionId = generateSessionId();
        sessions.set(sessionId, { userId, email, firstName, lastName, role });
        setSessionCookie(res, sessionId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          user: { id: userId, email, firstName, lastName, role }
        }));
        
      } else if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { email, password } = body;
        
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email et mot de passe requis' }));
          return;
        }
        
        const user = users.get(email);
        if (!user || user.password !== hashPassword(password)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email ou mot de passe incorrect' }));
          return;
        }
        
        // Create session
        const sessionId = generateSessionId();
        sessions.set(sessionId, { 
          userId: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          role: user.role 
        });
        setSessionCookie(res, sessionId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            role: user.role 
          }
        }));
        
      } else if (pathname === '/api/auth/logout' && method === 'POST') {
        const session = getSession(req);
        if (session) {
          const cookieHeader = req.headers.cookie;
          if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
              const [key, value] = cookie.trim().split('=');
              acc[key] = value;
              return acc;
            }, {});
            
            const sessionId = cookies['connect.sid'];
            if (sessionId) {
              sessions.delete(sessionId);
            }
          }
        }
        
        res.setHeader('Set-Cookie', 'connect.sid=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Logout successful' }));
        
      } else if (pathname === '/api/auth/me' && method === 'GET') {
        const session = getSession(req);
        
        if (!session) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ user: null, message: 'Not authenticated' }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          user: {
            id: session.userId,
            email: session.email,
            firstName: session.firstName,
            lastName: session.lastName,
            role: session.role
          }
        }));
        
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
      }
      
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
  });
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Apaddicto Server running on http://localhost:${PORT}`);
    console.log('📝 Available pages:');
    console.log('  - http://localhost:' + PORT + '/login (Login & Register)');
    console.log('  - http://localhost:' + PORT + '/dashboard (Protected Dashboard)');
    console.log('🔐 Test accounts:');
    console.log('  - test@example.com / test123 (patient)');
    console.log('  - admin@example.com / admin123 (admin)');
    console.log('\n✅ Authentication system fully functional!');
  });
  
  return server;
}

// Start server
const server = createServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.close(() => {
    console.log('✅ Server stopped successfully');
    process.exit(0);
  });
});
