#!/usr/bin/env node

/**
 * Test complet pour valider les corrections des stratégies anti-craving
 * - Test d'enregistrement via l'API
 * - Test de récupération dans l'onglet Suivi  
 * - Test d'accès dans la routine d'urgence
 */

import { execSync } from 'child_process';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SERVER_URL = 'http://localhost:5000';
const TIMEOUT = 30000; // 30 secondes

console.log('🧪 Test des corrections des stratégies anti-craving...\n');

// Helper function to make HTTP requests
async function makeRequest(method, url, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = createServer.request ? require('http').request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    }) : null;

    if (!req) {
      reject(new Error('Could not create request'));
      return;
    }

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testAPI() {
  console.log('📡 1. Test de l\'API /api/test-db...');
  
  try {
    const response = await makeRequest('GET', `${SERVER_URL}/api/test-db`);
    
    if (response.statusCode === 200) {
      console.log('✅ API de base fonctionnelle');
      return true;
    } else {
      console.log(`❌ API de base échoué: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur API: ${error.message}`);
    return false;
  }
}

async function testUserCreation() {
  console.log('👤 2. Test de création d\'utilisateur...');
  
  const testUser = {
    email: 'test-strategies@example.com',
    password: 'test123456',
    firstName: 'Test',
    lastName: 'Strategies'
  };

  try {
    const response = await makeRequest('POST', `${SERVER_URL}/api/auth/register`, testUser);
    
    if (response.statusCode === 200) {
      console.log('✅ Utilisateur créé avec succès');
      
      // Extract session cookies
      const cookies = response.headers['set-cookie'] || [];
      const sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
      
      if (sessionCookie) {
        console.log('✅ Session établie');
        return sessionCookie.split(';')[0]; // Return just the session part
      } else {
        console.log('⚠️ Session non établie');
        return null;
      }
    } else {
      console.log(`❌ Création utilisateur échouée: ${response.statusCode}`);
      console.log('Response:', response.body);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur création utilisateur: ${error.message}`);
    return null;
  }
}

async function testStrategiesSave(sessionCookie) {
  console.log('💾 3. Test de sauvegarde des stratégies...');
  
  const testStrategies = [
    {
      context: 'leisure',
      exercise: 'Course à pied matinale de 20 minutes',
      effort: 'modéré',
      duration: 20,
      cravingBefore: 8,
      cravingAfter: 3
    },
    {
      context: 'home',
      exercise: 'Méditation guidée et respiration profonde',
      effort: 'faible',
      duration: 15,
      cravingBefore: 6,
      cravingAfter: 2
    },
    {
      context: 'work',
      exercise: 'Étirements au bureau et marche',
      effort: 'faible',
      duration: 10,
      cravingBefore: 7,
      cravingAfter: 4
    }
  ];

  try {
    const response = await makeRequest('POST', `${SERVER_URL}/api/strategies`, 
      { strategies: testStrategies }, sessionCookie);
    
    if (response.statusCode === 200) {
      console.log('✅ Stratégies sauvegardées avec succès');
      const data = JSON.parse(response.body);
      console.log(`   📊 ${data.strategies?.length || data.length} stratégies enregistrées`);
      return true;
    } else {
      console.log(`❌ Sauvegarde stratégies échouée: ${response.statusCode}`);
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur sauvegarde stratégies: ${error.message}`);
    return false;
  }
}

async function testStrategiesRetrieval(sessionCookie) {
  console.log('📋 4. Test de récupération des stratégies...');
  
  try {
    const response = await makeRequest('GET', `${SERVER_URL}/api/strategies`, null, sessionCookie);
    
    if (response.statusCode === 200) {
      const strategies = JSON.parse(response.body);
      
      if (Array.isArray(strategies) && strategies.length > 0) {
        console.log('✅ Stratégies récupérées avec succès');
        console.log(`   📊 ${strategies.length} stratégies trouvées`);
        
        // Verify strategy structure
        const firstStrategy = strategies[0];
        const requiredFields = ['id', 'context', 'exercise', 'effort', 'duration', 'cravingBefore', 'cravingAfter', 'createdAt'];
        const hasAllFields = requiredFields.every(field => firstStrategy.hasOwnProperty(field));
        
        if (hasAllFields) {
          console.log('✅ Structure des stratégies correcte');
          return true;
        } else {
          console.log('❌ Structure des stratégies incorrecte');
          console.log('   Champs manquants:', requiredFields.filter(field => !firstStrategy.hasOwnProperty(field)));
          return false;
        }
      } else {
        console.log('❌ Aucune stratégie trouvée');
        return false;
      }
    } else {
      console.log(`❌ Récupération stratégies échouée: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur récupération stratégies: ${error.message}`);
    return false;
  }
}

function testComponentsExist() {
  console.log('🔍 5. Test de la présence des composants...');
  
  try {
    // Check StrategiesBox component
    const strategiesBoxPath = resolve('./client/src/components/strategies-box.tsx');
    const strategiesBoxContent = readFileSync(strategiesBoxPath, 'utf8');
    
    if (strategiesBoxContent.includes('Boîte à Stratégies Anti-Craving') &&
        strategiesBoxContent.includes('saveStrategiesMutation') &&
        strategiesBoxContent.includes('/api/strategies')) {
      console.log('✅ Composant StrategiesBox correct');
    } else {
      console.log('❌ Composant StrategiesBox problématique');
      return false;
    }
    
    // Check tracking page
    const trackingPath = resolve('./client/src/pages/tracking.tsx');
    const trackingContent = readFileSync(trackingPath, 'utf8');
    
    if (trackingContent.includes('AntiCravingStrategy') &&
        trackingContent.includes('strategies') &&
        trackingContent.includes('/api/strategies')) {
      console.log('✅ Page Suivi/Tracking correcte');
    } else {
      console.log('❌ Page Suivi/Tracking problématique');
      return false;
    }
    
    // Check dashboard for emergency routine access
    const dashboardPath = resolve('./client/src/pages/dashboard.tsx');
    const dashboardContent = readFileSync(dashboardPath, 'utf8');
    
    if (dashboardContent.includes('antiCravingStrategies') &&
        dashboardContent.includes('showEmergencyStrategies') &&
        dashboardContent.includes('Routine d\'Urgence')) {
      console.log('✅ Accès aux stratégies dans routine d\'urgence correct');
    } else {
      console.log('❌ Accès aux stratégies dans routine d\'urgence problématique');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur vérification composants: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Début des tests des stratégies anti-craving\n');
  
  let allTestsPassed = true;
  
  // Test API connectivity
  const apiWorking = await testAPI();
  allTestsPassed = allTestsPassed && apiWorking;
  
  if (!apiWorking) {
    console.log('\n❌ Tests arrêtés - API non accessible');
    return false;
  }
  
  // Test user creation and authentication
  const sessionCookie = await testUserCreation();
  allTestsPassed = allTestsPassed && (sessionCookie !== null);
  
  if (!sessionCookie) {
    console.log('\n❌ Tests arrêtés - Authentification échouée');
    return false;
  }
  
  // Test strategy save
  const saveWorking = await testStrategiesSave(sessionCookie);
  allTestsPassed = allTestsPassed && saveWorking;
  
  // Test strategy retrieval
  if (saveWorking) {
    // Wait a bit for database commit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const retrievalWorking = await testStrategiesRetrieval(sessionCookie);
    allTestsPassed = allTestsPassed && retrievalWorking;
  }
  
  // Test component structure
  const componentsOK = testComponentsExist();
  allTestsPassed = allTestsPassed && componentsOK;
  
  console.log('\n' + '='.repeat(60));
  
  if (allTestsPassed) {
    console.log('🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('✅ La Boîte à Stratégies Anti-Craving fonctionne correctement');
    console.log('✅ Les stratégies sont sauvegardées dans l\'onglet Suivi');
    console.log('✅ Les stratégies sont accessibles dans la routine d\'urgence');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('   Veuillez vérifier les logs ci-dessus pour plus de détails');
  }
  
  return allTestsPassed;
}

// Run the tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Erreur inattendue:', error);
    process.exit(1);
  });