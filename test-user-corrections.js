#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'https://3000-ihytedbih8f26l6yhd6e2-6532622b.e2b.dev';
const DEV_BASE = 'https://5173-ihytedbih8f26l6yhd6e2-6532622b.e2b.dev';

console.log('🧪 Tests de validation des corrections utilisateur');
console.log('='.repeat(60));

// Variables de session
let sessionCookie = '';

// Helper pour extraire les cookies
function extractCookies(response) {
  const setCookies = response.headers.get('set-cookie');
  if (setCookies) {
    const cookies = setCookies.split(',').map(cookie => cookie.split(';')[0]).join('; ');
    return cookies;
  }
  return '';
}

async function testAuthentication() {
  console.log('\n📝 Test 1: Authentification');
  
  try {
    // Test inscription
    const registerData = {
      email: 'testuser@corrections.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Corrections',
      role: 'patient'
    };
    
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    
    if (registerResponse.status === 200 || registerResponse.status === 409) {
      console.log('✅ Inscription: OK');
    } else {
      console.log('❌ Inscription échouée:', registerResponse.status);
      return false;
    }
    
    // Test connexion
    const loginData = {
      email: 'testuser@corrections.com',
      password: 'password123'
    };
    
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    
    if (loginResponse.ok) {
      sessionCookie = extractCookies(loginResponse);
      console.log('✅ Connexion: OK');
      console.log('✅ Session établie');
      
      // Vérifier l'authentification
      const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Cookie': sessionCookie }
      });
      
      if (meResponse.ok) {
        const user = await meResponse.json();
        console.log('✅ Vérification utilisateur:', user.user?.email);
        return true;
      }
    }
    
    console.log('❌ Connexion échouée:', loginResponse.status);
    return false;
    
  } catch (error) {
    console.log('❌ Erreur authentification:', error.message);
    return false;
  }
}

async function testBeckAnalysis() {
  console.log('\n🧠 Test 2: Analyse Beck (Colonne de Beck)');
  
  try {
    // Tester l'enregistrement d'une analyse Beck
    const beckData = {
      situation: "Test de situation difficile",
      automaticThoughts: "Pensées automatiques négatives",
      emotions: "Anxiété, stress",
      emotionIntensity: 8,
      rationalResponse: "Réponse plus équilibrée",
      newFeeling: "Plus calme",
      newIntensity: 5
    };
    
    const createResponse = await fetch(`${API_BASE}/api/beck-analyses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify(beckData),
    });
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Création analyse Beck: OK');
      console.log('  - ID:', result.id);
      console.log('  - Réduction émotionnelle:', beckData.emotionIntensity - beckData.newIntensity, 'points');
      
      // Vérifier la récupération
      const getResponse = await fetch(`${API_BASE}/api/beck-analyses`, {
        headers: { 'Cookie': sessionCookie }
      });
      
      if (getResponse.ok) {
        const analyses = await getResponse.json();
        const found = analyses.find(a => a.id === result.id);
        if (found) {
          console.log('✅ Récupération analyse Beck: OK');
          console.log('  - Situation sauvegardée:', found.situation.substring(0, 30) + '...');
          return true;
        }
      }
    }
    
    console.log('❌ Test analyse Beck échoué:', createResponse.status);
    return false;
    
  } catch (error) {
    console.log('❌ Erreur analyse Beck:', error.message);
    return false;
  }
}

async function testStrategies() {
  console.log('\n💪 Test 3: Stratégies Anti-Craving');
  
  try {
    // Tester l'enregistrement de stratégies
    const strategiesData = {
      strategies: [
        {
          context: "home",
          exercise: "Test: 15 pompes rapides",
          effort: "modéré",
          duration: 5,
          cravingBefore: 8,
          cravingAfter: 3
        },
        {
          context: "work",
          exercise: "Test: Respiration 4-7-8",
          effort: "faible", 
          duration: 3,
          cravingBefore: 6,
          cravingAfter: 2
        }
      ]
    };
    
    const createResponse = await fetch(`${API_BASE}/api/strategies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify(strategiesData),
    });
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Création stratégies: OK');
      console.log('  - Nombre sauvegardé:', result.count);
      console.log('  - Efficacité moyenne:', 
        result.strategies.reduce((sum, s) => sum + (s.cravingBefore - s.cravingAfter), 0) / result.strategies.length, 
        'points'
      );
      
      // Vérifier la récupération
      const getResponse = await fetch(`${API_BASE}/api/strategies`, {
        headers: { 'Cookie': sessionCookie }
      });
      
      if (getResponse.ok) {
        const strategies = await getResponse.json();
        const testStrategies = strategies.filter(s => s.exercise.startsWith('Test:'));
        if (testStrategies.length >= 2) {
          console.log('✅ Récupération stratégies: OK');
          console.log('  - Stratégies trouvées:', testStrategies.length);
          console.log('  - Contextes testés:', [...new Set(testStrategies.map(s => s.context))].join(', '));
          return true;
        }
      }
    }
    
    console.log('❌ Test stratégies échoué:', createResponse.status);
    return false;
    
  } catch (error) {
    console.log('❌ Erreur stratégies:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('\n🌐 Test 4: Accès Frontend');
  
  try {
    // Test accès à la page d'accueil (dev server)
    const devResponse = await fetch(DEV_BASE, { 
      method: 'GET',
      timeout: 10000 
    });
    
    if (devResponse.ok) {
      const content = await devResponse.text();
      if (content.includes('Apaddicto') || content.includes('<!DOCTYPE html>')) {
        console.log('✅ Page d\'accueil accessible: OK');
        console.log('  - URL dev server:', DEV_BASE);
        
        // Test page de login
        const loginPageResponse = await fetch(`${DEV_BASE}/login`);
        if (loginPageResponse.ok) {
          console.log('✅ Page de connexion accessible: OK');
        }
        
        return true;
      }
    }
    
    console.log('❌ Frontend non accessible');
    return false;
    
  } catch (error) {
    console.log('❌ Erreur accès frontend:', error.message);
    return false;
  }
}

async function runAllTests() {
  const results = {
    auth: false,
    beck: false,
    strategies: false,
    frontend: false
  };
  
  results.auth = await testAuthentication();
  
  if (results.auth) {
    results.beck = await testBeckAnalysis();
    results.strategies = await testStrategies();
  }
  
  results.frontend = await testFrontendAccess();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  
  console.log(`🔐 Authentification: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🧠 Analyse Beck: ${results.beck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`💪 Stratégies Anti-Craving: ${results.strategies ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🌐 Accès Frontend: ${results.frontend ? '✅ PASS' : '❌ FAIL'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n📈 Score global: ${passed}/${total} tests réussis`);
  
  if (passed === total) {
    console.log('🎉 TOUTES LES CORRECTIONS VALIDÉES !');
    console.log('👍 L\'application est prête pour les utilisateurs');
  } else {
    console.log('⚠️  Des corrections supplémentaires sont nécessaires');
  }
  
  console.log('\n🔗 URLs pour les tests manuels:');
  console.log('   • Backend API:', API_BASE);
  console.log('   • Frontend Dev:', DEV_BASE);
  console.log('   • Test avec: test@example.com / password123');
}

// Exécuter les tests
runAllTests().catch(console.error);
