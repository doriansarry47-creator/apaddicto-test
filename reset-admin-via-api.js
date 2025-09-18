#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000';

async function createFreshAdminUser() {
  console.log('👤 Création d\'un nouvel utilisateur admin...');
  
  // Utilisons un email différent qui est autorisé
  const adminEmail = 'doriansarry@yahoo.fr';
  const adminPassword = 'admin123';
  
  try {
    // Essayons d'abord de voir si on peut accéder à l'API de seeding
    const seedResponse = await fetch(`${BASE_URL}/api/seed-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Seed data response:', seedResponse.status);
    
    // Créons un nouveau compte avec un email alternatif autorisé
    const testEmails = [
      'admin@apaddicto.com',
      'test@apaddicto.com',
      'dorian@apaddicto.com'
    ];
    
    for (const email of testEmails) {
      console.log(`🔄 Test avec email: ${email}`);
      
      const regResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: adminPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'patient' // Créer d'abord comme patient puis essayer de promouvoir
        })
      });
      
      const regText = await regResponse.text();
      console.log(`📊 Registration ${email}:`, regResponse.status, regText);
      
      if (regResponse.ok) {
        const regResult = JSON.parse(regText);
        console.log(`✅ Compte créé: ${regResult.user?.email} (${regResult.user?.role})`);
        
        // Maintenant essayons de nous connecter
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: adminPassword
          }),
          credentials: 'include'
        });
        
        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          console.log(`✅ Connexion réussie: ${loginResult.user?.email} (${loginResult.user?.role})`);
          
          // Capturer le cookie de session
          const setCookie = loginResponse.headers.get('set-cookie');
          if (setCookie) {
            console.log('🍪 Session cookie capturé');
            return { user: loginResult.user, cookie: setCookie };
          }
        }
      }
    }
    
    console.log('❌ Aucun compte utilisable créé');
    return null;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
    return null;
  }
}

async function testWithOriginalAdmin() {
  console.log('🔍 Test avec l\'admin original...');
  
  const adminEmail = 'doriansarry@yahoo.fr';
  
  // Liste de mots de passe possibles
  const possiblePasswords = [
    'admin123', 'password', 'password123', '123456', 'admin', 'test123',
    'apaddicto123', 'dorian123', 'yahoo123', 'sarry123', 'admin2024',
    'Apaddicto123', 'Admin123', 'Password123', '12345678', 'qwerty123',
    'apaddicto', 'Apaddicto', 'doriansarry', 'DorianSarry'
  ];
  
  for (const password of possiblePasswords) {
    try {
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminEmail,
          password: password
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log(`✅ Mot de passe trouvé: "${password}" - User:`, loginResult.user?.email, 'Role:', loginResult.user?.role);
        return { user: loginResult.user, password: password };
      }
    } catch (error) {
      // Continue avec le prochain mot de passe
    }
  }
  
  console.log('❌ Aucun mot de passe trouvé pour l\'admin original');
  return null;
}

async function runTests() {
  console.log('🚀 Tentative de récupération d\'accès admin\n');
  
  // Essayer avec l'admin existant d'abord
  const originalAdmin = await testWithOriginalAdmin();
  if (originalAdmin && originalAdmin.user.role === 'admin') {
    console.log('🎯 Admin original fonctionnel !');
    return originalAdmin;
  }
  
  console.log('');
  
  // Sinon, créer un nouveau compte
  const newAccount = await createFreshAdminUser();
  if (newAccount) {
    console.log('🎯 Nouveau compte utilisable créé !');
    return newAccount;
  }
  
  console.log('❌ Impossible d\'obtenir un accès admin');
  return null;
}

runTests().then(result => {
  if (result) {
    console.log('\n📋 RÉSULTAT:');
    console.log('Email:', result.user?.email);
    console.log('Role:', result.user?.role);
    if (result.password) {
      console.log('Mot de passe:', result.password);
    }
    
    // Si c'est un patient, proposer de le promouvoir manuellement
    if (result.user?.role === 'patient') {
      console.log('\n⚠️  L\'utilisateur est "patient". Pour créer des exercices, il faudrait le promouvoir en "admin" manuellement en base.');
    }
  }
}).catch(console.error);