/**
 * Test E2E pour vérifier l'accès admin et les permissions
 * Ce test garantit que :
 * 1. L'utilisateur admin peut se connecter
 * 2. L'utilisateur admin peut accéder aux routes admin
 * 3. L'utilisateur admin peut créer/modifier/supprimer du contenu
 * 4. Les non-admins sont correctement bloqués
 */

const BASE_URL = process.env.TEST_URL || 'https://5000-ilapbjkrystmb2nqgyggh-6532622b.e2b.dev';

// Credentials de test
const ADMIN_CREDS = {
  email: 'admin@apaddcito.com',
  password: 'admin123'
};

const USER_CREDS = {
  email: 'user@test.com', 
  password: 'user123'
};

class AdminAccessTester {
  constructor() {
    this.cookieJar = new Map();
  }

  async makeRequest(method, endpoint, data = null, cookies = true) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && this.getCookieHeader())
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    // Sauvegarder les cookies de session
    if (cookies && response.headers.get('set-cookie')) {
      this.saveCookies(response.headers.get('set-cookie'));
    }

    const result = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data: result
    };
  }

  getCookieHeader() {
    const cookies = Array.from(this.cookieJar.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    return cookies ? { Cookie: cookies } : {};
  }

  saveCookies(setCookieHeader) {
    if (setCookieHeader) {
      const cookies = setCookieHeader.split(',');
      cookies.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          this.cookieJar.set(name.trim(), value.trim());
        }
      });
    }
  }

  async testAdminLogin() {
    console.log('🧪 Test: Connexion admin...');
    
    const result = await this.makeRequest('POST', '/api/auth/login', ADMIN_CREDS);
    
    if (!result.ok) {
      throw new Error(`Login admin échoué: ${result.status} - ${JSON.stringify(result.data)}`);
    }

    if (!result.data.user || result.data.user.role !== 'admin') {
      throw new Error(`Utilisateur connecté n'est pas admin: ${JSON.stringify(result.data.user)}`);
    }

    console.log('✅ Connexion admin réussie');
    return result.data.user;
  }

  async testAdminRouteAccess() {
    console.log('🧪 Test: Accès aux routes admin...');

    // Test accès psycho-education admin
    const psychoResult = await this.makeRequest('GET', '/api/admin/psycho-education');
    if (!psychoResult.ok) {
      throw new Error(`Accès admin psycho-education échoué: ${psychoResult.status}`);
    }

    // Test accès exercises admin  
    const exerciseResult = await this.makeRequest('GET', '/api/admin/exercises');
    if (!exerciseResult.ok) {
      throw new Error(`Accès admin exercises échoué: ${exerciseResult.status}`);
    }

    // Test accès users admin
    const usersResult = await this.makeRequest('GET', '/api/admin/users');
    if (!usersResult.ok) {
      throw new Error(`Accès admin users échoué: ${usersResult.status}`);
    }

    console.log('✅ Toutes les routes admin accessibles');
    console.log(`   - ${psychoResult.data.length} contenus psycho-éducatifs`);
    console.log(`   - ${exerciseResult.data.length} exercices`);
    console.log(`   - ${usersResult.data.length} utilisateurs`);
    
    return {
      psychoContent: psychoResult.data,
      exercises: exerciseResult.data,
      users: usersResult.data
    };
  }

  async testContentCreation() {
    console.log('🧪 Test: Création de contenu par admin...');

    const testContent = {
      title: `Test Admin Content ${Date.now()}`,
      content: 'Ceci est un test de création de contenu par l\'admin pour vérifier les permissions.',
      category: 'addiction',
      type: 'article', 
      difficulty: 'beginner',
      estimatedReadTime: 5
    };

    const result = await this.makeRequest('POST', '/api/psycho-education', testContent);
    
    if (!result.ok) {
      throw new Error(`Création de contenu échoué: ${result.status} - ${JSON.stringify(result.data)}`);
    }

    console.log('✅ Création de contenu réussie');
    console.log(`   - ID: ${result.data.id}`);
    console.log(`   - Titre: ${result.data.title}`);
    
    return result.data;
  }

  async testExerciseCreation() {
    console.log('🧪 Test: Création d\'exercice par admin...');

    const testExercise = {
      title: `Test Admin Exercise ${Date.now()}`,
      description: 'Exercice de test créé par l\'admin pour vérifier les permissions.',
      category: 'cardio',
      difficulty: 'beginner',
      duration: 10,
      instructions: 'Instructions de test pour l\'exercice admin.',
      benefits: 'Bénéfices de test pour l\'exercice admin.'
    };

    const result = await this.makeRequest('POST', '/api/exercises', testExercise);
    
    if (!result.ok) {
      throw new Error(`Création d'exercice échoué: ${result.status} - ${JSON.stringify(result.data)}`);
    }

    console.log('✅ Création d\'exercice réussie');
    console.log(`   - ID: ${result.data.id}`);
    console.log(`   - Titre: ${result.data.title}`);
    
    return result.data;
  }

  async testNonAdminBlocked() {
    console.log('🧪 Test: Blocage des non-admins...');
    
    // Créer un utilisateur non-admin pour le test
    await this.makeRequest('POST', '/api/auth/register', {
      ...USER_CREDS,
      firstName: 'Test',
      lastName: 'User',
      role: 'patient'
    }, false);

    // Se connecter avec l'utilisateur non-admin
    this.cookieJar.clear(); // Clear admin session
    const loginResult = await this.makeRequest('POST', '/api/auth/login', USER_CREDS);
    
    if (!loginResult.ok) {
      console.log('⚠️  Pas pu créer/connecter utilisateur test, test partiel');
      return;
    }

    // Tenter d'accéder aux routes admin (doit échouer)
    const blockedResult = await this.makeRequest('GET', '/api/admin/psycho-education');
    
    if (blockedResult.ok || blockedResult.status !== 403) {
      throw new Error(`Non-admin a pu accéder aux routes admin! Status: ${blockedResult.status}`);
    }

    console.log('✅ Non-admins correctement bloqués');
  }

  async runAllTests() {
    console.log('🚀 Début des tests d\'accès admin...\n');
    
    const results = {
      success: [],
      failures: []
    };

    const tests = [
      { name: 'Admin Login', fn: () => this.testAdminLogin() },
      { name: 'Admin Route Access', fn: () => this.testAdminRouteAccess() },
      { name: 'Content Creation', fn: () => this.testContentCreation() },
      { name: 'Exercise Creation', fn: () => this.testExerciseCreation() },
      { name: 'Non-Admin Blocked', fn: () => this.testNonAdminBlocked() }
    ];

    for (const test of tests) {
      try {
        await test.fn();
        results.success.push(test.name);
      } catch (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
        results.failures.push({ name: test.name, error: error.message });
      }
      console.log(''); // Ligne vide entre les tests
    }

    // Résumé final
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log(`✅ Réussis: ${results.success.length}`);
    console.log(`❌ Échecs: ${results.failures.length}`);
    
    if (results.failures.length > 0) {
      console.log('\n💥 ÉCHECS DÉTAILLÉS:');
      results.failures.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.error}`);
      });
    }

    const success = results.failures.length === 0;
    console.log(`\n${success ? '🎉' : '💥'} Tests ${success ? 'RÉUSSIS' : 'ÉCHOUÉS'}`);
    
    return success;
  }
}

// Exécuter les tests si le script est lancé directement
async function main() {
  const tester = new AdminAccessTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

// Exécuter automatiquement si le script est lancé directement
main().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});