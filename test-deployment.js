#!/usr/bin/env node
/**
 * Script de test pour valider le déploiement Vercel
 */

import fetch from 'node-fetch';

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, method = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.text();
    
    return {
      status: response.status,
      data: data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: error.message,
      success: false
    };
  }
}

async function runTests() {
  log('🚀 Test du déploiement Apaddicto sur Vercel', 'blue');
  log(`📍 URL de base: ${BASE_URL}`, 'yellow');
  log('');

  const tests = [
    {
      name: 'Test de la page d\'accueil',
      url: `${BASE_URL}/`,
      expected: 200
    },
    {
      name: 'Test de la connexion base de données',
      url: `${BASE_URL}/api/test-db`,
      expected: 200
    },
    {
      name: 'Test des exercices (API)',
      url: `${BASE_URL}/api/exercises`,
      expected: 200
    },
    {
      name: 'Test du contenu psycho-éducatif (API)',
      url: `${BASE_URL}/api/psycho-education`,
      expected: 200
    },
    {
      name: 'Test de l\'endpoint d\'authentification',
      url: `${BASE_URL}/api/auth/me`,
      expected: 401 // Non authentifié, mais l'endpoint doit répondre
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`⏳ ${test.name}... `);
    
    const result = await testEndpoint(test.url);
    
    if (result.status === test.expected) {
      log('✅ SUCCÈS', 'green');
      passed++;
    } else {
      log(`❌ ÉCHEC (${result.status})`, 'red');
      if (result.data) {
        log(`   Erreur: ${result.data.substring(0, 200)}`, 'red');
      }
      failed++;
    }
  }

  log('');
  log('📊 RÉSUMÉ DES TESTS:', 'blue');
  log(`✅ Tests réussis: ${passed}`, 'green');
  log(`❌ Tests échoués: ${failed}`, failed > 0 ? 'red' : 'reset');
  
  if (failed === 0) {
    log('🎉 Tous les tests sont passés ! L\'application est prête.', 'green');
  } else {
    log('⚠️  Certains tests ont échoué. Vérifiez la configuration.', 'yellow');
  }

  return failed === 0;
}

// Test supplémentaire pour créer un utilisateur de test
async function testUserCreation() {
  log('\n🧪 Test de création d\'utilisateur...', 'blue');
  
  const testUser = {
    email: `test.${Date.now()}@apaddicto.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  };

  const result = await testEndpoint(
    `${BASE_URL}/api/auth/register`,
    'POST',
    testUser
  );

  if (result.success) {
    log('✅ Création d\'utilisateur réussie', 'green');
    return true;
  } else {
    log(`❌ Création d\'utilisateur échouée: ${result.data}`, 'red');
    return false;
  }
}

// Exécution des tests
(async () => {
  const basicTestsPass = await runTests();
  
  if (basicTestsPass) {
    await testUserCreation();
  }
  
  process.exit(basicTestsPass ? 0 : 1);
})();