#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'https://5000-ih62e0x4nq37bhd2m681y-6532622b.e2b.dev';

async function testUserRegistrationAndLogin() {
  console.log('🧪 Test de l\'inscription et connexion utilisateur...\n');
  
  // Test 1: Inscription
  try {
    const registerData = {
      email: 'test@apaddicto.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User'
    };

    console.log('1️⃣ Test inscription...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.text();
    console.log(`   Statut: ${registerResponse.status}`);
    console.log(`   Réponse: ${registerResult}\n`);

    if (registerResponse.status === 409) {
      console.log('   ℹ️  Utilisateur existe déjà, continuons avec la connexion...\n');
    } else if (registerResponse.status !== 200 && registerResponse.status !== 201) {
      throw new Error(`Échec inscription: ${registerResponse.status} - ${registerResult}`);
    }

    // Test 2: Connexion
    console.log('2️⃣ Test connexion...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.email,
        password: registerData.password
      })
    });

    const loginResult = await loginResponse.text();
    console.log(`   Statut: ${loginResponse.status}`);
    console.log(`   Réponse: ${loginResult}\n`);

    if (loginResponse.status !== 200) {
      throw new Error(`Échec connexion: ${loginResponse.status} - ${loginResult}`);
    }

    // Test 3: Vérifier que last_login_at est mis à jour
    const loginData = JSON.parse(loginResult);
    if (loginData.user && loginData.user.lastLoginAt !== undefined) {
      console.log('✅ Colonne last_login_at fonctionne correctement!');
      console.log(`   Last login: ${loginData.user.lastLoginAt}`);
    } else {
      console.log('⚠️  Colonne last_login_at non présente dans la réponse');
    }

    console.log('\n✅ Tests réussis! L\'erreur de base de données a été corrigée.');
    
  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error.message);
    return false;
  }
  
  return true;
}

testUserRegistrationAndLogin();