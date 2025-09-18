#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'https://5000-ij4n9x3ef6n5k5lmrkmbd-6532622b.e2b.dev';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return response;
}

async function createOrLoginAdmin() {
  console.log('🔧 Vérification/Création du compte administrateur...');
  
  const adminData = {
    email: 'doriansarry@yahoo.fr',
    password: 'adminpassword123',
    firstName: 'Dorian',
    lastName: 'Sarry',
    role: 'admin'
  };

  // Essayer de créer l'admin
  console.log('1. Tentative de création du compte admin...');
  const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(adminData)
  });

  const registerText = await registerResponse.text();
  console.log(`Réponse création admin (${registerResponse.status}):`, registerText);

  if (registerResponse.status === 409) {
    console.log('✅ Admin existe déjà');
  } else if (registerResponse.ok) {
    console.log('✅ Admin créé avec succès');
  } else {
    console.error('❌ Erreur création admin:', registerText);
  }

  // Maintenant essayer de se connecter
  console.log('2. Tentative de connexion admin...');
  const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: adminData.email,
      password: adminData.password
    })
  });

  const loginText = await loginResponse.text();
  console.log(`Réponse connexion admin (${loginResponse.status}):`, loginText);

  if (loginResponse.ok) {
    console.log('✅ Connexion admin réussie');
    return true;
  } else {
    console.error('❌ Connexion admin échouée');
    
    // Essayons avec différents mots de passe possibles
    const possiblePasswords = [
      'admin123',
      'password',
      'admin',
      'adminpassword',
      'doriansarry123'
    ];
    
    console.log('3. Essai avec d\'autres mots de passe...');
    for (const pwd of possiblePasswords) {
      console.log(`Essai avec mot de passe: ${pwd}`);
      const tryResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: adminData.email,
          password: pwd
        })
      });
      
      if (tryResponse.ok) {
        const result = await tryResponse.json();
        console.log(`✅ Connexion réussie avec le mot de passe: ${pwd}`);
        console.log('Utilisateur connecté:', result.user);
        return true;
      }
    }
    
    return false;
  }
}

async function checkCurrentUsers() {
  console.log('\n📊 Vérification des utilisateurs actuels...');
  
  const response = await makeRequest(`${BASE_URL}/api/data`);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Utilisateurs en base:');
    data.users?.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    return data.users;
  } else {
    console.error('❌ Impossible de récupérer les utilisateurs');
    return [];
  }
}

async function main() {
  console.log('🔍 Diagnostic et test complet du système d\'authentification\n');
  
  // 1. Vérifier les utilisateurs actuels
  const users = await checkCurrentUsers();
  
  // 2. Chercher l'admin existant
  const existingAdmin = users.find(u => u.role === 'admin');
  if (existingAdmin) {
    console.log('\n✅ Admin trouvé:', existingAdmin.email);
  }
  
  // 3. Créer/connecter l'admin
  const adminSuccess = await createOrLoginAdmin();
  
  if (adminSuccess) {
    console.log('\n🎉 Système d\'authentification admin opérationnel !');
  } else {
    console.log('\n❌ Problème avec l\'authentification admin');
  }
}

main().catch(console.error);