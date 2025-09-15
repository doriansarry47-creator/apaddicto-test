#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@apaddicto.com';
const ADMIN_PASSWORD = 'admin123';

let sessionCookie = null;

// Fonction pour effectuer des requêtes avec cookies
async function apiRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie && { 'Cookie': sessionCookie })
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${url}`, options);
  
  // Capturer le cookie de session
  if (response.headers.get('set-cookie')) {
    sessionCookie = response.headers.get('set-cookie');
    console.log('🍪 Session cookie captured:', sessionCookie.substring(0, 50) + '...');
  }
  
  return response;
}

async function testAuthentication() {
  console.log('\n🔐 Test: Authentification admin');
  
  try {
    // Connexion admin
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${await loginResponse.text()}`);
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Connexion admin réussie:', loginResult.user?.email, 'Role:', loginResult.user?.role);
    
    // Vérifier le statut de connexion
    const meResponse = await apiRequest('GET', '/api/auth/me');
    const meResult = await meResponse.json();
    console.log('✅ Status check:', meResult.user?.email, 'Role:', meResult.user?.role);
    
    return meResult.user;
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    return null;
  }
}

async function testExerciseCreation() {
  console.log('\n💪 Test: Création d\'exercice');
  
  try {
    const exerciseData = {
      title: 'Test Exercise - ' + new Date().toISOString(),
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 10,
      description: 'Exercice de test créé automatiquement',
      instructions: 'Instructions de test',
      benefits: 'Bénéfices de test'
    };
    
    console.log('📝 Données de l\'exercice:', exerciseData);
    
    const createResponse = await apiRequest('POST', '/api/exercises', exerciseData);
    
    console.log('📊 Status de la réponse:', createResponse.status);
    console.log('📊 Headers:', Object.fromEntries(createResponse.headers.entries()));
    
    const responseText = await createResponse.text();
    console.log('📊 Réponse brute:', responseText);
    
    if (!createResponse.ok) {
      throw new Error(`Exercise creation failed: ${createResponse.status} ${responseText}`);
    }
    
    const result = JSON.parse(responseText);
    console.log('✅ Exercice créé avec succès:', result.id);
    
    return result;
  } catch (error) {
    console.error('❌ Erreur de création d\'exercice:', error.message);
    return null;
  }
}

async function testSessionValidation() {
  console.log('\n🔍 Test: Validation de session');
  
  try {
    // Test avec session actuelle
    const response1 = await apiRequest('GET', '/api/admin/exercises');
    console.log('📊 Admin exercises status:', response1.status);
    
    if (!response1.ok) {
      const errorText = await response1.text();
      console.log('❌ Admin exercises error:', errorText);
    } else {
      const exercises = await response1.json();
      console.log('✅ Admin exercises loaded:', exercises.length, 'exercises found');
    }
    
    // Test du middleware requireAdmin directement
    const response2 = await apiRequest('GET', '/api/auth/me');
    const meResult = await response2.json();
    console.log('🔍 Current session user:', meResult.user);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de validation:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests d\'authentification et création d\'exercices\n');
  
  const user = await testAuthentication();
  if (!user) {
    console.log('❌ Impossible de continuer sans authentification valide');
    return;
  }
  
  if (user.role !== 'admin') {
    console.log('❌ L\'utilisateur n\'est pas admin, impossible de créer des exercices');
    return;
  }
  
  await testSessionValidation();
  await testExerciseCreation();
  
  console.log('\n🎯 Tests terminés');
}

// Lancer les tests
runAllTests().catch(console.error);