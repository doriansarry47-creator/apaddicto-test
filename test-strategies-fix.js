#!/usr/bin/env node

// Script de test pour diagnostiquer le problème de sauvegarde des stratégies anti-craving

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testLogin() {
  try {
    // Tenter de se connecter avec un utilisateur de test
    console.log('🔑 Test de connexion...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });
    
    if (!response.ok) {
      console.log('❌ Échec de la connexion, création d\'un utilisateur de test...');
      
      // Créer un utilisateur de test
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123',
          firstName: 'Test',
          lastName: 'User',
          role: 'patient'
        })
      });
      
      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
        return null;
      }
      
      const user = await registerResponse.json();
      console.log('✅ Utilisateur créé avec succès:', user.user?.email);
      return registerResponse.headers.get('set-cookie');
    }
    
    const user = await response.json();
    console.log('✅ Connexion réussie:', user.user?.email);
    return response.headers.get('set-cookie');
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
    return null;
  }
}

async function testStrategiesSave(sessionCookie) {
  try {
    console.log('💾 Test de sauvegarde des stratégies...');
    
    const testStrategies = [
      {
        context: 'leisure',
        exercise: 'Course à pied de 15 minutes dans le parc',
        effort: 'modéré',
        duration: 15,
        cravingBefore: 8,
        cravingAfter: 4
      },
      {
        context: 'home',
        exercise: 'Exercices de respiration profonde',
        effort: 'faible',
        duration: 10,
        cravingBefore: 6,
        cravingAfter: 2
      }
    ];

    const response = await fetch(`${BASE_URL}/api/strategies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie || ''
      },
      body: JSON.stringify({ strategies: testStrategies })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur lors de la sauvegarde:', response.status, error);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Stratégies sauvegardées avec succès:', result.length, 'stratégies');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de sauvegarde:', error.message);
    return false;
  }
}

async function testStrategiesRetrieve(sessionCookie) {
  try {
    console.log('📋 Test de récupération des stratégies...');
    
    const response = await fetch(`${BASE_URL}/api/strategies`, {
      method: 'GET',
      headers: { 
        'Cookie': sessionCookie || ''
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur lors de la récupération:', response.status, error);
      return false;
    }
    
    const strategies = await response.json();
    console.log('✅ Stratégies récupérées:', strategies.length, 'stratégies trouvées');
    
    if (strategies.length > 0) {
      console.log('📄 Première stratégie:', {
        context: strategies[0].context,
        exercise: strategies[0].exercise.substring(0, 50) + '...',
        efficacite: `${strategies[0].cravingBefore} → ${strategies[0].cravingAfter}`
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de récupération:', error.message);
    return false;
  }
}

async function testDatabase() {
  try {
    console.log('🗄️  Test de connexion à la base de données...');
    
    const response = await fetch(`${BASE_URL}/api/test-db`);
    if (!response.ok) {
      console.error('❌ Erreur de connexion à la base de données');
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Base de données accessible:', result);
    return true;
  } catch (error) {
    console.error('❌ Erreur de test de base de données:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests de diagnostic...\n');
  
  // Test 1: Connexion à la base de données
  const dbOk = await testDatabase();
  if (!dbOk) {
    console.log('🛑 Arrêt des tests: problème de base de données');
    return;
  }
  
  console.log();
  
  // Test 2: Authentification
  const sessionCookie = await testLogin();
  if (!sessionCookie) {
    console.log('🛑 Arrêt des tests: problème d\'authentification');
    return;
  }
  
  console.log();
  
  // Test 3: Sauvegarde des stratégies
  const saveOk = await testStrategiesSave(sessionCookie);
  if (!saveOk) {
    console.log('❌ Problème identifié: la sauvegarde des stratégies échoue');
    return;
  }
  
  console.log();
  
  // Test 4: Récupération des stratégies
  const retrieveOk = await testStrategiesRetrieve(sessionCookie);
  if (!retrieveOk) {
    console.log('❌ Problème identifié: la récupération des stratégies échoue');
    return;
  }
  
  console.log('\n✅ Tous les tests sont passés! Le système fonctionne correctement.');
  console.log('💡 Si le problème persiste dans le navigateur, il peut s\'agir d\'un problème côté client (React/cookies/sessions).');
}

runTests().catch(console.error);