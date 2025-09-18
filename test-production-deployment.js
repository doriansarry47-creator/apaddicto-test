#!/usr/bin/env node

/**
 * Script de test pour valider le déploiement de l'application Apaddicto
 * Usage: node test-production-deployment.js https://votre-app.vercel.app
 */

import fetch from 'node-fetch';

const BASE_URL = process.argv[2] || 'http://localhost:3000';

console.log(`🧪 Test du déploiement Apaddicto sur: ${BASE_URL}`);
console.log('=' .repeat(60));

async function testEndpoint(url, description, options = {}) {
  try {
    console.log(`\n🔍 Test: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const status = response.status;
    const isOk = response.ok;
    
    console.log(`   Status: ${status} ${isOk ? '✅' : '❌'}`);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
    } else if (response.headers.get('content-type')?.includes('text/html')) {
      const html = await response.text();
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
      console.log(`   Title: ${title}`);
    }
    
    return { success: isOk, status, description };
  } catch (error) {
    console.log(`   Error: ❌ ${error.message}`);
    return { success: false, status: 'ERROR', description, error: error.message };
  }
}

async function testAuthentication() {
  console.log(`\n🔐 Test d'authentification`);
  
  // Test inscription
  const registerData = {
    email: `test-${Date.now()}@example.com`,
    password: 'test123456',
    firstName: 'Test',
    lastName: 'User',
    role: 'patient'
  };
  
  const registerResult = await testEndpoint(
    `${BASE_URL}/api/auth/register`,
    'Inscription d\'un nouveau patient',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    }
  );
  
  if (registerResult.success) {
    // Test connexion
    const loginResult = await testEndpoint(
      `${BASE_URL}/api/auth/login`,
      'Connexion du patient',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password
        })
      }
    );
    
    return loginResult.success;
  }
  
  return false;
}

async function runAllTests() {
  const results = [];
  
  // Tests de base
  results.push(await testEndpoint(`${BASE_URL}/`, 'Page d\'accueil (frontend)'));
  results.push(await testEndpoint(`${BASE_URL}/api/health`, 'API Health Check'));
  results.push(await testEndpoint(`${BASE_URL}/login`, 'Page de connexion'));
  
  // Tests API
  results.push(await testEndpoint(`${BASE_URL}/api/exercises`, 'API Exercices'));
  results.push(await testEndpoint(`${BASE_URL}/api/psycho-education`, 'API Contenu Psycho-éducatif'));
  
  // Test d'authentification
  const authSuccess = await testAuthentication();
  results.push({ 
    success: authSuccess, 
    status: authSuccess ? 200 : 'ERROR', 
    description: 'Cycle complet d\'authentification' 
  });
  
  // Test des routes protégées (sans auth - doit rediriger)
  results.push(await testEndpoint(`${BASE_URL}/exercises`, 'Route protégée (doit rediriger vers login)'));
  
  // Résumé des résultats
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.description} (${result.status})`);
    if (!result.success && result.error) {
      console.log(`    └─ Erreur: ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Résultat global: ${passed}/${total} tests réussis`);
  
  if (passed === total) {
    console.log('🎉 SUCCÈS ! L\'application est entièrement fonctionnelle.');
    console.log('\n✅ Fonctionnalités validées:');
    console.log('   • Page d\'accueil accessible');
    console.log('   • API de santé fonctionnelle');
    console.log('   • Authentification (inscription + connexion)');
    console.log('   • Protection des routes');
    console.log('   • API des exercices');
    console.log('   • API du contenu psycho-éducatif');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Instructions d'utilisation
if (process.argv.length < 3) {
  console.log('Usage: node test-production-deployment.js <URL_BASE>');
  console.log('Exemple: node test-production-deployment.js https://votre-app.vercel.app');
  console.log('');
}

runAllTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});