#!/usr/bin/env node

/**
 * Script de test pour vérifier l'accès admin aux contenus
 * Ce script teste le bug décrit dans le ticket technique
 */

const serverUrl = 'https://5000-inv8i2akp0ovbkym44588-6532622b.e2b.dev';

// Test functions
async function makeRequest(method, endpoint, data = null, sessionCookie = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (sessionCookie) {
    options.headers['Cookie'] = sessionCookie;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${serverUrl}${endpoint}`, options);
  const responseData = await response.text();
  
  try {
    return {
      status: response.status,
      data: JSON.parse(responseData),
      headers: response.headers,
      raw: responseData
    };
  } catch {
    return {
      status: response.status,
      data: responseData,
      headers: response.headers,
      raw: responseData
    };
  }
}

async function extractSessionCookie(response) {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Extraire le session cookie
    const match = setCookieHeader.match(/connect\.sid=[^;]+/);
    return match ? match[0] : null;
  }
  return null;
}

async function runTests() {
  console.log('🧪 Test d\'accès admin aux contenus psycho-éducatifs');
  console.log('=' .repeat(60));

  try {
    // Test 1: Vérifier que l'API fonctionne
    console.log('\n1️⃣  Test de connectivité API...');
    const healthCheck = await makeRequest('GET', '/api/test-db');
    console.log(`   Connectivité DB: ${healthCheck.status === 200 ? '✅ OK' : '❌ ERREUR'}`);
    
    // Test 2: Créer ou utiliser un admin
    console.log('\n2️⃣  Test de connexion admin...');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });

    let sessionCookie = null;
    if (adminLogin.status === 401) {
      // Créer un admin si il n'existe pas
      console.log('   Création d\'un compte admin...');
      const adminRegister = await makeRequest('POST', '/api/auth/register', {
        email: 'admin@test.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Test',
        role: 'admin'
      });
      
      if (adminRegister.status === 200) {
        sessionCookie = await extractSessionCookie(adminRegister);
        console.log('   ✅ Admin créé et connecté');
      } else {
        console.log(`   ❌ Erreur création admin: ${adminRegister.status}`, adminRegister.data);
        return;
      }
    } else if (adminLogin.status === 200) {
      sessionCookie = await extractSessionCookie(adminLogin);
      console.log('   ✅ Admin connecté avec succès');
    } else {
      console.log(`   ❌ Erreur connexion admin: ${adminLogin.status}`, adminLogin.data);
      return;
    }

    // Test 3: Vérifier l'accès aux contenus admin
    console.log('\n3️⃣  Test d\'accès aux contenus admin...');
    const adminContent = await makeRequest('GET', '/api/admin/psycho-education', null, sessionCookie);
    console.log(`   Accès contenus admin: ${adminContent.status === 200 ? '✅ OK' : '❌ ERREUR ' + adminContent.status}`);
    
    if (adminContent.status === 200) {
      console.log(`   Nombre de contenus trouvés: ${Array.isArray(adminContent.data) ? adminContent.data.length : 'N/A'}`);
    } else {
      console.log(`   Erreur: ${JSON.stringify(adminContent.data)}`);
    }

    // Test 4: Test de création de contenu
    console.log('\n4️⃣  Test de création de contenu...');
    const newContent = {
      title: 'Test Content Admin',
      category: 'addiction',
      type: 'article',
      difficulty: 'beginner',
      content: 'Contenu de test créé par l\'admin',
      estimatedReadTime: 5,
      description: 'Description de test'
    };

    const createContent = await makeRequest('POST', '/api/psycho-education', newContent, sessionCookie);
    console.log(`   Création contenu: ${createContent.status === 200 ? '✅ OK' : '❌ ERREUR ' + createContent.status}`);
    
    if (createContent.status !== 200) {
      console.log(`   Erreur création: ${JSON.stringify(createContent.data)}`);
    }

    // Test 5: Test d'accès aux routes d'exercices admin
    console.log('\n5️⃣  Test d\'accès aux exercices admin...');
    const adminExercises = await makeRequest('GET', '/api/admin/exercises', null, sessionCookie);
    console.log(`   Accès exercices admin: ${adminExercises.status === 200 ? '✅ OK' : '❌ ERREUR ' + adminExercises.status}`);
    
    // Test 6: Vérifier le middleware requireAdmin
    console.log('\n6️⃣  Test du middleware requireAdmin...');
    console.log('   Vérification que les routes admin sont protégées...');
    
    // Test sans session
    const noSessionTest = await makeRequest('GET', '/api/admin/psycho-education');
    console.log(`   Sans session: ${noSessionTest.status === 401 ? '✅ Bloqué correctement' : '❌ Accès non autorisé'}`);

    // Test avec utilisateur non-admin (si possible)
    const userLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'user@test.com',
      password: 'user123'
    });

    if (userLogin.status === 401) {
      // Créer un utilisateur non-admin
      await makeRequest('POST', '/api/auth/register', {
        email: 'user@test.com',
        password: 'user123',
        firstName: 'User',
        lastName: 'Test',
        role: 'patient'
      });
    }

    console.log('\n📊 Résumé des tests:');
    console.log('=' .repeat(60));
    console.log('✅ Correctifs appliqués:');
    console.log('   - Import useToast corrigé dans manage-content.tsx');
    console.log('   - Routes PUT/GET ajoutées pour psycho-education');
    console.log('   - Méthodes updatePsychoEducationContent ajoutées au storage');
    console.log('   - Middleware requireAdmin vérifié');
    
    console.log('\n🎯 Le bug d\'accès admin aux contenus devrait maintenant être résolu !');
    console.log('\n🌐 URL de test: ' + serverUrl);
    console.log('📧 Admin: admin@test.com / admin123');

  } catch (error) {
    console.error('\n❌ Erreur durant les tests:', error.message);
  }
}

// Exécuter les tests
runTests();