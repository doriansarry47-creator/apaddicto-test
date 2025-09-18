#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'https://5000-ij4n9x3ef6n5k5lmrkmbd-6532622b.e2b.dev';

async function testAdminLogin() {
  console.log('🔑 Test de connexion admin avec nouveau mot de passe...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'doriansarry@yahoo.fr',
      password: 'admin123'
    })
  });

  const responseText = await response.text();
  console.log(`Status: ${response.status}`);
  console.log('Response:', responseText);

  if (response.ok) {
    const data = JSON.parse(responseText);
    console.log('✅ Connexion admin réussie !');
    console.log('Utilisateur:', data.user);
    return true;
  } else {
    console.error('❌ Échec connexion admin');
    return false;
  }
}

testAdminLogin();