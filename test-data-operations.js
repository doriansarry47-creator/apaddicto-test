#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'https://5000-ij4n9x3ef6n5k5lmrkmbd-6532622b.e2b.dev';

// Fonction helper pour les requêtes avec gestion des cookies
async function makeRequest(url, options = {}, cookies = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (cookies) {
    headers['Cookie'] = cookies;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Extraire les cookies de la réponse
  const setCookieHeaders = response.headers.raw()['set-cookie'] || [];
  let newCookies = cookies;
  setCookieHeaders.forEach(cookie => {
    const [cookiePart] = cookie.split(';');
    const [name, value] = cookiePart.split('=');
    if (name && value) {
      newCookies = newCookies.replace(new RegExp(`${name}=[^;]*;?\\s*`), '');
      newCookies += `${name}=${value}; `;
    }
  });

  return { response, cookies: newCookies.trim() };
}

async function loginAsAdmin() {
  console.log('🔑 Connexion en tant qu\'admin...');
  
  const { response, cookies } = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'doriansarry@yahoo.fr',
      password: 'admin123'
    })
  });

  if (!response.ok) {
    console.error('❌ Impossible de se connecter en tant qu\'admin');
    return null;
  }

  const data = await response.json();
  console.log('✅ Connexion admin réussie:', data.user.role);
  return cookies;
}

async function loginAsPatient() {
  console.log('🔑 Création et connexion d\'un patient de test...');
  
  // Créer un patient de test
  const patientData = {
    email: `patient_test_${Date.now()}@test.com`,
    password: 'password123',
    firstName: 'Marie',
    lastName: 'Patiente',
    role: 'patient'
  };

  // S'inscrire
  const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(patientData)
  });

  if (!registerResponse.response.ok) {
    console.error('❌ Impossible de créer le patient de test');
    return null;
  }

  // Se connecter
  const { response, cookies } = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: patientData.email,
      password: patientData.password
    })
  });

  if (!response.ok) {
    console.error('❌ Impossible de se connecter en tant que patient');
    return null;
  }

  const data = await response.json();
  console.log('✅ Connexion patient réussie:', data.user.email);
  return { cookies, userId: data.user.id };
}

async function testExerciseOperations(adminCookies, patientInfo) {
  console.log('\n📚 Test: Opérations sur les exercices');

  // 1. Lister les exercices (public)
  console.log('1. Récupération de la liste des exercices...');
  const { response: exercisesResponse } = await makeRequest(`${BASE_URL}/api/exercises`);
  
  if (exercisesResponse.ok) {
    const exercises = await exercisesResponse.json();
    console.log(`✅ ${exercises.length} exercices récupérés`);
  } else {
    console.error('❌ Erreur récupération exercices');
    return false;
  }

  // 2. Créer un nouvel exercice (admin seulement)
  console.log('2. Création d\'un nouvel exercice (admin)...');
  const newExercise = {
    title: `Exercice de test ${Date.now()}`,
    description: 'Description de test pour l\'exercice',
    type: 'therapeutic',
    category: 'relaxation', // Ajouter la catégorie requise
    difficulty: 'beginner',
    duration: 15,
    instructions: 'Instructions de test'
  };

  const { response: createResponse } = await makeRequest(`${BASE_URL}/api/exercises`, {
    method: 'POST',
    body: JSON.stringify(newExercise)
  }, adminCookies);

  if (createResponse.ok) {
    const createdExercise = await createResponse.json();
    console.log('✅ Exercice créé avec succès:', createdExercise.id);
    return createdExercise.id;
  } else {
    console.error('❌ Erreur création exercice:', await createResponse.text());
    return false;
  }
}

async function testCravingEntries(patientInfo) {
  console.log('\n🎯 Test: Enregistrement des envies');

  // Enregistrer une envie
  const cravingData = {
    intensity: 8,
    trigger: 'Test trigger',
    notes: 'Notes de test pour l\'envie'
  };

  console.log('1. Enregistrement d\'une envie...');
  const { response } = await makeRequest(`${BASE_URL}/api/cravings`, {
    method: 'POST',
    body: JSON.stringify(cravingData)
  }, patientInfo.cookies);

  if (response.ok) {
    const result = await response.json();
    console.log('✅ Envie enregistrée avec succès:', result.id);
    
    // Récupérer l'historique des envies
    console.log('2. Récupération de l\'historique des envies...');
    const { response: historyResponse } = await makeRequest(`${BASE_URL}/api/cravings`, {}, patientInfo.cookies);
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log(`✅ Historique récupéré: ${history.length} entrées`);
      return true;
    } else {
      console.error('❌ Erreur récupération historique envies');
      return false;
    }
  } else {
    console.error('❌ Erreur enregistrement envie:', await response.text());
    return false;
  }
}

async function testExerciseSessions(patientInfo, exerciseId) {
  console.log('\n💪 Test: Sessions d\'exercices');

  if (!exerciseId) {
    console.log('⚠️ Pas d\'exercice disponible pour tester les sessions');
    return false;
  }

  // Enregistrer une session d'exercice
  const sessionData = {
    exerciseId: exerciseId,
    completedAt: new Date().toISOString(),
    notes: 'Session de test complétée avec succès'
  };

  console.log('1. Enregistrement d\'une session d\'exercice...');
  const { response } = await makeRequest(`${BASE_URL}/api/exercise-sessions`, {
    method: 'POST',
    body: JSON.stringify(sessionData)
  }, patientInfo.cookies);

  if (response.ok) {
    const result = await response.json();
    console.log('✅ Session d\'exercice enregistrée:', result.id);
    
    // Récupérer l'historique des sessions
    console.log('2. Récupération de l\'historique des sessions...');
    const { response: historyResponse } = await makeRequest(`${BASE_URL}/api/exercise-sessions`, {}, patientInfo.cookies);
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log(`✅ Historique sessions récupéré: ${history.length} entrées`);
      return true;
    } else {
      console.error('❌ Erreur récupération historique sessions');
      return false;
    }
  } else {
    console.error('❌ Erreur enregistrement session:', await response.text());
    return false;
  }
}

async function testPsychoEducationContent(adminCookies) {
  console.log('\n📖 Test: Contenu psychoéducatif');

  // 1. Lister le contenu existant
  console.log('1. Récupération du contenu psychoéducatif...');
  const { response: contentResponse } = await makeRequest(`${BASE_URL}/api/psycho-education`);
  
  if (contentResponse.ok) {
    const content = await contentResponse.json();
    console.log(`✅ ${content.length} contenus psychoéducatifs récupérés`);
  } else {
    console.error('❌ Erreur récupération contenu psychoéducatif');
    return false;
  }

  // 2. Créer un nouveau contenu (admin seulement)
  console.log('2. Création d\'un nouveau contenu psychoéducatif (admin)...');
  const newContent = {
    title: `Article de test ${Date.now()}`,
    content: 'Contenu de test pour l\'article psychoéducatif',
    category: 'general',
    readingTime: 5
  };

  const { response: createResponse } = await makeRequest(`${BASE_URL}/api/psycho-education`, {
    method: 'POST',
    body: JSON.stringify(newContent)
  }, adminCookies);

  if (createResponse.ok) {
    const createdContent = await createResponse.json();
    console.log('✅ Contenu psychoéducatif créé:', createdContent.id);
    return true;
  } else {
    console.error('❌ Erreur création contenu psychoéducatif:', await createResponse.text());
    return false;
  }
}

async function testUserStats(patientInfo) {
  console.log('\n📊 Test: Statistiques utilisateur');

  const { response } = await makeRequest(`${BASE_URL}/api/users/${patientInfo.userId}/stats`, {}, patientInfo.cookies);

  if (response.ok) {
    const responseText = await response.text();
    if (!responseText) {
      console.log('⚠️ Réponse vide pour les statistiques');
      return false;
    }
    
    try {
      const stats = JSON.parse(responseText);
      console.log('✅ Statistiques utilisateur récupérées:', {
        totalSessions: stats.totalExerciseSessions || 0,
        totalCravings: stats.totalCravingEntries || 0,
        streakDays: stats.currentStreak || 0
      });
      return true;
    } catch (e) {
      console.error('❌ Réponse non-JSON pour les statistiques:', responseText.substring(0, 200));
      return false;
    }
  } else {
    console.error('❌ Erreur récupération statistiques:', await response.text());
    return false;
  }
}

async function runDataOperationsTest() {
  console.log('🚀 Début des tests d\'enregistrement de données\n');

  // 1. Se connecter en tant qu'admin
  const adminCookies = await loginAsAdmin();
  if (!adminCookies) {
    console.log('❌ Tests administrateur impossibles sans connexion admin');
    return;
  }

  // 2. Se connecter en tant que patient
  const patientInfo = await loginAsPatient();
  if (!patientInfo) {
    console.log('❌ Tests patient impossibles sans connexion patient');
    return;
  }

  let results = {
    exercises: false,
    cravings: false,
    sessions: false,
    psychoEducation: false,
    userStats: false
  };

  // 3. Test des exercices
  const exerciseId = await testExerciseOperations(adminCookies, patientInfo);
  results.exercises = !!exerciseId;

  // 4. Test des envies
  results.cravings = await testCravingEntries(patientInfo);

  // 5. Test des sessions d'exercices
  results.sessions = await testExerciseSessions(patientInfo, exerciseId);

  // 6. Test du contenu psychoéducatif
  results.psychoEducation = await testPsychoEducationContent(adminCookies);

  // 7. Test des statistiques utilisateur
  results.userStats = await testUserStats(patientInfo);

  // Résumé
  console.log('\n📋 Résumé des tests:');
  console.log(`📚 Exercices: ${results.exercises ? '✅' : '❌'}`);
  console.log(`🎯 Envies: ${results.cravings ? '✅' : '❌'}`);
  console.log(`💪 Sessions: ${results.sessions ? '✅' : '❌'}`);
  console.log(`📖 Contenu psychoéducatif: ${results.psychoEducation ? '✅' : '❌'}`);
  console.log(`📊 Statistiques: ${results.userStats ? '✅' : '❌'}`);

  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🏁 Tests terminés: ${successCount}/${totalTests} réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Tous les tests d\'enregistrement de données ont réussi !');
  } else {
    console.log('⚠️ Certains tests ont échoué, vérifiez les logs ci-dessus');
  }
}

// Exécuter les tests
runDataOperationsTest().catch(error => {
  console.error('💥 Erreur critique:', error);
  process.exit(1);
});