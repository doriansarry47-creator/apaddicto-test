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

async function testHealthEndpoint() {
  console.log('\n🔍 Test 1: Endpoint de santé');
  try {
    const { response } = await makeRequest(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Santé serveur:', data);
    return true;
  } catch (error) {
    console.error('❌ Erreur santé serveur:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n🔍 Test 2: Inscription d\'un utilisateur patient');
  
  const userData = {
    email: `patient_${Date.now()}@test.com`,
    password: 'motdepasse123',
    firstName: 'Jean',
    lastName: 'Patient',
    role: 'patient'
  };

  try {
    const { response } = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error(`❌ Erreur inscription (${response.status}):`, responseText);
      return { success: false, error: responseText };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Réponse non-JSON:', responseText);
      return { success: false, error: 'Invalid JSON response' };
    }

    console.log('✅ Inscription réussie:', data);
    return { success: true, data, user: userData };
  } catch (error) {
    console.error('❌ Erreur réseau inscription:', error.message);
    return { success: false, error: error.message };
  }
}

async function testUserLogin(userData) {
  console.log('\n🔍 Test 3: Connexion utilisateur patient');
  
  try {
    const { response, cookies } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error(`❌ Erreur connexion (${response.status}):`, responseText);
      return { success: false, error: responseText };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Réponse non-JSON:', responseText);
      return { success: false, error: 'Invalid JSON response' };
    }

    console.log('✅ Connexion réussie:', data);
    console.log('🍪 Cookies reçus:', cookies);
    return { success: true, data, cookies };
  } catch (error) {
    console.error('❌ Erreur réseau connexion:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAuthenticatedEndpoint(cookies) {
  console.log('\n🔍 Test 4: Endpoint authentifié (/api/auth/me)');
  
  try {
    const { response } = await makeRequest(`${BASE_URL}/api/auth/me`, {}, cookies);
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);

    if (!response.ok && response.status === 401) {
      console.log('⚠️ Non authentifié (attendu si pas de session)');
      return { success: true, authenticated: false };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Réponse non-JSON:', responseText);
      return { success: false, error: 'Invalid JSON response' };
    }

    console.log('✅ Endpoint authentifié réussi:', data);
    return { success: true, authenticated: true, data };
  } catch (error) {
    console.error('❌ Erreur réseau endpoint authentifié:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAdminRegistration() {
  console.log('\n🔍 Test 5: Inscription admin autorisé');
  
  const adminData = {
    email: 'doriansarry@yahoo.fr',
    password: 'adminpassword123',
    firstName: 'Dorian',
    lastName: 'Sarry',
    role: 'admin'
  };

  try {
    const { response } = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(adminData)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);

    if (!response.ok && response.status === 409) {
      console.log('⚠️ Admin déjà existe (normal si déjà créé)');
      return { success: true, exists: true };
    }

    if (!response.ok) {
      console.error(`❌ Erreur inscription admin (${response.status}):`, responseText);
      return { success: false, error: responseText };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Réponse non-JSON:', responseText);
      return { success: false, error: 'Invalid JSON response' };
    }

    console.log('✅ Inscription admin réussie:', data);
    return { success: true, data, user: adminData };
  } catch (error) {
    console.error('❌ Erreur réseau inscription admin:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDatabaseTables() {
  console.log('\n🔍 Test 6: Tables de la base de données');
  
  try {
    const { response } = await makeRequest(`${BASE_URL}/api/tables`);
    
    if (!response.ok) {
      console.error(`❌ Erreur récupération tables (${response.status})`);
      return { success: false };
    }

    const tables = await response.json();
    console.log('✅ Tables disponibles:', tables);
    return { success: true, tables };
  } catch (error) {
    console.error('❌ Erreur réseau tables:', error.message);
    return { success: false, error: error.message };
  }
}

async function runCompleteTest() {
  console.log('🚀 Début des tests complets d\'authentification pour Apaddicto\n');
  
  // Test 1: Santé serveur
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('❌ Serveur non accessible, arrêt des tests');
    return;
  }

  // Test 2: Tables DB
  await testDatabaseTables();

  // Test 3: Inscription patient
  const registrationResult = await testUserRegistration();
  if (!registrationResult.success) {
    console.log('❌ Inscription patient échouée, continuons avec les autres tests...');
  }

  // Test 4: Connexion patient (si inscription réussie)
  if (registrationResult.success && registrationResult.user) {
    const loginResult = await testUserLogin(registrationResult.user);
    
    if (loginResult.success && loginResult.cookies) {
      // Test 5: Endpoint authentifié
      await testAuthenticatedEndpoint(loginResult.cookies);
    }
  }

  // Test 6: Inscription admin
  await testAdminRegistration();

  console.log('\n🏁 Tests terminés !');
}

// Exécuter les tests
runCompleteTest().catch(error => {
  console.error('💥 Erreur critique:', error);
  process.exit(1);
});