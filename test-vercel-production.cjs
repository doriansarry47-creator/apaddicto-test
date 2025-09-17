#!/usr/bin/env node

const https = require('https');
const http = require('http');

class VercelTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.cookies = [];
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.cookies.join('; '),
          'User-Agent': 'Apaddicto-Test/1.0'
        }
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const client = isHttps ? https : http;
      const req = client.request(options, (res) => {
        // Capturer les cookies
        if (res.headers['set-cookie']) {
          res.headers['set-cookie'].forEach(cookie => {
            const cookieParts = cookie.split(';')[0];
            const cookieName = cookieParts.split('=')[0];
            
            // Remplacer ou ajouter cookie
            const existingIndex = this.cookies.findIndex(c => c.split('=')[0] === cookieName);
            if (existingIndex >= 0) {
              this.cookies[existingIndex] = cookieParts;
            } else {
              this.cookies.push(cookieParts);
            }
          });
        }

        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: jsonBody,
              rawBody: body
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: {},
              rawBody: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async testProductionAuth() {
    console.log(`🚀 Test de l'authentification sur Vercel: ${this.baseUrl}\n`);

    // 1. Test de la page d'accueil (devrait rediriger vers login)
    console.log('1️⃣ Test page d\'accueil...');
    try {
      const homeResponse = await this.makeRequest('GET', '/');
      console.log(`   Status: ${homeResponse.status}`);
      
      if (homeResponse.status === 200 && homeResponse.rawBody.includes('login')) {
        console.log('   ✅ Redirection vers login fonctionne');
      } else {
        console.log('   ⚠️ Réponse inattendue pour la page d\'accueil');
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }

    console.log('');

    // 2. Test API de santé
    console.log('2️⃣ Test API de santé...');
    try {
      const healthResponse = await this.makeRequest('GET', '/api/health');
      console.log(`   Status: ${healthResponse.status}`);
      
      if (healthResponse.status === 200) {
        console.log('   ✅ API fonctionnelle');
      } else {
        console.log('   ❌ API non disponible');
      }
    } catch (error) {
      console.log(`   ❌ Erreur API: ${error.message}`);
    }

    console.log('');

    // 3. Test inscription
    console.log('3️⃣ Test inscription...');
    const testUser = {
      email: `vercel.test.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Vercel',
      lastName: 'Tester',
      role: 'patient'
    };

    try {
      const registerResponse = await this.makeRequest('POST', '/api/auth/register', testUser);
      console.log(`   Status: ${registerResponse.status}`);
      
      if (registerResponse.status === 200 && registerResponse.body.user) {
        console.log(`   ✅ Inscription réussie: ${registerResponse.body.user.email}`);
      } else {
        console.log(`   ❌ Inscription échouée: ${JSON.stringify(registerResponse.body)}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Erreur inscription: ${error.message}`);
      return false;
    }

    console.log('');

    // 4. Test vérification authentification
    console.log('4️⃣ Test vérification authentification...');
    try {
      const authResponse = await this.makeRequest('GET', '/api/auth/me');
      console.log(`   Status: ${authResponse.status}`);
      
      if (authResponse.status === 200 && authResponse.body.user) {
        console.log(`   ✅ Utilisateur authentifié: ${authResponse.body.user.email}`);
      } else {
        console.log(`   ❌ Problème authentification: ${JSON.stringify(authResponse.body)}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur vérification: ${error.message}`);
    }

    console.log('');

    // 5. Test endpoints protégés
    console.log('5️⃣ Test endpoints protégés...');
    const endpoints = ['/api/exercises', '/api/cravings/stats'];
    let allEndpointsWork = true;

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest('GET', endpoint);
        if (response.status === 200) {
          console.log(`   ✅ ${endpoint}: OK`);
        } else {
          console.log(`   ❌ ${endpoint}: Status ${response.status}`);
          allEndpointsWork = false;
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: Erreur ${error.message}`);
        allEndpointsWork = false;
      }
    }

    console.log('');

    // 6. Test déconnexion
    console.log('6️⃣ Test déconnexion...');
    try {
      const logoutResponse = await this.makeRequest('POST', '/api/auth/logout');
      console.log(`   Status logout: ${logoutResponse.status}`);
      
      if (logoutResponse.status === 200) {
        // Vérifier que l'utilisateur est bien déconnecté
        const authCheckResponse = await this.makeRequest('GET', '/api/auth/me');
        if (authCheckResponse.status === 401) {
          console.log('   ✅ Déconnexion complète réussie');
        } else {
          console.log('   ❌ Utilisateur toujours connecté après déconnexion');
          allEndpointsWork = false;
        }
      } else {
        console.log('   ❌ Échec déconnexion');
        allEndpointsWork = false;
      }
    } catch (error) {
      console.log(`   ❌ Erreur déconnexion: ${error.message}`);
      allEndpointsWork = false;
    }

    console.log('');
    console.log('=' * 60);
    console.log('📊 RÉSULTATS FINAUX');
    console.log('=' * 60);

    if (allEndpointsWork) {
      console.log('🎉 SUCCÈS COMPLET! L\'application Vercel fonctionne parfaitement.');
      console.log('✅ Inscription, connexion, authentification et déconnexion OK');
      console.log('✅ Tous les endpoints protégés sont accessibles');
      console.log('');
      console.log('🌐 L\'application est prête pour les utilisateurs!');
      return true;
    } else {
      console.log('❌ Des problèmes ont été détectés sur l\'environnement Vercel');
      return false;
    }
  }
}

// Fonction principale
async function main() {
  const vercelUrl = process.argv[2];
  
  if (!vercelUrl) {
    console.log('❌ Usage: node test-vercel-production.cjs <VERCEL_URL>');
    console.log('   Exemple: node test-vercel-production.cjs https://apaddicto-test.vercel.app');
    process.exit(1);
  }

  const tester = new VercelTester(vercelUrl);
  
  try {
    const success = await tester.testProductionAuth();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { VercelTester };