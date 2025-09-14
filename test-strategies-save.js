#!/usr/bin/env node

/**
 * Test script pour reproduire et corriger le problème de sauvegarde des stratégies anti-craving
 */

import fetch from 'node-fetch';

const API_BASE = 'https://5000-inh2xlnf1plljns4xtn17-6532622b.e2b.dev';

// Test data
const testStrategies = [
  {
    context: 'leisure',
    exercise: 'Course à pied dans le parc pendant 20 minutes',
    effort: 'modéré',
    duration: 20,
    cravingBefore: 8,
    cravingAfter: 3
  },
  {
    context: 'home', 
    exercise: 'Méditation guidée avec application',
    effort: 'faible',
    duration: 10,
    cravingBefore: 6,
    cravingAfter: 2
  }
];

async function testStrategiesSave() {
  console.log('🧪 Test de sauvegarde des stratégies anti-craving\n');

  try {
    // 1. Test de connectivité
    console.log('1. Test de connectivité API...');
    const healthCheck = await fetch(`${API_BASE}/api/test-db`);
    const healthResult = await healthCheck.json();
    console.log('✅ Base de données:', healthResult.ok ? 'OK' : 'Erreur');

    // 2. Créer un utilisateur de test
    console.log('\n2. Création d\'un utilisateur de test...');
    const userResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        role: 'patient'
      })
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ Erreur création utilisateur:', errorText);
      return;
    }

    const userResult = await userResponse.json();
    console.log('✅ Utilisateur créé:', userResult.user?.email);

    // 3. Test sauvegarde des stratégies  
    console.log('\n3. Test de sauvegarde des stratégies...');
    const strategiesResponse = await fetch(`${API_BASE}/api/strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userResponse.headers.get('set-cookie') || ''
      },
      credentials: 'include',
      body: JSON.stringify({ strategies: testStrategies })
    });

    if (!strategiesResponse.ok) {
      const errorText = await strategiesResponse.text();
      console.error('❌ Erreur sauvegarde stratégies:', errorText);
      console.error('Status:', strategiesResponse.status, strategiesResponse.statusText);
      return;
    }

    const strategiesResult = await strategiesResponse.json();
    console.log('✅ Stratégies sauvegardées:', strategiesResult.strategies?.length || 0);

    // 4. Vérifier la récupération des stratégies
    console.log('\n4. Test de récupération des stratégies...');
    const getResponse = await fetch(`${API_BASE}/api/strategies`, {
      headers: {
        'Cookie': userResponse.headers.get('set-cookie') || ''
      },
      credentials: 'include'
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('❌ Erreur récupération stratégies:', errorText);
      return;
    }

    const getResult = await getResponse.json();
    console.log('✅ Stratégies récupérées:', getResult.length);
    console.log('📋 Détails:', getResult.map(s => ({ 
      exercise: s.exercise.substring(0, 30) + '...', 
      context: s.context,
      effectiveness: s.cravingBefore - s.cravingAfter
    })));

    console.log('\n🎉 Tous les tests passés avec succès!');

  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exécuter le test
testStrategiesSave();