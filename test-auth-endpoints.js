#!/usr/bin/env node

/**
 * Test des endpoints d'authentification
 */

import 'dotenv/config';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

console.log('🔍 Test des endpoints d'authentification...\n');

// Démarrer le serveur en arrière-plan pour les tests
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function startServer() {
  console.log('🚀 Démarrage du serveur de test...');
  const server = spawn('npm', ['run', 'dev'], { 
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: process.cwd()
  });
  
  // Attendre que le serveur démarre
  await setTimeout(5000);
  
  return server;
}

async function testEndpoint(path, method = 'GET', body = null) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { text: data };
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: jsonData
    };
  } catch (error) {
    return {
      error: error.message,
      status: 0
    };
  }
}

async function runTests() {
  const server = await startServer();
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Test de l\'endpoint de santé...');
    const health = await testEndpoint('/api/health');
    if (health.ok) {
      console.log('   ✅ Health endpoint OK');
    } else {
      console.log(`   ❌ Health endpoint failed: ${health.status}`);
    }
    
    // Test 2: Test de base de données
    console.log('\n2️⃣ Test de l\'endpoint de test DB...');
    const dbTest = await testEndpoint('/api/test-db');
    if (dbTest.ok) {
      console.log('   ✅ DB test endpoint OK');
    } else {
      console.log(`   ❌ DB test endpoint failed: ${dbTest.status}`);
    }
    
    // Test 3: Inscription avec un email unique
    console.log('\n3️⃣ Test d\'inscription...');
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const register = await testEndpoint('/api/auth/register', 'POST', {
      email: uniqueEmail,
      password: 'test123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (register.ok) {
      console.log('   ✅ Inscription réussie');
      console.log(`   📧 Email utilisé: ${uniqueEmail}`);
    } else {
      console.log(`   ❌ Inscription échouée: ${register.status}`);
      console.log(`   📄 Réponse: ${JSON.stringify(register.data)}`);
    }
    
    // Test 4: Tentative d'inscription avec le même email
    console.log('\n4️⃣ Test de gestion d\'email dupliqué...');
    const duplicateRegister = await testEndpoint('/api/auth/register', 'POST', {
      email: uniqueEmail,
      password: 'test456',
      firstName: 'Autre',
      lastName: 'User'
    });
    
    if (!duplicateRegister.ok && duplicateRegister.status === 409) {
      console.log('   ✅ Gestion des emails dupliqués OK');
    } else {
      console.log(`   ❌ Gestion des emails dupliqués échouée: ${duplicateRegister.status}`);
      console.log(`   📄 Réponse: ${JSON.stringify(duplicateRegister.data)}`);
    }
    
    // Test 5: Connexion
    console.log('\n5️⃣ Test de connexion...');
    const login = await testEndpoint('/api/auth/login', 'POST', {
      email: uniqueEmail,
      password: 'test123'
    });
    
    if (login.ok) {
      console.log('   ✅ Connexion réussie');
    } else {
      console.log(`   ❌ Connexion échouée: ${login.status}`);
      console.log(`   📄 Réponse: ${JSON.stringify(login.data)}`);
    }
    
    console.log('\n✅ Tests d\'authentification terminés !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    // Arrêter le serveur
    server.kill('SIGTERM');
    
    // Attendre un peu puis forcer l'arrêt si nécessaire
    setTimeout(() => {
      server.kill('SIGKILL');
      process.exit(0);
    }, 2000);
  }
}

// Seulement pour test manuel
if (process.argv[2] === '--run') {
  runTests();
} else {
  console.log('ℹ️  Pour exécuter les tests, utilisez: node test-auth-endpoints.js --run');
  console.log('⚠️  Assurez-vous que le port 3000 est libre');
}